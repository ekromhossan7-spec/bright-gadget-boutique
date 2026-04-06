import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSaveSetting = () => {
  const [saving, setSaving] = useState<string | null>(null);

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

  return { saving, saveSetting };
};
