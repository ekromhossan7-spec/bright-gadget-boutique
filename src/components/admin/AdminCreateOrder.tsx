import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Minus, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const AdminCreateOrder = ({ open, onOpenChange, onCreated }: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", area: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("products").select("*").order("name").then(({ data }) => {
        if (data) setProducts(data);
      });
    }
  }, [open]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (product: any) => {
    if (!product.in_stock) {
      toast.error(`"${product.name}" is out of stock`);
      return;
    }
    const existing = orderItems.find(i => i.id === product.id);
    if (existing) {
      setOrderItems(prev => prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setOrderItems(prev => [...prev, { id: product.id, name: product.name, price: product.price, image: product.images?.[0] || "", quantity: 1 }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setOrderItems(prev => prev.filter(i => i.id !== id));
    else setOrderItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone are required"); return; }
    if (orderItems.length === 0) { toast.error("Add at least one product"); return; }

    setLoading(true);
    try {
      const orderNumber = `TL-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        guest_email: form.email || null,
        guest_phone: form.phone,
        items: orderItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        subtotal,
        delivery_charge: 0,
        total: subtotal,
        payment_method: paymentMethod,
        payment_status: "pending",
        order_status: "pending",
        shipping_address: { name: form.name, phone: form.phone, address: form.address, city: form.city, area: form.area },
        notes: form.notes || null,
      });
      if (error) throw error;
      toast.success("Order created successfully!");
      onCreated();
      onOpenChange(false);
      setOrderItems([]);
      setForm({ name: "", phone: "", email: "", address: "", city: "", area: "", notes: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create New Order</DialogTitle></DialogHeader>
        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><Label>City</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
              <div><Label>Area</Label><Input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} /></div>
              <div><Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="partial">Partial Payment</SelectItem>
                    <SelectItem value="paid">Fully Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <h3 className="font-semibold mb-3">Add Products</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
            </div>
            {productSearch && (
              <div className="border rounded-lg max-h-40 overflow-y-auto mb-3">
                {filteredProducts.slice(0, 10).map(p => (
                  <button key={p.id} className="w-full flex items-center gap-3 p-2 hover:bg-secondary text-left text-sm" onClick={() => { addProduct(p); setProductSearch(""); }}>
                    <img src={p.images?.[0] || "/placeholder.svg"} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="flex-1">{p.name}</span>
                    {!p.in_stock && <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>}
                    <span className="font-medium">৳{p.price.toLocaleString()}</span>
                  </button>
                ))}
                {filteredProducts.length === 0 && <p className="p-3 text-sm text-muted-foreground text-center">No products found</p>}
              </div>
            )}

            {/* Selected Items */}
            {orderItems.length > 0 && (
              <div className="border rounded-lg divide-y">
                {orderItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3">
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <span className="text-sm font-medium w-20 text-right">৳{(item.price * item.quantity).toLocaleString()}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => updateQty(item.id, 0)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
                <div className="flex justify-between p-3 font-bold">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCreateOrder;
