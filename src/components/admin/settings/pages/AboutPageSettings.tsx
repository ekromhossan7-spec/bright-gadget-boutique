import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useSaveSetting } from "@/components/admin/settings/useSaveSetting";
import { supabase } from "@/integrations/supabase/client";
import SingleImageUpload from "@/components/admin/SingleImageUpload";

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

interface AboutPageData {
  hero_title: string;
  hero_description: string;
  story_title: string;
  story_p1: string;
  story_p2: string;
  story_image: string;
  mission: string;
  vision: string;
  team: TeamMember[];
}

const defaults: AboutPageData = {
  hero_title: "About Techllect",
  hero_description: "Techllect is a premium gadget destination in Bangladesh. We bring you the latest in technology — from smartphones and smartwatches to gaming gear and audio accessories — all backed by genuine warranty and exceptional service.",
  story_title: "Our Story",
  story_p1: "Founded with a passion for technology, Techllect started as a small venture to make premium gadgets accessible to everyone in Bangladesh.",
  story_p2: "Today, we serve thousands of happy customers with a curated selection of the best tech products at competitive prices, backed by genuine warranty and dedicated support.",
  story_image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop",
  mission: "To make premium technology accessible and affordable for everyone in Bangladesh.",
  vision: "To become Bangladesh's most trusted destination for authentic gadgets and tech accessories.",
  team: [],
};

const AboutPageSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [data, setData] = useState<AboutPageData>(defaults);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "about_page")
        .maybeSingle();
      if (row?.value && typeof row.value === "object") {
        setData({ ...defaults, ...(row.value as any) });
      }
    };
    fetch();
  }, []);

  const update = (field: keyof AboutPageData, value: any) => setData({ ...data, [field]: value });

  const updateTeam = (idx: number, field: keyof TeamMember, value: string) => {
    const updated = [...data.team];
    updated[idx] = { ...updated[idx], [field]: value };
    update("team", updated);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Hero Section</h2>
        <div><Label>Title</Label><Input value={data.hero_title} onChange={(e) => update("hero_title", e.target.value)} /></div>
        <div><Label>Description</Label><Textarea value={data.hero_description} onChange={(e) => update("hero_description", e.target.value)} rows={3} /></div>
      </Card>

      {/* Our Story */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Our Story</h2>
        <div><Label>Section Title</Label><Input value={data.story_title} onChange={(e) => update("story_title", e.target.value)} /></div>
        <div><Label>Paragraph 1</Label><Textarea value={data.story_p1} onChange={(e) => update("story_p1", e.target.value)} rows={3} /></div>
        <div><Label>Paragraph 2</Label><Textarea value={data.story_p2} onChange={(e) => update("story_p2", e.target.value)} rows={3} /></div>
        <div>
          <Label>Story Image</Label>
          <SingleImageUpload image={data.story_image} onChange={(url) => update("story_image", url)} folder="about" />
        </div>
      </Card>

      {/* Mission & Vision */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Mission & Vision</h2>
        <div><Label>Mission Statement</Label><Textarea value={data.mission} onChange={(e) => update("mission", e.target.value)} rows={2} /></div>
        <div><Label>Vision Statement</Label><Textarea value={data.vision} onChange={(e) => update("vision", e.target.value)} rows={2} /></div>
      </Card>

      {/* Team Members */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Team Members</h2>
        <p className="text-sm text-muted-foreground">Add your team members to show on the About page.</p>
        <div className="space-y-4">
          {data.team.map((member, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Member {i + 1}</span>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => update("team", data.team.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={member.name} onChange={(e) => updateTeam(i, "name", e.target.value)} /></div>
                <div><Label>Role</Label><Input value={member.role} onChange={(e) => updateTeam(i, "role", e.target.value)} /></div>
                <div className="sm:col-span-2">
                  <Label>Photo</Label>
                  <SingleImageUpload image={member.image} onChange={(url) => updateTeam(i, "image", url)} folder="team" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => update("team", [...data.team, { name: "", role: "", image: "" }])} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Team Member
        </Button>
      </Card>

      <Button className="rounded-full" disabled={saving === "about_page"} onClick={() => saveSetting("about_page", data)}>
        {saving === "about_page" ? "Saving..." : "Save About Page"}
      </Button>
    </div>
  );
};

export default AboutPageSettings;
