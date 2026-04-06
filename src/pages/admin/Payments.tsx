import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const AdminPayments = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Payment Management</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="p-6"><h3 className="font-bold mb-2">Cash on Delivery</h3><p className="text-sm text-muted-foreground">Default payment method. No additional setup required.</p><span className="text-xs text-success font-medium">Active</span></Card>
      <Card className="p-6"><h3 className="font-bold mb-2">UddoktaPay (10% Partial)</h3><p className="text-sm text-muted-foreground">Online partial payment gateway for advance payments.</p><span className="text-xs text-success font-medium">Active</span></Card>
    </div>
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4"><CreditCard className="h-5 w-5 text-primary" /><h2 className="font-bold text-lg">Transaction History</h2></div>
      <p className="text-muted-foreground text-sm">Payment transaction details are available in the Orders section. Each order shows payment method, status, and amounts.</p>
    </Card>
  </div>
);

export default AdminPayments;
