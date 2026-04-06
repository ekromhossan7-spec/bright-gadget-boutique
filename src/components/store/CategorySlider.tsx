import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const CategorySlider = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (data) setCategories(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Shop by Category</h2>
          <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-secondary/60 hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all group"
              >
                {cat.image_url ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors shadow-sm">
                    <FolderTree className="h-5 w-5" />
                  </div>
                )}
                <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
