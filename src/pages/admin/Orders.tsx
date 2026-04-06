import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    toast.info("Order status update requires admin privileges via Supabase dashboard.");
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || (o.guest_phone || "").includes(search);
    const matchStatus = statusFilter === "all" || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string) => {
    const map: Record<string, string> = { pending: "bg-warning/20 text-warning", processing: "bg-accent/20 text-accent", shipped: "bg-primary/20 text-primary", delivered: "bg-success/20 text-success", cancelled: "bg-destructive/20 text-destructive" };
    return map[s] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search orders..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-secondary/50"><th className="text-left p-3 font-medium">Order</th><th className="text-left p-3 font-medium">Customer</th><th className="text-left p-3 font-medium">Date</th><th className="text-left p-3 font-medium">Status</th><th className="text-left p-3 font-medium">Payment</th><th className="text-right p-3 font-medium">Total</th><th className="p-3"></th></tr></thead>
          <tbody>
            {filtered.map((o) => {
              const addr = o.shipping_address as any;
              return (
                <tr key={o.id} className="border-b hover:bg-secondary/30">
                  <td className="p-3 font-medium">{o.order_number}</td>
                  <td className="p-3"><p>{addr?.name || "Guest"}</p><p className="text-xs text-muted-foreground">{o.guest_phone || o.guest_email}</p></td>
                  <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(o.order_status)}`}>{o.order_status}</span></td>
                  <td className="p-3"><span className="text-xs capitalize">{o.payment_method}</span></td>
                  <td className="p-3 text-right font-medium">৳{Number(o.total).toLocaleString()}</td>
                  <td className="p-3"><Button size="sm" variant="ghost" onClick={() => setSelectedOrder(o)}><Eye className="h-4 w-4" /></Button></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order {selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Status</span><p className="font-medium capitalize">{selectedOrder.order_status}</p></div>
                <div><span className="text-muted-foreground">Payment</span><p className="font-medium capitalize">{selectedOrder.payment_method}</p></div>
                <div><span className="text-muted-foreground">Date</span><p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Total</span><p className="font-bold text-accent">৳{Number(selectedOrder.total).toLocaleString()}</p></div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Items</h4>
                {(selectedOrder.items as any[]).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1"><span>{item.name} x{item.quantity}</span><span>৳{(item.price * item.quantity).toLocaleString()}</span></div>
                ))}
              </div>
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Shipping</h4>
                <p>{(selectedOrder.shipping_address as any)?.name}</p>
                <p className="text-muted-foreground">{(selectedOrder.shipping_address as any)?.address}, {(selectedOrder.shipping_address as any)?.city}</p>
                <p className="text-muted-foreground">{selectedOrder.guest_phone}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
