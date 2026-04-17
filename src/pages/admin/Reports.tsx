import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const AdminReports = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [profitFrom, setProfitFrom] = useState<string>("");
  const [profitTo, setProfitTo] = useState<string>("");

  const downloadReport = async (type: string) => {
    setLoadingReport(type);
    try {
      let csvContent = "";
      let filename = "";

      if (type === "sales") {
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
        csvContent = "Name,SKU,Purchase Price,Sale Price,Compare Price,Stock Qty,In Stock,Featured,Created\n";
        products.forEach((p: any) => {
          csvContent += `"${p.name}",${p.sku || ""},${p.purchase_price || 0},${p.price},${p.compare_price || ""},${p.stock_quantity || 0},${p.in_stock ? "Yes" : "No"},${p.featured ? "Yes" : "No"},${new Date(p.created_at).toLocaleDateString()}\n`;
        });
        filename = `product-report-${new Date().toISOString().split("T")[0]}.csv`;
      } else if (type === "profit") {
        if (!profitFrom || !profitTo) {
          toast.error("Please select a date range");
          setLoadingReport(null);
          return;
        }
        const fromDate = new Date(profitFrom + "T00:00:00").toISOString();
        const toDate = new Date(profitTo + "T23:59:59").toISOString();

        const [ordersRes, productsRes] = await Promise.all([
          supabase.from("orders").select("*")
            .is("trashed_at", null)
            .gte("created_at", fromDate)
            .lte("created_at", toDate)
            .order("created_at", { ascending: false }),
          supabase.from("products").select("id,name,purchase_price,price"),
        ]);
        const orders = ordersRes.data || [];
        const products = productsRes.data || [];
        const productMap = new Map(products.map((p: any) => [p.id, p]));

        csvContent = "Date,Order Number,Customer,Item,Qty,Sale Price,Purchase Price,Line Revenue,Line Cost,Line Profit,Order Status,Payment Status\n";
        let totalRevenue = 0, totalCost = 0, totalProfit = 0, totalDelivery = 0;
        let confirmedRevenue = 0, confirmedCost = 0, confirmedProfit = 0;

        orders.forEach((o: any) => {
          const addr = o.shipping_address as any;
          const items = Array.isArray(o.items) ? o.items : [];
          totalDelivery += Number(o.delivery_charge || 0);
          const isConfirmed = !["cancelled", "pending"].includes(o.order_status);

          items.forEach((item: any) => {
            const product = productMap.get(item.id) as any;
            const purchasePrice = Number(product?.purchase_price || 0);
            const salePrice = Number(item.price || 0);
            const qty = Number(item.quantity || 1);
            const lineRevenue = salePrice * qty;
            const lineCost = purchasePrice * qty;
            const lineProfit = lineRevenue - lineCost;
            totalRevenue += lineRevenue;
            totalCost += lineCost;
            totalProfit += lineProfit;
            if (isConfirmed) {
              confirmedRevenue += lineRevenue;
              confirmedCost += lineCost;
              confirmedProfit += lineProfit;
            }
            csvContent += `${new Date(o.created_at).toLocaleDateString()},${o.order_number},"${addr?.name || "Guest"}","${(item.name || "").replace(/"/g, "'")}",${qty},${salePrice},${purchasePrice},${lineRevenue},${lineCost},${lineProfit},${o.order_status},${o.payment_status}\n`;
          });
        });

        csvContent += `\n\nSUMMARY,,,,,,,,,,,\n`;
        csvContent += `Date Range,${profitFrom} to ${profitTo},,,,,,,,,,\n`;
        csvContent += `Total Orders,${orders.length},,,,,,,,,,\n`;
        csvContent += `\nALL ORDERS:,,,,,,,,,,,\n`;
        csvContent += `Total Revenue (items),${totalRevenue},,,,,,,,,,\n`;
        csvContent += `Total Cost,${totalCost},,,,,,,,,,\n`;
        csvContent += `Total Profit,${totalProfit},,,,,,,,,,\n`;
        csvContent += `Delivery Collected,${totalDelivery},,,,,,,,,,\n`;
        csvContent += `\nCONFIRMED ORDERS ONLY (excludes pending/cancelled):,,,,,,,,,,,\n`;
        csvContent += `Confirmed Revenue,${confirmedRevenue},,,,,,,,,,\n`;
        csvContent += `Confirmed Cost,${confirmedCost},,,,,,,,,,\n`;
        csvContent += `Confirmed Profit,${confirmedProfit},,,,,,,,,,\n`;

        filename = `profit-report-${profitFrom}-to-${profitTo}.csv`;
      }

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} report downloaded`);
    } catch (e: any) {
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

      {/* Profit Report - Featured */}
      <Card className="p-6 border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Profit Report</h3>
            <p className="text-sm text-muted-foreground">Calculates profit per order line using each product's purchase price vs sale price for the selected date range.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <Label>From Date</Label>
            <Input type="date" value={profitFrom} onChange={e => setProfitFrom(e.target.value)} />
          </div>
          <div>
            <Label>To Date</Label>
            <Input type="date" value={profitTo} onChange={e => setProfitTo(e.target.value)} />
          </div>
          <Button onClick={() => downloadReport("profit")} disabled={loadingReport === "profit"}>
            {loadingReport === "profit" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Download Profit Report
          </Button>
        </div>
      </Card>

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
