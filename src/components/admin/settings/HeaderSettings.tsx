import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSaveSetting } from "./useSaveSetting";
import SingleImageUpload from "@/components/admin/SingleImageUpload";

interface NavLink {
  label: string;
  href: string;
}

const defaultNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const HeaderSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [storeName, setStoreName] = useState("Techllect");
  const [logoUrl, setLogoUrl] = useState("");
  const [navLinks, setNavLinks] = useState<NavLink[]>(defaultNavLinks);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["header_store_name", "header_logo", "header_nav_links"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "header_store_name" && typeof row.value === "string") setStoreName(row.value);
          if (row.key === "header_logo" && typeof row.value === "string") setLogoUrl(row.value);
          if (row.key === "header_nav_links" && Array.isArray(row.value)) setNavLinks(row.value as unknown as NavLink[]);
        });
      }
    };
    fetch();
  }, []);

  const updateLink = (i: number, field: keyof NavLink, value: string) => {
    const updated = [...navLinks];
    updated[i] = { ...updated[i], [field]: value };
    setNavLinks(updated);
  };

  const addLink = () => setNavLinks([...navLinks, { label: "", href: "/" }]);
  const removeLink = (i: number) => setNavLinks(navLinks.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    await saveSetting("header_store_name", storeName);
    await saveSetting("header_logo", logoUrl);
    await saveSetting("header_nav_links", navLinks.filter(l => l.label.trim()));
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-bold text-lg">Header / Navigation</h2>
      <p className="text-sm text-muted-foreground">Manage the store name, logo, and navigation links shown in the header.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Store Name</Label>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Logo Image</Label>
        <SingleImageUpload image={logoUrl} onChange={setLogoUrl} folder="branding" />
      </div>

      <div className="space-y-3">
        <Label>Navigation Links</Label>
        {navLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="Label" className="flex-1" />
            <Input value={link.href} onChange={(e) => updateLink(i, "href", e.target.value)} placeholder="/path" className="flex-1" />
            <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => removeLink(i)} disabled={navLinks.length <= 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addLink} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Link
        </Button>
      </div>

      <Button className="rounded-full" disabled={saving !== null} onClick={handleSave}>
        {saving ? "Saving..." : "Save Header Settings"}
      </Button>
    </Card>
  );
};

export default HeaderSettings;
