import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import HeroSliderSettings from "@/components/admin/settings/HeroSliderSettings";
import AdBannerSettings from "@/components/admin/settings/AdBannerSettings";

const HomePageSettings = () => {
  return (
    <div className="space-y-6">
      <Card className="p-5 bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hero Slider, Ad Banner, Featured Categories, Promo Banners, Comparison Table, Key Points, and Reviews are managed here and in{" "}
            <Link to="/admin/settings" className="text-primary underline">General Settings</Link>.
          </p>
          <Link to="/" target="_blank" className="text-primary hover:underline flex items-center gap-1 text-sm shrink-0">
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </Link>
        </div>
      </Card>

      <HeroSliderSettings />
      <AdBannerSettings />
    </div>
  );
};

export default HomePageSettings;
