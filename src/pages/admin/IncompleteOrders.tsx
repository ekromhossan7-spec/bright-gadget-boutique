import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, ShoppingCart, Trash2, Eye, ArrowRightCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AbandonedCheckout {
  id: string;
  session_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  area: string | null;
  notes: string | null;
  payment_method: string | null;
  items: any;
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: string;
  recovered_order_id: string | null;
  recovered_at: string | null;
  created_at: string;
  updated_at: string;
}

const IncompleteOrders = () => {
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheckout, setSelectedCheckout] = useState<AbandonedCheckout | null>(null);
  const [converting, setConverting] = useState(false);
  const [filter, setFilter] = useState<"abandoned" | "recovered" | "all">("abandoned");

  const fetchCheckouts = async () => {
    setLoading(true);
    let query = supabase
      .from("abandoned_checkouts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (filter === "abandoned") query = query.eq("status", "abandoned");
    else if (filter === "recovered") query = query.eq("status", "recovered");

    const { data } = await query;
    setCheckouts((data as AbandonedCheckout[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCheckouts(); }, [filter]);

  const convertToOrder = async (checkout: AbandonedCheckout) => {
    if (!checkout.name || !checkout.phone) {
      toast.error("Name and phone are required to convert to order");
      return;
    }
    setConverting(true);
    try {
      const orderNumber = `TL-${Date.now().toString(36).toUpperCase()}`;
      const { data: orderData, error: orderError } = await supabase.from("orders").insert({
        order_number: orderNumber,
        user_id: null,
        guest_email: checkout.email,
        guest_phone: checkout.phone,
        items: checkout.items,
        subtotal: checkout.subtotal,
        delivery_charge: checkout.delivery_charge,
        total: checkout.total,
        payment_method: checkout.payment_method || "cod",
        payment_status: "pending",
        order_status: "pending",
        shipping_address: { name: checkout.name, phone: checkout.phone, address: checkout.address, city: checkout.city, area: checkout.area },
        notes: checkout.notes || "Recovered from abandoned checkout",
      }).select("id").single();

      if (orderError) throw orderError;

      await supabase
        .from("abandoned_checkouts")
        .update({
          status: "recovered",
          recovered_order_id: orderData.id,
          recovered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", checkout.id);

      toast.success(`Order ${orderNumber} created successfully!`);
      setSelectedCheckout(null);
      fetchCheckouts();
    } catch (err: any) {
      toast.error(err.message || "Failed to convert");
    } finally {
      setConverting(false);
    }
  };

  const deleteCheckout = async (id: string) => {
    await supabase.from("abandoned_checkouts").delete().eq("id", id);
    toast.success("Deleted");
    fetchCheckouts();
  };

  const stats = {
    total: checkouts.length,
    withContact: checkouts.filter((c) => c.phone || c.email).length,
    totalValue: checkouts.reduce((s, c) => s + Number(c.total), 0),
  };

  const filledFields = (c: AbandonedCheckout) => {
    const fields = ["name", "email", "phone", "address", "city"];
    return fields.filter((f) => (c as any)[f]).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Incomplete Orders</h1>
          <p className="text-sm text-muted-foreground">Track & recover abandoned checkouts</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCheckouts}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Abandoned</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">With Contact Info</p>
          <p className="text-2xl font-bold">{stats.withContact}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Potential Value</p>
          <p className="text-2xl font-bold">৳{stats.totalValue.toLocaleString()}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["abandoned", "recovered", "all"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : checkouts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No incomplete orders</p>
              </TableCell></TableRow>
            ) : checkouts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="text-sm">
                    {c.name && <p className="font-medium">{c.name}</p>}
                    {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
                    {c.email && <p className="text-muted-foreground text-xs">{c.email}</p>}
                    {!c.name && !c.phone && !c.email && <span className="text-muted-foreground italic">No contact</span>}
                  </div>
                </TableCell>
                <TableCell>
                  {Array.isArray(c.items) ? c.items.length : 0} items
                </TableCell>
                <TableCell className="font-medium">৳{Number(c.total).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < filledFields(c) ? "bg-emerald-500" : "bg-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{filledFields(c)}/5 fields</span>
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === "recovered" ? "default" : c.status === "completed" ? "secondary" : "destructive"} className="capitalize">
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(c.updated_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedCheckout(c)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {c.status === "abandoned" && (
                      <Button variant="ghost" size="icon" className="text-emerald-500" onClick={() => convertToOrder(c)}>
                        <ArrowRightCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCheckout(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCheckout} onOpenChange={() => setSelectedCheckout(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Abandoned Checkout Details</DialogTitle>
          </DialogHeader>
          {selectedCheckout && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedCheckout.name || "—"}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedCheckout.phone || "—"}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selectedCheckout.email || "—"}</span></div>
                <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{selectedCheckout.city || "—"}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{selectedCheckout.address || "—"}</span></div>
                <div><span className="text-muted-foreground">Payment:</span> <span className="font-medium capitalize">{selectedCheckout.payment_method || "—"}</span></div>
                <div><span className="text-muted-foreground">Total:</span> <span className="font-bold">৳{Number(selectedCheckout.total).toLocaleString()}</span></div>
              </div>

              {Array.isArray(selectedCheckout.items) && selectedCheckout.items.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Items:</p>
                  <div className="space-y-2">
                    {selectedCheckout.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-2">
                        {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-muted-foreground">x{item.quantity} · ৳{Number(item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCheckout.recovered_at && (
                <div className="bg-emerald-500/10 rounded-lg p-3">
                  <p className="text-emerald-600 font-medium">✓ Recovered on {new Date(selectedCheckout.recovered_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedCheckout?.status === "abandoned" && (
              <Button onClick={() => convertToOrder(selectedCheckout)} disabled={converting} className="bg-emerald-600 hover:bg-emerald-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {converting ? "Converting..." : "Convert to Order"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncompleteOrders;
