import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const AllProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (data) setProducts(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">All Products</h2>
              <p className="text-muted-foreground text-sm">Browse our full collection</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">All Products</h2>
            <p className="text-muted-foreground text-sm">Browse our full collection</p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/shop">View All →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
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
    </section>
  );
};

export default AllProducts;
