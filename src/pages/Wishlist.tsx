import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

const Wishlist = () => {
  const { items: wishlistIds, removeItem } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlistIds.length === 0) { setProducts([]); setLoading(false); return; }
      const { data } = await supabase.from("products").select("*").in("id", wishlistIds);
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [wishlistIds]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar /><Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">
            <Heart className="inline h-7 w-7 mr-2 text-destructive" />
            My Wishlist ({wishlistIds.length})
          </h1>

          {wishlistIds.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Save items you love for later</p>
              <Button asChild className="rounded-full"><Link to="/shop">Browse Products</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="border rounded-xl p-4 flex items-center gap-4">
                  <Link to={`/product/${p.slug}`}>
                    <img src={p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"} alt={p.name} className="w-20 h-20 rounded-lg object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${p.slug}`} className="font-medium hover:text-accent line-clamp-1">{p.name}</Link>
                    <p className="text-accent font-bold mt-1">৳{p.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" className="rounded-full" onClick={() => addItem({ id: p.id, name: p.name, price: p.price, image: p.images?.[0] || "", slug: p.slug })}>
                      <ShoppingCart className="h-4 w-4 mr-1" />Add
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => removeItem(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
