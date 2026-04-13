import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import SingleImageUpload from "@/components/admin/SingleImageUpload";
import { useSaveSetting } from "./useSaveSetting";

interface AdBannerData {
  imageUrl: string;
  linkUrl: string;
  altText: string;
  enabled: boolean;
}

const defaultAd: AdBannerData = {
  imageUrl: "",
  linkUrl: "/shop",
  altText: "Promotional Banner",
  enabled: false,
};

const AdBannerSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [ad, setAd] = useState<AdBannerData>(defaultAd);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ad_banner")
        .maybeSingle();
      if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
        setAd(data.value as unknown as AdBannerData);
      }
    };
    fetch();
  }, []);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Ad Banner (Below Hero)</h2>
          <p className="text-sm text-muted-foreground">
            Full-width promotional banner displayed below the hero section.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Enabled</Label>
          <Switch checked={ad.enabled} onCheckedChange={(v) => setAd({ ...ad, enabled: v })} />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Banner Image</Label>
          <SingleImageUpload
            image={ad.imageUrl}
            onChange={(url) => setAd({ ...ad, imageUrl: url })}
            folder="ad-banners"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Link URL</Label>
            <Input
              value={ad.linkUrl}
              onChange={(e) => setAd({ ...ad, linkUrl: e.target.value })}
              placeholder="/shop or https://..."
            />
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input
              value={ad.altText}
              onChange={(e) => setAd({ ...ad, altText: e.target.value })}
              placeholder="Promotional Banner"
            />
          </div>
        </div>
      </div>

      <div>
        <Button
          className="rounded-full"
          disabled={saving === "ad_banner"}
          onClick={() => saveSetting("ad_banner", ad)}
        >
          {saving === "ad_banner" ? "Saving..." : "Save Ad Banner"}
        </Button>
      </div>
    </Card>
  );
};

export default AdBannerSettings;
