import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, Gift } from "lucide-react";

const AdminShipping = () => {
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "free_delivery")
        .maybeSingle();
      if (data?.value && typeof data.value === "object" && "enabled" in data.value) {
        setFreeDelivery((data.value as { enabled: boolean }).enabled);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleFreeDelivery = async (enabled: boolean) => {
    setFreeDelivery(enabled);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "free_delivery", value: { enabled } }, { onConflict: "key" });
    if (error) {
      toast.error("Failed to update setting");
      setFreeDelivery(!enabled);
    } else {
      toast.success(enabled ? "Free delivery enabled for all orders" : "Free delivery disabled");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shipping Management</h1>
      <Tabs defaultValue="rates">
        <TabsList>
          <TabsTrigger value="rates" className="gap-2"><Truck className="h-4 w-4" />Delivery Rates</TabsTrigger>
          <TabsTrigger value="free" className="gap-2"><Gift className="h-4 w-4" />Free Delivery Charge</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-bold mb-2">Inside Dhaka</h3>
              <p className="text-2xl font-bold text-accent">৳60</p>
              <p className="text-sm text-muted-foreground">Standard delivery: 1-2 business days</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">Outside Dhaka</h3>
              <p className="text-2xl font-bold text-accent">৳120</p>
              <p className="text-sm text-muted-foreground">Standard delivery: 3-5 business days</p>
            </Card>
          </div>
          <Card className="p-6">
            <h3 className="font-bold mb-2">Free Shipping Threshold</h3>
            <p className="text-sm text-muted-foreground">Orders above ৳5,000 qualify for free shipping nationwide.</p>
          </Card>
        </TabsContent>

        <TabsContent value="free" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">Free Delivery on All Orders</h3>
                <p className="text-sm text-muted-foreground">
                  When enabled, all orders will have free delivery regardless of order amount or location.
                </p>
              </div>
              <Switch
                checked={freeDelivery}
                onCheckedChange={toggleFreeDelivery}
                disabled={loading}
              />
            </div>
            {freeDelivery && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  ✅ Free delivery is currently active for all orders.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminShipping;
