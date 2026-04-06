import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSaveSetting } from "./useSaveSetting";

interface MoneyBackData {
  title: string;
  description: string;
}

const defaultData: MoneyBackData = {
  title: "100% Money Back Guarantee",
  description: "If you're not completely satisfied with your purchase, return it within 7 days for a full refund. No questions asked.",
};

const MoneyBackSettings = () => {
  const { saving, saveSetting } = useSaveSetting();
  const [data, setData] = useState<MoneyBackData>(defaultData);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "moneyback_settings")
        .single();
      if (row?.value && typeof row.value === "object") {
        setData({ ...defaultData, ...(row.value as unknown as MoneyBackData) });
      }
    };
    fetch();
  }, []);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-bold text-lg">Money Back Guarantee Banner</h2>
      <p className="text-sm text-muted-foreground">Manage the guarantee banner shown on the homepage.</p>
      <div><Label>Title</Label><Input value={data.title} onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))} /></div>
      <div><Label>Description</Label><Textarea value={data.description} onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))} rows={3} /></div>
      <Button className="rounded-full" disabled={saving !== null} onClick={() => saveSetting("moneyback_settings", data)}>
        {saving ? "Saving..." : "Save Guarantee Banner"}
      </Button>
    </Card>
  );
};

export default MoneyBackSettings;
