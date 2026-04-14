import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, Gift, Save } from "lucide-react";

interface ShippingRates {
  inside_dhaka: number;
  outside_dhaka: number;
  free_threshold: number;
}

const DEFAULT_RATES: ShippingRates = { inside_dhaka: 60, outside_dhaka: 120, free_threshold: 5000 };

const AdminShipping = () => {
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [rates, setRates] = useState<ShippingRates>(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["free_delivery", "shipping_rates"]);

      if (data) {
        for (const row of data) {
          if (row.key === "free_delivery" && typeof row.value === "object" && row.value !== null && "enabled" in row.value) {
            setFreeDelivery((row.value as { enabled: boolean }).enabled);
          }
          if (row.key === "shipping_rates" && typeof row.value === "object" && row.value !== null) {
            const v = row.value as any;
            setRates({
              inside_dhaka: v.inside_dhaka ?? DEFAULT_RATES.inside_dhaka,
              outside_dhaka: v.outside_dhaka ?? DEFAULT_RATES.outside_dhaka,
              free_threshold: v.free_threshold ?? DEFAULT_RATES.free_threshold,
            });
          }
        }
      }
      setLoading(false);
    };
    fetchSettings();
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

  const saveRates = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "shipping_rates", value: rates as any }, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error("Failed to save rates");
    } else {
      toast.success("Delivery rates saved!");
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
              <Label htmlFor="inside_dhaka" className="font-bold mb-2 block">Inside Dhaka (৳)</Label>
              <Input
                id="inside_dhaka"
                type="number"
                min={0}
                value={rates.inside_dhaka}
                onChange={(e) => setRates(prev => ({ ...prev, inside_dhaka: Number(e.target.value) }))}
              />
              <p className="text-sm text-muted-foreground mt-2">Standard delivery: 1-2 business days</p>
            </Card>
            <Card className="p-6">
              <Label htmlFor="outside_dhaka" className="font-bold mb-2 block">Outside Dhaka (৳)</Label>
              <Input
                id="outside_dhaka"
                type="number"
                min={0}
                value={rates.outside_dhaka}
                onChange={(e) => setRates(prev => ({ ...prev, outside_dhaka: Number(e.target.value) }))}
              />
              <p className="text-sm text-muted-foreground mt-2">Standard delivery: 3-5 business days</p>
            </Card>
          </div>
          <Card className="p-6">
            <Label htmlFor="free_threshold" className="font-bold mb-2 block">Free Shipping Threshold (৳)</Label>
            <Input
              id="free_threshold"
              type="number"
              min={0}
              value={rates.free_threshold}
              onChange={(e) => setRates(prev => ({ ...prev, free_threshold: Number(e.target.value) }))}
            />
            <p className="text-sm text-muted-foreground mt-2">Orders above this amount qualify for free shipping nationwide.</p>
          </Card>
          <Button onClick={saveRates} disabled={saving || loading} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Rates"}
          </Button>
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
