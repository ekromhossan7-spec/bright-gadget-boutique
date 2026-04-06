import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, GripVertical } from "lucide-react";

const AdminSettings = () => {
  const [announcements, setAnnouncements] = useState<string[]>([
    "🚚 Free shipping on orders over ৳5,000",
    "🔥 Flash Sale — Up to 50% off on selected gadgets",
    "📦 Cash on Delivery available nationwide",
    "⚡ New arrivals every week — Stay tuned!",
  ]);
  const [heroImage, setHeroImage] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["top_bar_announcements", "hero_image"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "top_bar_announcements" && Array.isArray(row.value)) {
            setAnnouncements(row.value as string[]);
          }
          if (row.key === "hero_image" && typeof row.value === "string") {
            setHeroImage(row.value);
          }
        });
      }
    };
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: any) => {
    setSaving(key);
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key));
    } else {
      ({ error } = await supabase
        .from("site_settings")
        .insert({ key, value }));
    }

    setSaving(null);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Saved successfully!");
    }
  };

  const updateAnnouncement = (index: number, value: string) => {
    const updated = [...announcements];
    updated[index] = value;
    setAnnouncements(updated);
  };

  const addAnnouncement = () => {
    setAnnouncements([...announcements, ""]);
  };

  const removeAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Store Info */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Store Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Store Name</Label><Input defaultValue="Techllect" /></div>
          <div><Label>Phone</Label><Input defaultValue="+88 01835 925510" /></div>
          <div className="sm:col-span-2"><Label>Store Description</Label><Input defaultValue="Your Trusted Tech Companion" /></div>
        </div>
        <Button className="rounded-full" onClick={() => toast.success("Settings saved!")}>Save Changes</Button>
      </Card>

      {/* Top Bar Announcements */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Top Bar Announcements</h2>
        <p className="text-sm text-muted-foreground">Manage the scrolling text shown at the top of the store.</p>
        <div className="space-y-3">
          {announcements.map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                value={text}
                onChange={(e) => updateAnnouncement(i, e.target.value)}
                placeholder={`Announcement ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive flex-shrink-0"
                onClick={() => removeAnnouncement(i)}
                disabled={announcements.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addAnnouncement} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Announcement
        </Button>
        <div>
          <Button
            className="rounded-full"
            disabled={saving === "top_bar_announcements"}
            onClick={() => saveSetting("top_bar_announcements", announcements.filter(a => a.trim()))}
          >
            {saving === "top_bar_announcements" ? "Saving..." : "Save Announcements"}
          </Button>
        </div>
      </Card>

      {/* Hero Section Image */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Hero Section Image</h2>
        <p className="text-sm text-muted-foreground">Set the main image displayed on the homepage hero section.</p>
        <div>
          <Label>Image URL</Label>
          <Input
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {heroImage && (
          <div className="w-48 h-48 rounded-xl overflow-hidden border bg-secondary">
            <img src={heroImage} alt="Hero preview" className="w-full h-full object-cover" />
          </div>
        )}
        <Button
          className="rounded-full"
          disabled={saving === "hero_image"}
          onClick={() => saveSetting("hero_image", heroImage)}
        >
          {saving === "hero_image" ? "Saving..." : "Save Hero Image"}
        </Button>
      </Card>

      {/* Social Media */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Social Media Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Facebook</Label><Input defaultValue="https://www.facebook.com/Techllect/" /></div>
          <div><Label>Instagram</Label><Input placeholder="Instagram URL" /></div>
        </div>
        <Button className="rounded-full" onClick={() => toast.success("Social links saved!")}>Save Changes</Button>
      </Card>
    </div>
  );
};

export default AdminSettings;
