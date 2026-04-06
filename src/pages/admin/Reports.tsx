import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminReports = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const downloadReport = async (type: string) => {
    setLoadingReport(type);
    try {
      let csvContent = "";
      let filename = "";

      if (type === "sales") {
        const { data } = await supabase.from("orders").select("*").not("trashed_at", "is", null).is("trashed_at", null).order("created_at", { ascending: false });
        const orders = data || [];
        const allOrders = (await supabase.from("orders").select("*").is("trashed_at", null).order("created_at", { ascending: false })).data || [];
        csvContent = "Order Number,Customer,Phone,Email,Subtotal,Delivery,Total,Payment Method,Payment Status,Order Status,Date\n";
        allOrders.forEach((o: any) => {
          const addr = o.shipping_address as any;
          csvContent += `${o.order_number},"${addr?.name || "Guest"}",${o.guest_phone || ""},${o.guest_email || ""},${o.subtotal},${o.delivery_charge},${o.total},${o.payment_method},${o.payment_status},${o.order_status},${new Date(o.created_at).toLocaleDateString()}\n`;
        });
        filename = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
      } else if (type === "orders") {
        const { data } = await supabase.from("orders").select("*").is("trashed_at", null).order("created_at", { ascending: false });
        const orders = data || [];
        csvContent = "Order Number,Customer,Phone,Items Count,Subtotal,Delivery,Total,Status,Payment Status,Payment Method,Date\n";
        orders.forEach((o: any) => {
          const addr = o.shipping_address as any;
          const itemCount = Array.isArray(o.items) ? o.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 0;
          csvContent += `${o.order_number},"${addr?.name || "Guest"}",${o.guest_phone || ""},${itemCount},${o.subtotal},${o.delivery_charge},${o.total},${o.order_status},${o.payment_status},${o.payment_method},${new Date(o.created_at).toLocaleDateString()}\n`;
        });
        filename = `order-report-${new Date().toISOString().split("T")[0]}.csv`;
      } else if (type === "customers") {
        const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        const profiles = data || [];
        csvContent = "Name,Email,Phone,Joined\n";
        profiles.forEach((p: any) => {
          csvContent += `"${p.full_name || ""}",${p.email || ""},${p.phone || ""},${new Date(p.created_at).toLocaleDateString()}\n`;
        });
        filename = `customer-report-${new Date().toISOString().split("T")[0]}.csv`;
      } else if (type === "products") {
        const { data } = await supabase.from("products").select("*").order("name");
        const products = data || [];
        csvContent = "Name,SKU,Price,Compare Price,Stock Qty,In Stock,Featured,Created\n";
        products.forEach((p: any) => {
          csvContent += `"${p.name}",${p.sku || ""},${p.price},${p.compare_price || ""},${p.stock_quantity || 0},${p.in_stock ? "Yes" : "No"},${p.featured ? "Yes" : "No"},${new Date(p.created_at).toLocaleDateString()}\n`;
        });
        filename = `product-report-${new Date().toISOString().split("T")[0]}.csv`;
      }

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} report downloaded`);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoadingReport(null);
    }
  };

  const reports = [
    { key: "sales", title: "Sales Report", desc: "View detailed sales analytics by date range, product, and category." },
    { key: "orders", title: "Order Report", desc: "Track order statuses, fulfillment rates, and delivery performance." },
    { key: "customers", title: "Customer Report", desc: "Analyze customer acquisition, retention, and purchasing patterns." },
    { key: "products", title: "Product Report", desc: "Best sellers, low-stock alerts, and product performance metrics." },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map(r => (
          <Card key={r.key} className="p-6">
            <h3 className="font-bold mb-2">{r.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{r.desc}</p>
            <Button size="sm" variant="outline" onClick={() => downloadReport(r.key)} disabled={loadingReport === r.key}>
              {loadingReport === r.key ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download CSV
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
