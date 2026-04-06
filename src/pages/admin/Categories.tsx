import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [editCat, setEditCat] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
  };

  useEffect(() => { fetch(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const save = async () => {
    if (!editCat.name) { toast.error("Name is required"); return; }
    setSaving(true);
    const slug = editCat.slug || generateSlug(editCat.name);
    const payload = { name: editCat.name, slug, description: editCat.description || null, image_url: editCat.image_url || null, sort_order: editCat.sort_order || 0 };

    if (isNew) {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) toast.error(error.message); else { toast.success("Category created!"); setEditCat(null); fetch(); }
    } else {
      const { error } = await supabase.from("categories").update(payload).eq("id", editCat.id);
      if (error) toast.error(error.message); else { toast.success("Category updated!"); setEditCat(null); fetch(); }
    }
    setSaving(false);
  };

  const deleteCat = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); fetch(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
          <p className="text-sm text-muted-foreground">Manage product categories</p>
        </div>
        <Button className="rounded-full" onClick={() => { setEditCat({ name: "", slug: "", description: "", image_url: "", sort_order: 0 }); setIsNew(true); }}>
          <Plus className="h-4 w-4 mr-1" />Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {c.image_url
                ? <img src={c.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                : <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FolderTree className="h-5 w-5 text-primary" /></div>
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
          <Card className="p-8 col-span-full text-center text-muted-foreground">No categories yet. Create your first one!</Card>
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
              <div><Label>Image URL</Label><Input value={editCat.image_url || ""} onChange={(e) => setEditCat({ ...editCat, image_url: e.target.value })} /></div>
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
