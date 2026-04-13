import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AllProducts = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, any[]>>({});
  const [uncategorized, setUncategorized] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id, name, slug").order("sort_order"),
        supabase.from("products").select("*").eq("in_stock", true).order("created_at", { ascending: false }),
      ]);

      const cats = catRes.data || [];
      const prods = prodRes.data || [];

      // Group products by category
      const grouped: Record<string, any[]> = {};
      const noCategory: any[] = [];

      for (const p of prods) {
        if (p.category_id) {
          if (!grouped[p.category_id]) grouped[p.category_id] = [];
          grouped[p.category_id].push(p);
        } else {
          noCategory.push(p);
        }
      }

      // Only keep categories that have products
      const activeCats = cats.filter((c) => grouped[c.id]?.length > 0);

      setCategories(activeCats);
      setProductsByCategory(grouped);
      setUncategorized(noCategory);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="container space-y-12">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="space-y-3">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const hasContent = categories.length > 0 || uncategorized.length > 0;
  if (!hasContent) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container space-y-14">
        {categories.map((cat) => {
          const items = productsByCategory[cat.id] || [];
          const displayItems = items.slice(0, 5);
          const hasMore = items.length > 5;

          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-primary pb-1">
                  {cat.name}
                </h2>
                {hasMore && (
                  <Button asChild variant="default" size="sm" className="rounded-full text-xs">
                    <Link to={`/shop?category=${cat.slug}`}>See More →</Link>
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {displayItems.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    comparePrice={p.compare_price}
                    image={p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80"}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Uncategorized products */}
        {uncategorized.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-primary pb-1">
                Other Products
              </h2>
              <Button asChild variant="default" size="sm" className="rounded-full text-xs">
                <Link to="/shop">See More →</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {uncategorized.slice(0, 5).map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  comparePrice={p.compare_price}
                  image={p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80"}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllProducts;
