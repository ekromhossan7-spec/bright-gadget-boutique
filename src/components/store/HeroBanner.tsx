import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlider {
  id: string;
  image_url: string;
  link_url: string;
}

const HeroBanner = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, sliderRes] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order").limit(10),
        supabase.from("hero_sliders").select("*").eq("active", true).order("sort_order"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (sliderRes.data) setSliders(sliderRes.data);
    };
    fetchData();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  // Fixed height for sidebar: 9 items × 42px each + header 44px ≈ 422px
  const SIDEBAR_HEIGHT = 422;

  return (
    <section className="py-4 sm:py-6">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          {/* Category Sidebar - hidden on mobile */}
          <div className="hidden lg:flex flex-col" style={{ height: SIDEBAR_HEIGHT }}>
            <div className="bg-accent text-accent-foreground rounded-t-xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-bold text-sm">All Categories</span>
            </div>
            <div className="bg-background border border-t-0 rounded-b-xl flex-1 overflow-y-auto hero-sidebar-scroll">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-b-0 hover:bg-accent/10 hover:pl-5 transition-all duration-200 group"
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-6 h-6 rounded-md object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
                      <FolderTree className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground flex-1 group-hover:text-accent transition-colors">{cat.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
              {categories.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">No categories</div>
              )}
            </div>
          </div>

          {/* Mobile Categories Button */}
          <div className="lg:hidden">
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Browse Categories
            </Link>
          </div>

          {/* Slider */}
          <div
            className="relative rounded-xl overflow-hidden bg-secondary border-2 border-accent ring-2 ring-accent/20"
            style={{ height: SIDEBAR_HEIGHT }}
          >
            {sliders.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Link to={sliders[currentSlide]?.link_url || "/shop"}>
                      <img
                        src={sliders[currentSlide]?.image_url}
                        alt={`Slide ${currentSlide + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  </motion.div>
                </AnimatePresence>

                {sliders.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    {sliders.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-2.5 rounded-full transition-all ${
                          i === currentSlide
                            ? "w-7 bg-accent"
                            : "w-2.5 bg-background/60 hover:bg-background/80"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
