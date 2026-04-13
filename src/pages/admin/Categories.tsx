import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, FolderTree, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SingleImageUpload from "@/components/admin/SingleImageUpload";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [editCat, setEditCat] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const save = async () => {
    if (!editCat.name) { toast.error("Name is required"); return; }
    setSaving(true);
    const slug = editCat.slug || generateSlug(editCat.name);
    const payload = { name: editCat.name, slug, description: editCat.description || null, image_url: editCat.image_url || null, sort_order: editCat.sort_order || 0 };

    if (isNew) {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) toast.error(error.message); else { toast.success("Category created!"); setEditCat(null); fetchCategories(); }
    } else {
      const { error } = await supabase.from("categories").update(payload).eq("id", editCat.id);
      if (error) toast.error(error.message); else { toast.success("Category updated!"); setEditCat(null); fetchCategories(); }
    }
    setSaving(false);
  };

  const deleteCat = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); fetchCategories(); }
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = useCallback(async (dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const reordered = [...categories];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    // Update local state immediately
    setCategories(reordered);
    setDraggedIdx(null);
    setDragOverIdx(null);

    // Persist new sort_order to DB
    const updates = reordered.map((cat, i) => 
      supabase.from("categories").update({ sort_order: i }).eq("id", cat.id)
    );
    
    await Promise.all(updates);
    toast.success("Category order updated!");
  }, [draggedIdx, categories]);

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
          <p className="text-sm text-muted-foreground">Drag to reorder • Lower position = shows first on homepage</p>
        </div>
        <Button className="rounded-full" onClick={() => { setEditCat({ name: "", slug: "", description: "", image_url: "", sort_order: categories.length }); setIsNew(true); }}>
          <Plus className="h-4 w-4 mr-1" />Add Category
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((c, idx) => (
          <Card
            key={c.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
            className={`p-4 flex items-center justify-between cursor-grab active:cursor-grabbing transition-all ${
              draggedIdx === idx ? "opacity-50 scale-[0.98]" : ""
            } ${dragOverIdx === idx && draggedIdx !== idx ? "border-primary border-2" : ""}`}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground/50 shrink-0" />
              <span className="text-xs font-mono text-muted-foreground w-6 text-center shrink-0">{idx + 1}</span>
              {c.image_url
                ? <img src={c.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                : <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FolderTree className="h-5 w-5 text-primary" /></div>
              }
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.slug}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditCat({ ...c }); setIsNew(false); }}><Edit className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCat(c.id, c.name)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
        {categories.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">No categories yet. Create your first one!</Card>
        )}
      </div>

      <Dialog open={!!editCat} onOpenChange={() => setEditCat(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isNew ? "Add Category" : "Edit Category"}</DialogTitle></DialogHeader>
          {editCat && (
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={editCat.name} onChange={(e) => setEditCat({ ...editCat, name: e.target.value, slug: generateSlug(e.target.value) })} /></div>
              <div><Label>Slug</Label><Input value={editCat.slug} onChange={(e) => setEditCat({ ...editCat, slug: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={editCat.description || ""} onChange={(e) => setEditCat({ ...editCat, description: e.target.value })} /></div>
              <div>
                <Label>Image</Label>
                <SingleImageUpload
                  image={editCat.image_url || ""}
                  onChange={(url) => setEditCat({ ...editCat, image_url: url })}
                  folder="categories"
                />
              </div>
              <div><Label>Sort Order</Label><Input type="number" value={editCat.sort_order || 0} onChange={(e) => setEditCat({ ...editCat, sort_order: Number(e.target.value) })} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditCat(null)}>Cancel</Button>
                <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
