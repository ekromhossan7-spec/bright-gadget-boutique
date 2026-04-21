import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface SizeVariantEditorProps {
  sizes: string[];
  onChange: (sizes: string[]) => void;
}

const SizeVariantEditor = ({ sizes, onChange }: SizeVariantEditorProps) => {
  const [input, setInput] = useState("");

  const addSize = () => {
    const v = input.trim();
    if (!v) return;
    if (sizes.includes(v)) {
      setInput("");
      return;
    }
    onChange([...sizes, v]);
    setInput("");
  };

  const removeSize = (idx: number) => {
    onChange(sizes.filter((_, i) => i !== idx));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSize();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Sizes</Label>
      <p className="text-xs text-muted-foreground">
        Add available sizes (e.g. S, M, L, XL or 40, 42, 44). Press Enter or comma to add.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Type a size and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-9"
        />
        <Button type="button" variant="outline" size="sm" onClick={addSize} className="h-9">
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>
      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {sizes.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-secondary border rounded-full pl-3 pr-1 py-1 text-sm"
            >
              {s}
              <button
                type="button"
                onClick={() => removeSize(idx)}
                className="w-5 h-5 rounded-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                aria-label={`Remove size ${s}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SizeVariantEditor;
