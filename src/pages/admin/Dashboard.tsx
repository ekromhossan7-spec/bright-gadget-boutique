import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCustomers: 0, pendingOrders: 0, recentOrders: [] as any[] });

  useEffect(() => {
    const fetchStats = async () => {
      const [orders, products, profiles] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const orderData = orders.data || [];
      const totalRevenue = orderData.reduce((s, o) => s + Number(o.total), 0);
      const pendingOrders = orderData.filter((o) => o.order_status === "pending").length;

      setStats({
        totalOrders: orderData.length,
        totalRevenue,
        totalProducts: products.count || 0,
        totalCustomers: profiles.count || 0,
        pendingOrders,
        recentOrders: orderData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-accent" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { label: "Customers", value: stats.totalCustomers, icon: Users, color: "text-warning" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "text-destructive" },
    { label: "Growth", value: "+12%", icon: TrendingUp, color: "text-success" },
  ];

  const statusColor = (s: string) => {
    const map: Record<string, string> = { pending: "bg-warning/20 text-warning", processing: "bg-accent/20 text-accent", shipped: "bg-primary/20 text-primary", delivered: "bg-success/20 text-success", cancelled: "bg-destructive/20 text-destructive" };
    return map[s] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">{c.label}</p><p className="text-2xl font-bold mt-1">{c.value}</p></div>
              <div className={`w-11 h-11 rounded-full bg-secondary flex items-center justify-center ${c.color}`}><c.icon className="h-5 w-5" /></div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2 font-medium">Order</th><th className="text-left py-2 font-medium">Date</th><th className="text-left py-2 font-medium">Status</th><th className="text-right py-2 font-medium">Total</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{o.order_number}</td>
                  <td className="py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(o.order_status)}`}>{o.order_status}</span></td>
                  <td className="py-3 text-right font-medium">৳{Number(o.total).toLocaleString()}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
