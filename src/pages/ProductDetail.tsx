import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { ShoppingCart, Heart, Minus, Plus, Star, Truck, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewForm from "@/components/store/ReviewForm";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").eq("slug", slug).single();
      if (data) {
        setProduct(data);
        // Fetch related products
        const { data: rel } = await supabase.from("products").select("*").eq("category_id", data.category_id).neq("id", data.id).limit(4);
        if (rel) setRelated(rel);
        // Fetch reviews
        const { data: rev } = await supabase.from("reviews").select("*").eq("product_id", data.id).eq("approved", true).order("created_at", { ascending: false });
        if (rev) setReviews(rev);
      }
      setLoading(false);
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar /><Header />
        <main className="flex-1 py-8"><div className="container"><div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-20 w-full" /><Skeleton className="h-12 w-full" /></div>
        </div></div></main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar /><Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center"><h1 className="text-2xl font-bold mb-2">Product Not Found</h1><Button asChild className="rounded-full mt-4"><Link to="/shop">Go to Shop</Link></Button></div>
        </main>
        <Footer />
      </div>
    );
  }

  const colorVariants = Array.isArray((product as any).color_variants) ? (product as any).color_variants : [];
  const activeColorVariant = colorVariants.find((c: any) => c.name === selectedColor);
  const images = activeColorVariant?.image
    ? [activeColorVariant.image, ...(product.images?.length ? product.images : [])]
    : product.images?.length ? product.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"];
  const discount = product.compare_price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;
  const avgRating = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar /><Header />
      <main className="flex-1 py-6 sm:py-10">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-muted-foreground mb-6 gap-1">
            <Link to="/" className="hover:text-foreground">Home</Link><ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-foreground">Shop</Link><ChevronRight className="h-3 w-3" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary mb-3">
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? "border-accent" : "border-transparent"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {discount > 0 && <Badge className="bg-destructive text-destructive-foreground">-{discount}% OFF</Badge>}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? "fill-warning text-warning" : "text-muted"}`} />)}</div>
                  <span className="text-sm font-medium">{avgRating}</span>
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-accent">৳{product.price.toLocaleString()}</span>
                {product.compare_price && <span className="text-lg text-muted-foreground line-through">৳{product.compare_price.toLocaleString()}</span>}
              </div>

              <p className="text-muted-foreground">{product.short_description || product.description}</p>

              {(product.in_stock !== false && (product.stock_quantity === null || product.stock_quantity > 0)) ? (
                <Badge variant="outline" className="border-success text-success">In Stock</Badge>
              ) : (
                <Badge variant="outline" className="border-destructive text-destructive">Out of Stock</Badge>
              )}

              {/* Color Variants */}
              {colorVariants.length > 0 && (
                <div>
                  <span className="text-sm font-medium mb-2 block">Color: {selectedColor || "Select a color"}</span>
                  <div className="flex gap-2 flex-wrap">
                    {colorVariants.map((cv: any) => (
                      <button
                        key={cv.name}
                        onClick={() => { setSelectedColor(cv.name); setSelectedImage(0); }}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === cv.name ? "border-accent scale-110 ring-2 ring-accent/30" : "border-muted hover:border-foreground/50"}`}
                        style={{ backgroundColor: cv.hex }}
                        title={cv.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-full">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-l-full"><Minus className="h-4 w-4" /></button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-r-full"><Plus className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button size="lg" className="flex-1 rounded-full" disabled={!(product.in_stock !== false && (product.stock_quantity === null || product.stock_quantity > 0)) || (colorVariants.length > 0 && !selectedColor)} onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, image: activeColorVariant?.image || images[0], slug: product.slug, color: selectedColor || undefined }, quantity); navigate('/cart'); }}>
                  <ShoppingCart className="h-5 w-5 mr-2" />{(product.in_stock !== false && (product.stock_quantity === null || product.stock_quantity > 0)) ? (colorVariants.length > 0 && !selectedColor ? "Select a Color" : "Add to Cart") : "Out of Stock"}
                </Button>
                <Button size="lg" variant="outline" className={`rounded-full ${isInWishlist(product.id) ? "text-destructive border-destructive" : ""}`} onClick={() => toggleItem(product.id)}>
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-destructive" : ""}`} />
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center"><Truck className="h-5 w-5 mx-auto text-accent mb-1" /><span className="text-xs text-muted-foreground">Shipping</span></div>
                <div className="text-center"><ShieldCheck className="h-5 w-5 mx-auto text-accent mb-1" /><span className="text-xs text-muted-foreground">Genuine Product</span></div>
                <div className="text-center"><RotateCcw className="h-5 w-5 mx-auto text-accent mb-1" /><span className="text-xs text-muted-foreground">Easy Returns</span></div>
              </div>

              {/* SKU */}
              {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}
            </motion.div>
          </div>

          {/* Tabs: Description, Specs, Reviews */}
          <Tabs defaultValue="description" className="mt-12">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="border rounded-xl p-6 mt-4">
              <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />
            </TabsContent>
            <TabsContent value="specs" className="border rounded-xl p-6 mt-4">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <table className="w-full"><tbody>
                  {Object.entries(product.specifications as Record<string, string>).map(([k, v]) => (
                    <tr key={k} className="border-b last:border-0"><td className="py-3 font-medium capitalize">{k}</td><td className="py-3 text-muted-foreground">{v}</td></tr>
                  ))}
                </tbody></table>
              ) : <p className="text-muted-foreground">No specifications available.</p>}
            </TabsContent>
            <TabsContent value="reviews" className="border rounded-xl p-6 mt-4 space-y-6">
              {reviews.length === 0 ? <p className="text-muted-foreground">No reviews yet. Be the first to review!</p> : (
                <div className="space-y-4">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{r.reviewer_name}</span>
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-warning text-warning" : "text-muted"}`} />)}</div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
              <ReviewForm productId={product.id} onSubmitted={() => {
                supabase.from("reviews").select("*").eq("product_id", product.id).eq("approved", true).order("created_at", { ascending: false }).then(({ data }) => { if (data) setReviews(data); });
              }} />
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map((p) => (
                  <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} price={p.price} comparePrice={p.compare_price} image={p.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"} inStock={p.in_stock !== false && (p.stock_quantity === null || p.stock_quantity > 0)} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
