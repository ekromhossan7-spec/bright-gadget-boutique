import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, GripVertical, Star } from "lucide-react";
import SingleImageUpload from "@/components/admin/SingleImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PromoBanner {
  title: string;
  subtitle: string;
  label: string;
  linkText: string;
  linkUrl: string;
  imageUrl: string;
  variant: "primary" | "secondary";
}

interface ComparisonItem {
  feature: string;
  us: boolean;
  others: boolean;
}

interface KeyPoint {
  icon: string;
  title: string;
  desc: string;
}

interface ReviewItem {
  name: string;
  rating: number;
  comment: string;
}

const defaultPromoBanners: PromoBanner[] = [
  { title: "Up to 40% Off\nAudio Gear", subtitle: "", label: "Limited Offer", linkText: "Shop Audio →", linkUrl: "/shop?category=headphones", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop", variant: "primary" },
  { title: "Smart Wearables\nCollection", subtitle: "", label: "New Arrivals", linkText: "Explore Now →", linkUrl: "/shop?category=smartwatches", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop", variant: "secondary" },
];

const defaultComparisons: ComparisonItem[] = [
  { feature: "Original Products", us: true, others: false },
  { feature: "Cash on Delivery", us: true, others: false },
  { feature: "7-Day Easy Return", us: true, others: false },
  { feature: "Nationwide Delivery", us: true, others: true },
  { feature: "24/7 Customer Support", us: true, others: false },
  { feature: "Warranty Included", us: true, others: false },
];

const defaultKeyPoints: KeyPoint[] = [
  { icon: "Shield", title: "100% Authentic", desc: "Every product is sourced directly from authorized distributors" },
  { icon: "Truck", title: "Fast Delivery", desc: "Delivery within 2-5 business days across Bangladesh" },
  { icon: "Headphones", title: "24/7 Support", desc: "We're always here to help via phone, chat, or email" },
  { icon: "RotateCcw", title: "Easy Returns", desc: "7-day hassle-free return and exchange policy" },
];

const defaultReviews: ReviewItem[] = [
  { name: "Rafiq Ahmed", rating: 5, comment: "Amazing quality headphones! Sound is crystal clear. Delivery was super fast to Dhaka." },
  { name: "Tasnia Islam", rating: 5, comment: "Best smartwatch at this price. Battery lasts 5 days easily. Very happy with the purchase!" },
  { name: "Kamal Hossain", rating: 4, comment: "Good product, packaging was excellent. Customer support helped with setup. Highly recommended." },
  { name: "Nusrat Jahan", rating: 5, comment: "Ordered a keyboard and mouse combo. Both are premium quality. Will definitely order again!" },
];

const AdminSettings = () => {
  const [announcements, setAnnouncements] = useState<string[]>([
    "🚚 Free shipping on orders over ৳5,000",
    "🔥 Flash Sale — Up to 50% off on selected gadgets",
    "📦 Cash on Delivery available nationwide",
    "⚡ New arrivals every week — Stay tuned!",
  ]);
  const [heroImage, setHeroImage] = useState("");
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>(defaultPromoBanners);
  const [comparisons, setComparisons] = useState<ComparisonItem[]>(defaultComparisons);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>(defaultKeyPoints);
  const [reviews, setReviews] = useState<ReviewItem[]>(defaultReviews);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["top_bar_announcements", "hero_image", "promo_banners", "comparison_items", "key_points", "homepage_reviews"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "top_bar_announcements" && Array.isArray(row.value)) {
            setAnnouncements(row.value as string[]);
          }
          if (row.key === "hero_image" && typeof row.value === "string") {
            setHeroImage(row.value);
          }
          if (row.key === "promo_banners" && Array.isArray(row.value)) {
            setPromoBanners(row.value as unknown as PromoBanner[]);
          }
          if (row.key === "comparison_items" && Array.isArray(row.value)) {
            setComparisons(row.value as unknown as ComparisonItem[]);
          }
          if (row.key === "key_points" && Array.isArray(row.value)) {
            setKeyPoints(row.value as unknown as KeyPoint[]);
          }
          if (row.key === "homepage_reviews" && Array.isArray(row.value)) {
            setReviews(row.value as unknown as ReviewItem[]);
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

  // Promo banner helpers
  const updateBanner = (index: number, field: keyof PromoBanner, value: string) => {
    const updated = [...promoBanners];
    updated[index] = { ...updated[index], [field]: value };
    setPromoBanners(updated);
  };

  const addBanner = () => {
    setPromoBanners([...promoBanners, { title: "", subtitle: "", label: "", linkText: "", linkUrl: "/shop", imageUrl: "", variant: "primary" }]);
  };

  const removeBanner = (index: number) => {
    setPromoBanners(promoBanners.filter((_, i) => i !== index));
  };

  // Comparison helpers
  const updateComparison = (index: number, field: keyof ComparisonItem, value: any) => {
    const updated = [...comparisons];
    updated[index] = { ...updated[index], [field]: value };
    setComparisons(updated);
  };

  const addComparison = () => {
    setComparisons([...comparisons, { feature: "", us: true, others: false }]);
  };

  const removeComparison = (index: number) => {
    setComparisons(comparisons.filter((_, i) => i !== index));
  };

  // Key points helpers
  const updateKeyPoint = (index: number, field: keyof KeyPoint, value: string) => {
    const updated = [...keyPoints];
    updated[index] = { ...updated[index], [field]: value };
    setKeyPoints(updated);
  };

  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, { icon: "Shield", title: "", desc: "" }]);
  };

  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  // Reviews helpers
  const updateReview = (index: number, field: keyof ReviewItem, value: any) => {
    const updated = [...reviews];
    updated[index] = { ...updated[index], [field]: value };
    setReviews(updated);
  };

  const addReview = () => {
    setReviews([...reviews, { name: "", rating: 5, comment: "" }]);
  };

  const removeReview = (index: number) => {
    setReviews(reviews.filter((_, i) => i !== index));
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
        <SingleImageUpload
          image={heroImage}
          onChange={(url) => setHeroImage(url)}
          folder="hero"
        />
        <Button
          className="rounded-full"
          disabled={saving === "hero_image"}
          onClick={() => saveSetting("hero_image", heroImage)}
        >
          {saving === "hero_image" ? "Saving..." : "Save Hero Image"}
        </Button>
      </Card>

      {/* Promo Banners */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Promo Banners</h2>
        <p className="text-sm text-muted-foreground">Manage the two promotional banners on the homepage.</p>
        <div className="space-y-6">
          {promoBanners.map((banner, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Banner {i + 1}</span>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeBanner(i)} disabled={promoBanners.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Label</Label><Input value={banner.label} onChange={(e) => updateBanner(i, "label", e.target.value)} placeholder="e.g. Limited Offer" /></div>
                <div>
                  <Label>Style</Label>
                  <Select value={banner.variant} onValueChange={(v) => updateBanner(i, "variant", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary (dark bg)</SelectItem>
                      <SelectItem value="secondary">Secondary (light bg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2"><Label>Title (use \n for line break)</Label><Input value={banner.title} onChange={(e) => updateBanner(i, "title", e.target.value)} placeholder="Up to 40% Off\nAudio Gear" /></div>
                <div><Label>Button Text</Label><Input value={banner.linkText} onChange={(e) => updateBanner(i, "linkText", e.target.value)} placeholder="Shop Audio →" /></div>
                <div><Label>Button Link</Label><Input value={banner.linkUrl} onChange={(e) => updateBanner(i, "linkUrl", e.target.value)} placeholder="/shop?category=..." /></div>
                <div className="sm:col-span-2"><Label>Background Image URL</Label><Input value={banner.imageUrl} onChange={(e) => updateBanner(i, "imageUrl", e.target.value)} placeholder="https://..." /></div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addBanner} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Banner
        </Button>
        <div>
          <Button className="rounded-full" disabled={saving === "promo_banners"} onClick={() => saveSetting("promo_banners", promoBanners)}>
            {saving === "promo_banners" ? "Saving..." : "Save Promo Banners"}
          </Button>
        </div>
      </Card>

      {/* Comparison Table */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Why Techllect — Comparison Table</h2>
        <p className="text-sm text-muted-foreground">Manage the "Why Techllect?" comparison table items.</p>
        <div className="space-y-3">
          {comparisons.map((item, i) => (
            <div key={i} className="flex items-center gap-3 border rounded-lg p-3">
              <Input value={item.feature} onChange={(e) => updateComparison(i, "feature", e.target.value)} placeholder="Feature name" className="flex-1" />
              <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                <Label className="text-xs">Us</Label>
                <Switch checked={item.us} onCheckedChange={(v) => updateComparison(i, "us", v)} />
              </div>
              <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                <Label className="text-xs">Others</Label>
                <Switch checked={item.others} onCheckedChange={(v) => updateComparison(i, "others", v)} />
              </div>
              <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => removeComparison(i)} disabled={comparisons.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addComparison} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Feature
        </Button>
        <div>
          <Button className="rounded-full" disabled={saving === "comparison_items"} onClick={() => saveSetting("comparison_items", comparisons.filter(c => c.feature.trim()))}>
            {saving === "comparison_items" ? "Saving..." : "Save Comparison Table"}
          </Button>
        </div>
      </Card>

      {/* Key Points */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Key Points</h2>
        <p className="text-sm text-muted-foreground">Manage the 4 feature cards below the comparison table.</p>
        <div className="space-y-3">
          {keyPoints.map((point, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Point {i + 1}</span>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeKeyPoint(i)} disabled={keyPoints.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Icon</Label>
                  <Select value={point.icon} onValueChange={(v) => updateKeyPoint(i, "icon", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shield">Shield</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Headphones">Headphones</SelectItem>
                      <SelectItem value="RotateCcw">Return</SelectItem>
                      <SelectItem value="Star">Star</SelectItem>
                      <SelectItem value="Heart">Heart</SelectItem>
                      <SelectItem value="Zap">Zap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Title</Label><Input value={point.title} onChange={(e) => updateKeyPoint(i, "title", e.target.value)} placeholder="100% Authentic" /></div>
                <div><Label>Description</Label><Input value={point.desc} onChange={(e) => updateKeyPoint(i, "desc", e.target.value)} placeholder="Short description" /></div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addKeyPoint} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Key Point
        </Button>
        <div>
          <Button className="rounded-full" disabled={saving === "key_points"} onClick={() => saveSetting("key_points", keyPoints.filter(k => k.title.trim()))}>
            {saving === "key_points" ? "Saving..." : "Save Key Points"}
          </Button>
        </div>
      </Card>

      {/* Customer Reviews */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Homepage Reviews</h2>
        <p className="text-sm text-muted-foreground">Manage the customer testimonials shown on the homepage.</p>
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Review {i + 1}</span>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeReview(i)} disabled={reviews.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Reviewer Name</Label><Input value={review.name} onChange={(e) => updateReview(i, "name", e.target.value)} placeholder="John Doe" /></div>
                <div>
                  <Label>Rating</Label>
                  <Select value={String(review.rating)} onValueChange={(v) => updateReview(i, "rating", Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map(r => (
                        <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2"><Label>Comment</Label><Textarea value={review.comment} onChange={(e) => updateReview(i, "comment", e.target.value)} placeholder="Amazing product..." rows={2} /></div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addReview} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Review
        </Button>
        <div>
          <Button className="rounded-full" disabled={saving === "homepage_reviews"} onClick={() => saveSetting("homepage_reviews", reviews.filter(r => r.name.trim()))}>
            {saving === "homepage_reviews" ? "Saving..." : "Save Reviews"}
          </Button>
        </div>
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
