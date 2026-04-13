import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSaveSetting } from "@/components/admin/settings/useSaveSetting";
import { supabase } from "@/integrations/supabase/client";

interface ContactPageData {
  phone: string;
  email: string;
  address: string;
  facebook_url: string;
  facebook_label: string;
  maps_embed: string;
}

const defaults: ContactPageData = {
  phone: "+88 01835 925510",
  email: "support@techllect.com",
  address: "Dhaka, Bangladesh",
  facebook_url: "https://www.facebook.com/Techllect/",
  facebook_label: "facebook.com/Techllect",
  maps_embed: "",
};

const ContactPageSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [data, setData] = useState<ContactPageData>(defaults);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "contact_page")
        .maybeSingle();
      if (row?.value && typeof row.value === "object") {
        setData({ ...defaults, ...(row.value as any) });
      }
    };
    fetch();
  }, []);

  const update = (field: keyof ContactPageData, value: string) => setData({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Contact Information</h2>
        <p className="text-sm text-muted-foreground">Update the contact details displayed on the Contact page.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Phone Number</Label><Input value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+88 01XXX XXXXXX" /></div>
          <div><Label>Email Address</Label><Input value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="support@example.com" /></div>
          <div className="sm:col-span-2"><Label>Office Address</Label><Input value={data.address} onChange={(e) => update("address", e.target.value)} placeholder="Dhaka, Bangladesh" /></div>
          <div><Label>Facebook URL</Label><Input value={data.facebook_url} onChange={(e) => update("facebook_url", e.target.value)} placeholder="https://facebook.com/..." /></div>
          <div><Label>Facebook Label</Label><Input value={data.facebook_label} onChange={(e) => update("facebook_label", e.target.value)} placeholder="facebook.com/YourPage" /></div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Google Maps Embed</h2>
        <p className="text-sm text-muted-foreground">Paste the Google Maps embed URL to show a map on the Contact page. Get it from Google Maps → Share → Embed.</p>
        <div>
          <Label>Maps Embed URL</Label>
          <Textarea
            value={data.maps_embed}
            onChange={(e) => update("maps_embed", e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
            rows={2}
          />
        </div>
        {data.maps_embed && (
          <div className="rounded-xl overflow-hidden border h-48">
            <iframe src={data.maps_embed} className="w-full h-full" allowFullScreen loading="lazy" title="Map preview" />
          </div>
        )}
      </Card>

      <Button className="rounded-full" disabled={saving === "contact_page"} onClick={() => saveSetting("contact_page", data)}>
        {saving === "contact_page" ? "Saving..." : "Save Contact Page"}
      </Button>
    </div>
  );
};

export default ContactPageSettings;
