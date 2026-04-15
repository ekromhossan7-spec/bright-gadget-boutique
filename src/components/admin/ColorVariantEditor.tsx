import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ColorVariant {
  name: string;
  hex: string;
  image: string;
}

interface ColorVariantEditorProps {
  variants: ColorVariant[];
  onChange: (variants: ColorVariant[]) => void;
}

const ColorVariantEditor = ({ variants, onChange }: ColorVariantEditorProps) => {
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const addVariant = () => {
    onChange([...variants, { name: "", hex: "#000000", image: "" }]);
  };

  const updateVariant = (idx: number, field: keyof ColorVariant, value: string) => {
    const updated = variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v));
    onChange(updated);
  };

  const removeVariant = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  const uploadImage = async (idx: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(idx);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const filePath = `color-variants/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
    updateVariant(idx, "image", urlData.publicUrl);
    setUploading(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Color Variants</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="h-3 w-3 mr-1" />Add Color
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-muted-foreground">No color variants added. Click "Add Color" to start.</p>
      )}

      <div className="space-y-3">
        {variants.map((v, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-secondary/30 relative">
            <button
              type="button"
              onClick={() => removeVariant(idx)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Color preview */}
            <div className="flex flex-col items-center gap-1 pt-5">
              <div
                className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                style={{ backgroundColor: v.hex }}
              />
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Color Name</Label>
                <Input
                  placeholder="e.g. Red"
                  value={v.name}
                  onChange={(e) => updateVariant(idx, "name", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Hex Code</Label>
                <div className="flex gap-1">
                  <input
                    type="color"
                    value={v.hex}
                    onChange={(e) => updateVariant(idx, "hex", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={v.hex}
                    onChange={(e) => updateVariant(idx, "hex", e.target.value)}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div className="flex-shrink-0">
              {v.image ? (
                <div className="relative group">
                  <img src={v.image} alt={v.name} className="w-16 h-16 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() => updateVariant(idx, "image", "")}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRefs.current[idx]?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  {uploading === idx ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Image</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={(el) => { fileRefs.current[idx] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) uploadImage(idx, e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorVariantEditor;
