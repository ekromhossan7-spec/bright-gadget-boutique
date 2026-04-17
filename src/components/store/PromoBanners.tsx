import { NO_IMAGE } from "@/lib/placeholder";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface PromoBanner {
  title: string;
  label: string;
  linkText: string;
  linkUrl: string;
  imageUrl: string;
  variant: "primary" | "secondary";
}

const defaultBanners: PromoBanner[] = [
  { title: "Up to 40% Off\nAudio Gear", label: "Limited Offer", linkText: "Shop Audio →", linkUrl: "/shop?category=headphones", imageUrl: NO_IMAGE, variant: "primary" },
  { title: "Smart Wearables\nCollection", label: "New Arrivals", linkText: "Explore Now →", linkUrl: "/shop?category=smartwatches", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop", variant: "secondary" },
];

const PromoBanners = () => {
  const [banners, setBanners] = useState<PromoBanner[]>(defaultBanners);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "promo_banners")
        .single();
      if (data?.value && Array.isArray(data.value)) {
        setBanners(data.value as unknown as PromoBanner[]);
      }
    };
    fetch();
  }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`relative rounded-2xl overflow-hidden ${banner.variant === "primary" ? "bg-primary" : "bg-secondary"} p-8 sm:p-10 min-h-[280px] flex flex-col justify-end`}
          >
            <div className={`absolute inset-0 ${banner.variant === "primary" ? "opacity-20" : "opacity-10"}`}>
              <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10">
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">{banner.label}</p>
              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${banner.variant === "primary" ? "text-primary-foreground" : ""}`}>
                {banner.title.split("\\n").map((line, j) => (
                  <span key={j}>{line}{j < banner.title.split("\\n").length - 1 && <br />}</span>
                ))}
              </h3>
              {banner.variant === "primary" ? (
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
                  <Link to={banner.linkUrl}>{banner.linkText}</Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link to={banner.linkUrl}>{banner.linkText}</Link>
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PromoBanners;
