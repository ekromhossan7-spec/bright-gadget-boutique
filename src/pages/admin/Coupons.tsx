import { Card } from "@/components/ui/card";
import { Tag } from "lucide-react";

const AdminCoupons = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Coupons & Discounts</h1>
    <Card className="p-6 text-center">
      <Tag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
      <p className="font-medium mb-2">Coupon Management</p>
      <p className="text-sm text-muted-foreground">Create and manage discount codes, percentage/fixed discounts, expiry dates, and usage limits. Coming with database integration.</p>
    </Card>
  </div>
);

export default AdminCoupons;
