import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import SingleImageUpload from "@/components/admin/SingleImageUpload";
import { Switch } from "@/components/ui/switch";

interface HeroSlider {
  id?: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  active: boolean;
}

const HeroSliderSettings = () => {
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchSliders = async () => {
    const { data } = await supabase
      .from("hero_sliders")
      .select("*")
      .order("sort_order");
    if (data) setSliders(data);
  };

  useEffect(() => { fetchSliders(); }, []);

  const addSlider = () => {
    setSliders(prev => [...prev, { image_url: "", link_url: "/shop", sort_order: prev.length, active: true }]);
  };

  const updateSlider = (index: number, field: keyof HeroSlider, value: any) => {
    setSliders(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeSlider = async (index: number) => {
    const slider = sliders[index];
    if (slider.id) {
      await supabase.from("hero_sliders").delete().eq("id", slider.id);
    }
    setSliders(prev => prev.filter((_, i) => i !== index));
    toast.success("Slider removed");
  };

  const saveAll = async () => {
    setSaving(true);
    for (let i = 0; i < sliders.length; i++) {
      const s = sliders[i];
      if (!s.image_url) continue;
      if (s.id) {
        await supabase.from("hero_sliders").update({
          image_url: s.image_url,
          link_url: s.link_url,
          sort_order: i,
          active: s.active,
        }).eq("id", s.id);
      } else {
        await supabase.from("hero_sliders").insert({
          image_url: s.image_url,
          link_url: s.link_url,
          sort_order: i,
          active: s.active,
        });
      }
    }
    toast.success("Hero sliders saved!");
    fetchSliders();
    setSaving(false);
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-bold text-lg">Hero Slider Images</h2>
      <p className="text-sm text-muted-foreground">Manage the hero carousel slider images shown on the homepage. Recommended size: 900x400px.</p>

      <div className="space-y-4">
        {sliders.map((slider, i) => (
          <div key={slider.id || i} className="border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Slide {i + 1}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Active</Label>
                  <Switch checked={slider.active} onCheckedChange={(v) => updateSlider(i, "active", v)} />
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeSlider(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Slider Image</Label>
              <SingleImageUpload image={slider.image_url} onChange={(url) => updateSlider(i, "image_url", url)} folder="hero-sliders" />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input value={slider.link_url} onChange={(e) => updateSlider(i, "link_url", e.target.value)} placeholder="/shop" />
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addSlider} className="rounded-full">
        <Plus className="h-4 w-4 mr-1" /> Add Slide
      </Button>

      <div>
        <Button className="rounded-full" disabled={saving} onClick={saveAll}>
          {saving ? "Saving..." : "Save Hero Sliders"}
        </Button>
      </div>
    </Card>
  );
};

export default HeroSliderSettings;
