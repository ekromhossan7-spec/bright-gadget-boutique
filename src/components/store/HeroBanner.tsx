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

  return (
    <section className="py-4 sm:py-6">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Category Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-accent text-accent-foreground rounded-t-xl px-4 py-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-bold text-sm">All Categories</span>
            </div>
            <div className="bg-background border border-t-0 rounded-b-xl divide-y">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors group"
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                      <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground flex-1">{cat.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </Link>
              ))}
              {categories.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">No categories</div>
              )}
            </div>
          </div>

          {/* Slider */}
          <div className="relative rounded-xl overflow-hidden bg-secondary aspect-[2.2/1] min-h-[200px] sm:min-h-[300px] lg:min-h-[380px] border-2 border-accent ring-2 ring-accent/20">
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

                {/* Dots */}
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
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">Add hero slider images from Admin → Settings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
