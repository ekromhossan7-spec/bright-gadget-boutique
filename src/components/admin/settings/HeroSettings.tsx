import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSaveSetting } from "./useSaveSetting";
import SingleImageUpload from "@/components/admin/SingleImageUpload";

interface HeroData {
  trustBadge: string;
  heading: string;
  headingAccent: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  badge1Label: string;
  badge2Label: string;
  badge3Label: string;
  statNumber: string;
  statLabel: string;
  rating: string;
  reviewCount: string;
  heroImage: string;
}

const defaultHero: HeroData = {
  trustBadge: "Trusted by 10,000+ Customers",
  heading: "Premium Gadgets",
  headingAccent: "With Pleasure",
  description: "Let your lifestyle upgrade with the best tech. Discover premium gadgets, smart devices & accessories — all at unbeatable prices with nationwide delivery.",
  ctaText: "Shop Now",
  ctaLink: "/shop",
  secondaryCtaText: "Browse Categories",
  secondaryCtaLink: "/shop",
  badge1Label: "Genuine Products",
  badge2Label: "Fast Delivery",
  badge3Label: "7-Day Return",
  statNumber: "35K+",
  statLabel: "Products sold every month",
  rating: "4.9 Rating",
  reviewCount: "2,400+ Reviews",
  heroImage: "",
};

const HeroSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [hero, setHero] = useState<HeroData>(defaultHero);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_settings", "hero_image"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "hero_settings" && typeof row.value === "object") {
            setHero(prev => ({ ...prev, ...(row.value as unknown as Partial<HeroData>) }));
          }
          if (row.key === "hero_image" && typeof row.value === "string") {
            setHero(prev => ({ ...prev, heroImage: row.value as string }));
          }
        });
      }
    };
    fetch();
  }, []);

  const update = (field: keyof HeroData, value: string) => setHero(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const { heroImage, ...rest } = hero;
    await saveSetting("hero_settings", rest);
    await saveSetting("hero_image", heroImage);
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-bold text-lg">Hero Section</h2>
      <p className="text-sm text-muted-foreground">Manage the main hero banner content on the homepage.</p>

      <div><Label>Trust Badge Text</Label><Input value={hero.trustBadge} onChange={(e) => update("trustBadge", e.target.value)} /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Heading</Label><Input value={hero.heading} onChange={(e) => update("heading", e.target.value)} /></div>
        <div><Label>Heading Accent (purple text)</Label><Input value={hero.headingAccent} onChange={(e) => update("headingAccent", e.target.value)} /></div>
      </div>

      <div><Label>Description</Label><Textarea value={hero.description} onChange={(e) => update("description", e.target.value)} rows={3} /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Primary CTA Text</Label><Input value={hero.ctaText} onChange={(e) => update("ctaText", e.target.value)} /></div>
        <div><Label>Primary CTA Link</Label><Input value={hero.ctaLink} onChange={(e) => update("ctaLink", e.target.value)} /></div>
        <div><Label>Secondary CTA Text</Label><Input value={hero.secondaryCtaText} onChange={(e) => update("secondaryCtaText", e.target.value)} /></div>
        <div><Label>Secondary CTA Link</Label><Input value={hero.secondaryCtaLink} onChange={(e) => update("secondaryCtaLink", e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><Label>Badge 1</Label><Input value={hero.badge1Label} onChange={(e) => update("badge1Label", e.target.value)} /></div>
        <div><Label>Badge 2</Label><Input value={hero.badge2Label} onChange={(e) => update("badge2Label", e.target.value)} /></div>
        <div><Label>Badge 3</Label><Input value={hero.badge3Label} onChange={(e) => update("badge3Label", e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Stat Number (e.g. 35K+)</Label><Input value={hero.statNumber} onChange={(e) => update("statNumber", e.target.value)} /></div>
        <div><Label>Stat Label</Label><Input value={hero.statLabel} onChange={(e) => update("statLabel", e.target.value)} /></div>
        <div><Label>Rating Text</Label><Input value={hero.rating} onChange={(e) => update("rating", e.target.value)} /></div>
        <div><Label>Review Count Text</Label><Input value={hero.reviewCount} onChange={(e) => update("reviewCount", e.target.value)} /></div>
      </div>

      <div>
        <Label>Hero Image</Label>
        <SingleImageUpload image={hero.heroImage} onChange={(url) => update("heroImage", url)} folder="hero" />
      </div>

      <Button className="rounded-full" disabled={saving !== null} onClick={handleSave}>
        {saving ? "Saving..." : "Save Hero Settings"}
      </Button>
    </Card>
  );
};

export default HeroSettings;
