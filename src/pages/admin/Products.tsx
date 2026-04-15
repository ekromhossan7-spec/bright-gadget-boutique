import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Save } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import ColorVariantEditor, { type ColorVariant } from "@/components/admin/ColorVariantEditor";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";

const emptyProduct = {
  name: "", slug: "", price: 0, compare_price: null as number | null,
  description: "", short_description: "", sku: "",
  stock_quantity: 0, in_stock: true, featured: false,
  category_id: null as string | null, images: [] as string[], tags: [] as string[],
  color_variants: [] as ColorVariant[],
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditProduct({ ...emptyProduct });
      setIsNew(true);
      setSearchParams({});
    }
  }, [searchParams]);

  const openNew = () => { setEditProduct({ ...emptyProduct }); setIsNew(true); };
  const openEdit = (p: any) => { setEditProduct({ ...p }); setIsNew(false); };
  const close = () => { setEditProduct(null); setIsNew(false); };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const save = async () => {
    if (!editProduct.name || !editProduct.price) { toast.error("Name and price are required"); return; }
    setSaving(true);
    const slug = editProduct.slug || generateSlug(editProduct.name);
    const payload = { ...editProduct, slug, updated_at: new Date().toISOString() };
    delete payload.id; delete payload.created_at;

    if (isNew) {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); } else { toast.success("Product created!"); close(); fetchData(); }
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
      if (error) { toast.error(error.message); } else { toast.success("Product updated!"); close(); fetchData(); }
    }
    setSaving(false);
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); } else { toast.success("Product deleted"); fetchData(); }
  };


  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products ({products.length})</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button className="rounded-full" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Add Product</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Featured</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-secondary/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium line-clamp-1">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku || "No SKU"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="font-medium">৳{p.price.toLocaleString()}</span>
                  {p.compare_price && <span className="text-xs text-muted-foreground line-through ml-1">৳{p.compare_price.toLocaleString()}</span>}
                </td>
                <td className="p-3">{p.stock_quantity || 0}</td>
                <td className="p-3">
                  {p.in_stock
                    ? <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-xs">In Stock</Badge>
                    : <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-xs">Out of Stock</Badge>}
                </td>
                <td className="p-3">{p.featured && <Badge className="bg-warning/15 text-warning border-warning/30 text-xs" variant="outline">Featured</Badge>}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteProduct(p.id, p.name)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found</td></tr>}
          </tbody>
        </table>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={!!editProduct} onOpenChange={close}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{isNew ? "Add New Product" : "Edit Product"}</DialogTitle></DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Product Name *</Label>
                  <Input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value, slug: generateSlug(e.target.value) })} />
                </div>
                <div>
                  <Label>Price (৳) *</Label>
                  <Input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Compare Price (৳)</Label>
                  <Input type="number" value={editProduct.compare_price || ""} onChange={(e) => setEditProduct({ ...editProduct, compare_price: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={editProduct.sku || ""} onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })} />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input type="number" value={editProduct.stock_quantity || 0} onChange={(e) => setEditProduct({ ...editProduct, stock_quantity: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={editProduct.category_id || "none"} onValueChange={(v) => setEditProduct({ ...editProduct, category_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={editProduct.slug || ""} onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Short Description</Label>
                  <Input value={editProduct.short_description || ""} onChange={(e) => setEditProduct({ ...editProduct, short_description: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea rows={4} value={editProduct.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
                </div>
              </div>

              {/* Images */}
              <div>
                <Label>Images</Label>
                <ImageUpload
                  images={editProduct.images || []}
                  onChange={(imgs) => setEditProduct({ ...editProduct, images: imgs })}
                />
              </div>

              {/* Color Variants */}
              <ColorVariantEditor
                variants={editProduct.color_variants || []}
                onChange={(variants) => setEditProduct({ ...editProduct, color_variants: variants })}
              />

              {/* Toggles */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={editProduct.in_stock} onCheckedChange={(v) => setEditProduct({ ...editProduct, in_stock: v })} />
                  <Label>In Stock</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editProduct.featured} onCheckedChange={(v) => setEditProduct({ ...editProduct, featured: v })} />
                  <Label>Featured</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={close}>Cancel</Button>
                <Button onClick={save} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
