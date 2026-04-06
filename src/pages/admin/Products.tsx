import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data) setProducts(data);
    };
    fetch();
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <Button className="rounded-full" onClick={() => toast.info("Product management requires admin privileges via Supabase dashboard.")}><Plus className="h-4 w-4 mr-1" />Add Product</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-secondary/50"><th className="text-left p-3 font-medium">Product</th><th className="text-left p-3 font-medium">Price</th><th className="text-left p-3 font-medium">Stock</th><th className="text-left p-3 font-medium">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-secondary/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div><p className="font-medium line-clamp-1">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku || "No SKU"}</p></div>
                  </div>
                </td>
                <td className="p-3 font-medium">৳{p.price.toLocaleString()}</td>
                <td className="p-3">{p.stock_quantity || 0}</td>
                <td className="p-3">{p.in_stock ? <Badge variant="outline" className="border-success text-success text-xs">In Stock</Badge> : <Badge variant="outline" className="border-destructive text-destructive text-xs">Out of Stock</Badge>}</td>
                <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products found</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AdminProducts;
