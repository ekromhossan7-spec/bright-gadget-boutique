import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSaveSetting } from "./useSaveSetting";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterData {
  description: string;
  quickLinks: FooterLink[];
  serviceLinks: FooterLink[];
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  youtube: string;
  copyright: string;
}

const defaultFooter: FooterData = {
  description: "Enjoy new gadgets with a touch of technology. Your trusted destination for premium gadgets in Bangladesh.",
  quickLinks: [
    { label: "Shop All", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
    { label: "Wishlist", href: "/wishlist" },
  ],
  serviceLinks: [
    { label: "Track Order", href: "/track-order" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Shipping Info", href: "/shipping-info" },
    { label: "FAQ", href: "/faq" },
  ],
  phone: "+88 01835 925510",
  email: "support@besteshop.com",
  address: "Dhaka, Bangladesh",
  facebook: "https://www.facebook.com/BestEShop/",
  instagram: "",
  youtube: "",
  copyright: "© {year} Best E-Shop. All rights reserved Ekrom Hossan (Software Developer)",
};

const FooterSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [footer, setFooter] = useState<FooterData>(defaultFooter);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("key", "footer_settings");
      if (data?.[0]?.value && typeof data[0].value === "object") {
        setFooter({ ...defaultFooter, ...(data[0].value as unknown as FooterData) });
      }
    };
    fetch();
  }, []);

  const update = (field: keyof FooterData, value: any) => setFooter(prev => ({ ...prev, [field]: value }));

  const updateQuickLink = (i: number, field: keyof FooterLink, value: string) => {
    const updated = [...footer.quickLinks];
    updated[i] = { ...updated[i], [field]: value };
    update("quickLinks", updated);
  };

  const updateServiceLink = (i: number, field: keyof FooterLink, value: string) => {
    const updated = [...footer.serviceLinks];
    updated[i] = { ...updated[i], [field]: value };
    update("serviceLinks", updated);
  };

  const renderLinkEditor = (
    links: FooterLink[],
    updateFn: (i: number, field: keyof FooterLink, value: string) => void,
    setLinks: (links: FooterLink[]) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={link.label} onChange={(e) => updateFn(i, "label", e.target.value)} placeholder="Label" className="flex-1" />
          <Input value={link.href} onChange={(e) => updateFn(i, "href", e.target.value)} placeholder="/path" className="flex-1" />
          <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => setLinks(links.filter((_, idx) => idx !== i))} disabled={links.length <= 1}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setLinks([...links, { label: "", href: "/" }])} className="rounded-full">
        <Plus className="h-4 w-4 mr-1" /> Add Link
      </Button>
    </div>
  );

  return (
    <Card className="p-6 space-y-5">
      <h2 className="font-bold text-lg">Footer</h2>
      <p className="text-sm text-muted-foreground">Manage footer content: description, links, contact info, and social media.</p>

      <div>
        <Label>Brand Description</Label>
        <Textarea value={footer.description} onChange={(e) => update("description", e.target.value)} rows={3} />
      </div>

      {renderLinkEditor(footer.quickLinks, updateQuickLink, (l) => update("quickLinks", l), "Quick Links")}
      {renderLinkEditor(footer.serviceLinks, updateServiceLink, (l) => update("serviceLinks", l), "Customer Service Links")}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><Label>Phone</Label><Input value={footer.phone} onChange={(e) => update("phone", e.target.value)} /></div>
        <div><Label>Email</Label><Input value={footer.email} onChange={(e) => update("email", e.target.value)} /></div>
        <div><Label>Address</Label><Input value={footer.address} onChange={(e) => update("address", e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><Label>Facebook URL</Label><Input value={footer.facebook} onChange={(e) => update("facebook", e.target.value)} /></div>
        <div><Label>Instagram URL</Label><Input value={footer.instagram} onChange={(e) => update("instagram", e.target.value)} /></div>
        <div><Label>YouTube URL</Label><Input value={footer.youtube} onChange={(e) => update("youtube", e.target.value)} /></div>
      </div>

      <div>
        <Label>Copyright Text <span className="text-xs text-muted-foreground">(use {"{year}"} for current year)</span></Label>
        <Input value={footer.copyright} onChange={(e) => update("copyright", e.target.value)} />
      </div>

      <Button className="rounded-full" disabled={saving !== null} onClick={() => saveSetting("footer_settings", footer)}>
        {saving ? "Saving..." : "Save Footer Settings"}
      </Button>
    </Card>
  );
};

export default FooterSettings;
