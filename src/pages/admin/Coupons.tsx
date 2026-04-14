import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag, Copy } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const emptyCoupon = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  max_uses: null as number | null,
  active: true,
  starts_at: "",
  expires_at: "",
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyCoupon });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data as Coupon[]);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error("Coupon code is required"); return; }
    if (form.discount_value <= 0) { toast.error("Discount value must be greater than 0"); return; }
    setSaving(true);

    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount || 0,
      max_uses: form.max_uses || null,
      active: form.active,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("coupons").update(payload).eq("id", editing));
    } else {
      ({ error } = await supabase.from("coupons").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Coupon code already exists" : error.message);
    } else {
      toast.success(editing ? "Coupon updated!" : "Coupon created!");
      setDialogOpen(false);
      setEditing(null);
      setForm({ ...emptyCoupon });
      fetchCoupons();
    }
  };

  const handleEdit = (c: Coupon) => {
    setEditing(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount || 0,
      max_uses: c.max_uses,
      active: c.active,
      starts_at: c.starts_at ? c.starts_at.split("T")[0] : "",
      expires_at: c.expires_at ? c.expires_at.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Coupon deleted"); fetchCoupons(); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active: !active }).eq("id", id);
    fetchCoupons();
  };

  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons & Discounts</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm({ ...emptyCoupon }); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="h-4 w-4 mr-2" />Add Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Coupon Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value *</Label>
                  <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Order Amount</Label>
                  <Input type="number" value={form.min_order_amount || ""} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) || 0 })} placeholder="0" />
                </div>
                <div>
                  <Label>Max Uses (empty = unlimited)</Label>
                  <Input type="number" value={form.max_uses ?? ""} onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full rounded-full" disabled={saving}>
                {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : coupons.length === 0 ? (
        <Card className="p-6 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-medium mb-2">No coupons yet</p>
          <p className="text-sm text-muted-foreground">Create your first discount coupon.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((c) => (
            <Card key={c.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-accent/10 p-2 rounded-lg"><Tag className="h-5 w-5 text-accent" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-lg">{c.code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied!"); }}><Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></button>
                    {!c.active && <Badge variant="secondary">Inactive</Badge>}
                    {isExpired(c.expires_at) && <Badge variant="destructive">Expired</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.discount_type === "percentage" ? `${c.discount_value}% off` : `৳${c.discount_value} off`}
                    {c.min_order_amount ? ` • Min ৳${c.min_order_amount}` : ""}
                    {c.max_uses ? ` • ${c.used_count}/${c.max_uses} used` : ` • ${c.used_count} used`}
                    {c.expires_at ? ` • Expires ${new Date(c.expires_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={c.active} onCheckedChange={() => toggleActive(c.id, c.active)} />
                <Button size="sm" variant="ghost" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
