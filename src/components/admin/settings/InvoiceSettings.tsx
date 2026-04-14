import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import SingleImageUpload from "@/components/admin/SingleImageUpload";

interface InvoiceConfig {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  logo_url: string;
  footer_note: string;
  show_logo: boolean;
  show_delivery_charge: boolean;
  show_payment_method: boolean;
  show_notes: boolean;
  thank_you_message: string;
}

const defaultConfig: InvoiceConfig = {
  business_name: "My Store",
  business_address: "",
  business_phone: "",
  business_email: "",
  logo_url: "",
  footer_note: "",
  show_logo: true,
  show_delivery_charge: true,
  show_payment_method: true,
  show_notes: true,
  thank_you_message: "Thank you for your purchase!",
};

const InvoiceSettings = () => {
  const [config, setConfig] = useState<InvoiceConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "invoice_config")
        .maybeSingle();
      if (data?.value && typeof data.value === "object") {
        setConfig({ ...defaultConfig, ...(data.value as any) });
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", "invoice_config")
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("site_settings")
        .update({ value: config as any })
        .eq("key", "invoice_config"));
    } else {
      ({ error } = await supabase
        .from("site_settings")
        .insert({ key: "invoice_config", value: config as any }));
    }
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Invoice settings saved!");
  };

  const update = (key: keyof InvoiceConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Invoice Settings</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Business Name</Label>
            <Input value={config.business_name} onChange={(e) => update("business_name", e.target.value)} />
          </div>
          <div>
            <Label>Business Phone</Label>
            <Input value={config.business_phone} onChange={(e) => update("business_phone", e.target.value)} />
          </div>
          <div>
            <Label>Business Email</Label>
            <Input value={config.business_email} onChange={(e) => update("business_email", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Business Logo</Label>
            <SingleImageUpload image={config.logo_url} onChange={(url) => update("logo_url", url)} folder="invoice" />
          </div>
        </div>
        <div>
          <Label>Business Address</Label>
          <Textarea value={config.business_address} onChange={(e) => update("business_address", e.target.value)} rows={2} />
        </div>
        <div>
          <Label>Footer Note</Label>
          <Textarea value={config.footer_note} onChange={(e) => update("footer_note", e.target.value)} rows={2} placeholder="e.g. Terms & conditions, return policy..." />
        </div>
        <div>
          <Label>Thank You Message</Label>
          <Input value={config.thank_you_message} onChange={(e) => update("thank_you_message", e.target.value)} />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label>Show Logo</Label>
            <Switch checked={config.show_logo} onCheckedChange={(c) => update("show_logo", c)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Delivery Charge</Label>
            <Switch checked={config.show_delivery_charge} onCheckedChange={(c) => update("show_delivery_charge", c)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Payment Method</Label>
            <Switch checked={config.show_payment_method} onCheckedChange={(c) => update("show_payment_method", c)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Order Notes</Label>
            <Switch checked={config.show_notes} onCheckedChange={(c) => update("show_notes", c)} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save Invoice Settings"}
        </Button>
      </div>
    </Card>
  );
};

export default InvoiceSettings;
