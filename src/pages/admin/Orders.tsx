import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, MoreHorizontal, Printer, Truck, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUS_OPTIONS = ["pending", "partial", "paid", "refunded"] as const;

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from("orders").update({ order_status: status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    }
    setUpdatingId(null);
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast.error("Failed to update payment status");
    } else {
      toast.success(`Payment status updated to ${status}`);
      fetchOrders();
    }
  };

  const filtered = orders.filter((o) => {
    const addr = o.shipping_address as any;
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.guest_phone || "").includes(search) ||
      (addr?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-warning/15 text-warning border-warning/30",
      processing: "bg-accent/15 text-accent border-accent/30",
      shipped: "bg-primary/15 text-primary border-primary/30",
      delivered: "bg-success/15 text-success border-success/30",
      cancelled: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  const paymentBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-warning/15 text-warning border-warning/30",
      partial: "bg-accent/15 text-accent border-accent/30",
      paid: "bg-success/15 text-success border-success/30",
      refunded: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  const totalItems = (items: any[]) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-sm text-muted-foreground">View all orders and manage them ({orders.length} total)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone or order number..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Items</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Payment</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const addr = o.shipping_address as any;
              const items = Array.isArray(o.items) ? o.items : [];
              return (
                <tr key={o.id} className="border-b hover:bg-secondary/30 transition-colors">
                  <td className="p-3 font-mono font-medium text-sm">{o.order_number}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-sm">{addr?.name || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">{o.guest_phone || o.guest_email || "N/A"}</p>
                    </div>
                  </td>
                  <td className="p-3 text-center">{totalItems(items)} items</td>
                  <td className="p-3 font-semibold">৳{Number(o.total).toLocaleString()}</td>
                  <td className="p-3">
                    <Select
                      value={o.order_status}
                      onValueChange={(val) => updateOrderStatus(o.id, val)}
                      disabled={updatingId === o.id}
                    >
                      <SelectTrigger className={`h-7 text-xs w-28 border ${statusBadge(o.order_status)} rounded-full`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={`text-xs capitalize ${paymentBadge(o.payment_status)}`}>
                      {o.payment_status}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOrder(o)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updatePaymentStatus(o.id, "paid")}>
                          <CreditCardIcon className="h-4 w-4 mr-2" />Mark Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(o.id, "cancelled")} className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" />Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order {selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-xs">Status</span>
                  <p className="font-medium capitalize">{selectedOrder.order_status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Payment</span>
                  <p className="font-medium capitalize">{selectedOrder.payment_method} ({selectedOrder.payment_status})</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Date</span>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Total</span>
                  <p className="font-bold text-accent text-lg">৳{Number(selectedOrder.total).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Order Items</h4>
                {(selectedOrder.items as any[]).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1.5 border-b last:border-0">
                    <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-semibold">
                  <span>Delivery</span>
                  <span>৳{Number(selectedOrder.delivery_charge).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p className="font-medium">{(selectedOrder.shipping_address as any)?.name}</p>
                <p className="text-muted-foreground">{(selectedOrder.shipping_address as any)?.address}, {(selectedOrder.shipping_address as any)?.city}</p>
                <p className="text-muted-foreground">{selectedOrder.guest_phone}</p>
              </div>

              {selectedOrder.notes && (
                <div className="border-t pt-3">
                  <h4 className="font-medium mb-1">Notes</h4>
                  <p className="text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Quick actions */}
              <div className="border-t pt-3 flex gap-2">
                <Select value={selectedOrder.order_status} onValueChange={(val) => { updateOrderStatus(selectedOrder.id, val); setSelectedOrder({ ...selectedOrder, order_status: val }); }}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedOrder.payment_status} onValueChange={(val) => { updatePaymentStatus(selectedOrder.id, val); setSelectedOrder({ ...selectedOrder, payment_status: val }); }}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

export default AdminOrders;
