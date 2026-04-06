import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, MoreHorizontal, Trash2, Ban, Plus, Undo2, Truck, RefreshCw, Loader2 } from "lucide-react";
import { FraudBadge, FraudDetail } from "@/components/admin/FraudCheck";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCreateOrder from "@/components/admin/AdminCreateOrder";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUS_OPTIONS = ["pending", "partial", "paid", "refunded"] as const;

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [sendingCourier, setSendingCourier] = useState(false);
  const [syncingStatus, setSyncingStatus] = useState(false);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const activeOrders = orders.filter(o => !o.trashed_at);
  const trashedOrders = orders.filter(o => !!o.trashed_at);
  const currentOrders = tab === "active" ? activeOrders : trashedOrders;

  const updateOrderStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from("orders").update({ order_status: status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error("Failed to update status");
    else { toast.success(`Order status updated to ${status}`); fetchOrders(); }
    setUpdatingId(null);
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error("Failed to update payment status");
    else { toast.success(`Payment status updated to ${status}`); fetchOrders(); }
  };

  const trashOrders = async (ids: string[]) => {
    const { error } = await supabase.from("orders").update({ trashed_at: new Date().toISOString() }).in("id", ids);
    if (error) toast.error("Failed to move to trash");
    else { toast.success(`${ids.length} order(s) moved to trash`); setSelectedIds(new Set()); fetchOrders(); }
  };

  const restoreOrders = async (ids: string[]) => {
    const { error } = await supabase.from("orders").update({ trashed_at: null }).in("id", ids);
    if (error) toast.error("Failed to restore");
    else { toast.success(`${ids.length} order(s) restored`); setSelectedIds(new Set()); fetchOrders(); }
  };

  const bulkUpdateStatus = async (status: string) => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("orders").update({ order_status: status, updated_at: new Date().toISOString() }).in("id", ids);
    if (error) toast.error("Failed to update status");
    else { toast.success(`${ids.length} order(s) updated to ${status}`); setSelectedIds(new Set()); fetchOrders(); }
  };

  const bulkUpdatePayment = async (status: string) => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("orders").update({ payment_status: status, updated_at: new Date().toISOString() }).in("id", ids);
    if (error) toast.error("Failed to update payment");
    else { toast.success(`${ids.length} order(s) payment updated to ${status}`); setSelectedIds(new Set()); fetchOrders(); }
  };

  const sendToSteadfast = async (orderIds: string[], bulk = false) => {
    setSendingCourier(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) { toast.error("Please login first"); return; }

      const res = await supabase.functions.invoke("steadfast-courier", {
        body: { action: bulk ? "send_bulk" : "send_single", order_ids: orderIds },
      });

      if (res.error) {
        toast.error(`Courier error: ${res.error.message}`);
      } else if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        const msg = bulk
          ? `${res.data?.sent || orderIds.length} order(s) sent to Steadfast`
          : `Order sent to Steadfast (Tracking: ${res.data?.consignment?.tracking_code || "pending"})`;
        toast.success(msg);
        setSelectedIds(new Set());
        fetchOrders();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send to courier");
    } finally {
      setSendingCourier(false);
    }
  };

  const syncCourierStatus = async () => {
    setSyncingStatus(true);
    try {
      const res = await supabase.functions.invoke("steadfast-courier", {
        body: { action: "sync_status", order_ids: [] },
      });

      if (res.error) {
        toast.error(`Sync error: ${res.error.message}`);
      } else {
        toast.success(res.data?.message || "Status synced");
        fetchOrders();
      }
    } catch (e: any) {
      toast.error("Failed to sync status");
    } finally {
      setSyncingStatus(false);
    }
  };

  const filtered = currentOrders.filter((o) => {
    const addr = o.shipping_address as any;
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.guest_phone || "").includes(search) ||
      (addr?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(o => o.id)));
  };

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-sm text-muted-foreground">{orders.length} total orders ({trashedOrders.length} trashed)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={syncCourierStatus} disabled={syncingStatus} className="gap-2">
            {syncingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync Steadfast
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />Create Order
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedIds(new Set()); }}>
        <TabsList>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({trashedOrders.length})</TabsTrigger>
        </TabsList>
      </Tabs>

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

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-secondary rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          {tab === "active" && (
            <>
              <Button size="sm" variant="default" onClick={() => sendToSteadfast(Array.from(selectedIds), true)} disabled={sendingCourier} className="gap-1">
                {sendingCourier ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                Send to Steadfast
              </Button>
              <Select onValueChange={bulkUpdateStatus}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Set Status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={bulkUpdatePayment}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Set Payment" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="destructive" onClick={() => trashOrders(Array.from(selectedIds))}>
                <Trash2 className="h-4 w-4 mr-1" />Trash
              </Button>
            </>
          )}
          {tab === "trash" && (
            <Button size="sm" variant="outline" onClick={() => restoreOrders(Array.from(selectedIds))}>
              <Undo2 className="h-4 w-4 mr-1" />Restore
            </Button>
          )}
        </div>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="p-3 w-10"><Checkbox checked={filtered.length > 0 && selectedIds.size === filtered.length} onCheckedChange={toggleAll} /></th>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Items</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Payment</th>
              <th className="text-left p-3 font-medium">Courier</th>
              <th className="text-left p-3 font-medium">Risk</th>
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
                  <td className="p-3"><Checkbox checked={selectedIds.has(o.id)} onCheckedChange={() => toggleSelect(o.id)} /></td>
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
                    <Select value={o.order_status} onValueChange={(val) => updateOrderStatus(o.id, val)} disabled={updatingId === o.id || tab === "trash"}>
                      <SelectTrigger className={`h-7 text-xs w-28 border ${statusBadge(o.order_status)} rounded-full`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={`text-xs capitalize ${paymentBadge(o.payment_status)}`}>{o.payment_status}</Badge>
                  </td>
                  <td className="p-3">
                    {o.consignment_id ? (
                      <div>
                        <Badge variant="secondary" className="text-xs">{o.courier_status || "sent"}</Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{o.tracking_code}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <FraudBadge order={o} allOrders={orders} />
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
                        <DropdownMenuItem onClick={() => setSelectedOrder(o)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                        {tab === "active" && !o.consignment_id && (
                          <DropdownMenuItem onClick={() => sendToSteadfast([o.id])} disabled={sendingCourier}>
                            <Truck className="h-4 w-4 mr-2" />Send to Steadfast
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {tab === "active" ? (
                          <>
                            <DropdownMenuItem onClick={() => updatePaymentStatus(o.id, "paid")}>
                              <CreditCardIcon className="h-4 w-4 mr-2" />Mark Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(o.id, "cancelled")} className="text-destructive">
                              <Ban className="h-4 w-4 mr-2" />Cancel Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => trashOrders([o.id])} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />Move to Trash
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => restoreOrders([o.id])}>
                            <Undo2 className="h-4 w-4 mr-2" />Restore
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">{tab === "trash" ? "Trash is empty" : "No orders found"}</td></tr>
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
                <div><span className="text-muted-foreground text-xs">Status</span><p className="font-medium capitalize">{selectedOrder.order_status}</p></div>
                <div><span className="text-muted-foreground text-xs">Payment</span><p className="font-medium capitalize">{selectedOrder.payment_method} ({selectedOrder.payment_status})</p></div>
                <div><span className="text-muted-foreground text-xs">Date</span><p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground text-xs">Total</span><p className="font-bold text-accent text-lg">৳{Number(selectedOrder.total).toLocaleString()}</p></div>
              </div>

              {/* Courier Info */}
              {selectedOrder.consignment_id && (
                <div className="border-t pt-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2"><Truck className="h-4 w-4" />Steadfast Courier</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Consignment ID</span><p className="font-mono font-medium">{selectedOrder.consignment_id}</p></div>
                    <div><span className="text-muted-foreground">Tracking Code</span><p className="font-mono font-medium">{selectedOrder.tracking_code}</p></div>
                    <div><span className="text-muted-foreground">Courier Status</span><p className="capitalize font-medium">{selectedOrder.courier_status}</p></div>
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Order Items</h4>
                {(selectedOrder.items as any[]).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1.5 border-b last:border-0">
                    <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-semibold"><span>Delivery</span><span>৳{Number(selectedOrder.delivery_charge).toLocaleString()}</span></div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p className="font-medium">{(selectedOrder.shipping_address as any)?.name}</p>
                <p className="text-muted-foreground">{(selectedOrder.shipping_address as any)?.address}, {(selectedOrder.shipping_address as any)?.city}</p>
                <p className="text-muted-foreground">{selectedOrder.guest_phone}</p>
              </div>
              {selectedOrder.notes && (
                <div className="border-t pt-3"><h4 className="font-medium mb-1">Notes</h4><p className="text-muted-foreground">{selectedOrder.notes}</p></div>
              )}
              <div className="border-t pt-3 flex gap-2">
                {!selectedOrder.consignment_id && (
                  <Button size="sm" onClick={() => { sendToSteadfast([selectedOrder.id]); setSelectedOrder(null); }} disabled={sendingCourier} className="gap-1">
                    <Truck className="h-4 w-4" />Send to Steadfast
                  </Button>
                )}
                <Select value={selectedOrder.order_status} onValueChange={(val) => { updateOrderStatus(selectedOrder.id, val); setSelectedOrder({ ...selectedOrder, order_status: val }); }}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>))}</SelectContent>
                </Select>
                <Select value={selectedOrder.payment_status} onValueChange={(val) => { updatePaymentStatus(selectedOrder.id, val); setSelectedOrder({ ...selectedOrder, payment_status: val }); }}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminCreateOrder open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchOrders} />
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
