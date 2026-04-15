import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSaveSetting } from "@/components/admin/settings/useSaveSetting";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Banknote, Wallet, ExternalLink } from "lucide-react";

interface PaymentSettingsData {
  cod_enabled: boolean;
  uddoktapay_enabled: boolean;
  partial_payment_percentage: number;
  uddoktapay_api_url: string;
  uddoktapay_api_key: string;
  uddoktapay_store_name: string;
}

const defaults: PaymentSettingsData = {
  cod_enabled: true,
  uddoktapay_enabled: true,
  partial_payment_percentage: 5,
  uddoktapay_api_url: "https://techllect.paymently.io/api",
  uddoktapay_api_key: "",
  uddoktapay_store_name: "Best E-Shop",
};

const PaymentSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [data, setData] = useState<PaymentSettingsData>(defaults);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "payment_settings")
        .maybeSingle();
      if (row?.value && typeof row.value === "object") {
        setData({ ...defaults, ...(row.value as any) });
      }
    };
    fetch();
  }, []);

  const update = (field: keyof PaymentSettingsData, value: any) =>
    setData({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure payment methods and gateway settings.
        </p>
      </div>

      {/* COD Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-bold">Cash on Delivery (COD)</h3>
              <p className="text-sm text-muted-foreground">
                Accept payment when the product is delivered.
              </p>
            </div>
          </div>
          <Switch
            checked={data.cod_enabled}
            onCheckedChange={(v) => update("cod_enabled", v)}
          />
        </div>
      </Card>

      {/* UddoktaPay Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-bold">UddoktaPay (Online Payment)</h3>
              <p className="text-sm text-muted-foreground">
                Accept bKash, Nagad, and other mobile payments via UddoktaPay.
              </p>
            </div>
          </div>
          <Switch
            checked={data.uddoktapay_enabled}
            onCheckedChange={(v) => update("uddoktapay_enabled", v)}
          />
        </div>

        {data.uddoktapay_enabled && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Store Name (shown on payment page)</Label>
                <Input
                  value={data.uddoktapay_store_name}
                  onChange={(e) => update("uddoktapay_store_name", e.target.value)}
                  placeholder="Best E-Shop"
                />
              </div>
              <div>
                <Label>Partial Payment Percentage (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={data.partial_payment_percentage}
                  onChange={(e) =>
                    update("partial_payment_percentage", Number(e.target.value))
                  }
                  placeholder="5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Customer pays this % upfront for online orders.
                </p>
              </div>
            </div>

            <div>
              <Label>API Base URL</Label>
              <Input
                value={data.uddoktapay_api_url}
                onChange={(e) => update("uddoktapay_api_url", e.target.value)}
                placeholder="https://yoursite.paymently.io/api"
              />
            </div>

            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={data.uddoktapay_api_key}
                onChange={(e) => update("uddoktapay_api_key", e.target.value)}
                placeholder="Enter your UddoktaPay API key"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get this from your UddoktaPay merchant dashboard.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">💡 To customize logo & branding on the payment page:</p>
              <p className="text-muted-foreground">
                Log in to your{" "}
                <a
                  href="https://paymently.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline inline-flex items-center gap-1"
                >
                  UddoktaPay/Paymently Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>{" "}
                → Settings → Store to update your logo, store name, and branding
                colors that appear on the checkout page.
              </p>
            </div>
          </div>
        )}
      </Card>

      <Button
        className="rounded-full"
        disabled={saving === "payment_settings"}
        onClick={() => saveSetting("payment_settings", data)}
      >
        {saving === "payment_settings" ? "Saving..." : "Save Payment Settings"}
      </Button>
    </div>
  );
};

export default PaymentSettings;
