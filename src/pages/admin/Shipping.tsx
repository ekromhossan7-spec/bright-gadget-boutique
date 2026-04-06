import { Card } from "@/components/ui/card";
import { Truck } from "lucide-react";

const AdminShipping = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Shipping Management</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="p-6"><h3 className="font-bold mb-2">Inside Dhaka</h3><p className="text-2xl font-bold text-accent">৳60</p><p className="text-sm text-muted-foreground">Standard delivery: 1-2 business days</p></Card>
      <Card className="p-6"><h3 className="font-bold mb-2">Outside Dhaka</h3><p className="text-2xl font-bold text-accent">৳120</p><p className="text-sm text-muted-foreground">Standard delivery: 3-5 business days</p></Card>
    </div>
    <Card className="p-6"><h3 className="font-bold mb-2">Free Shipping</h3><p className="text-sm text-muted-foreground">Orders above ৳5,000 qualify for free shipping nationwide.</p></Card>
  </div>
);

export default AdminShipping;
