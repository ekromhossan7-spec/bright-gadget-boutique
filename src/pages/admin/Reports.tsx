import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const AdminReports = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Reports</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="p-6"><h3 className="font-bold mb-2">Sales Report</h3><p className="text-sm text-muted-foreground">View detailed sales analytics by date range, product, and category.</p></Card>
      <Card className="p-6"><h3 className="font-bold mb-2">Order Report</h3><p className="text-sm text-muted-foreground">Track order statuses, fulfillment rates, and delivery performance.</p></Card>
      <Card className="p-6"><h3 className="font-bold mb-2">Customer Report</h3><p className="text-sm text-muted-foreground">Analyze customer acquisition, retention, and purchasing patterns.</p></Card>
      <Card className="p-6"><h3 className="font-bold mb-2">Product Report</h3><p className="text-sm text-muted-foreground">Best sellers, low-stock alerts, and product performance metrics.</p></Card>
    </div>
    <Card className="p-6 text-center">
      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground">Detailed charts and analytics coming soon. View real-time data on the Dashboard.</p>
    </Card>
  </div>
);

export default AdminReports;
