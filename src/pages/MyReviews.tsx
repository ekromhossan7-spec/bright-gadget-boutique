import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/store/Header";
import TopBar from "@/components/store/TopBar";
import Footer from "@/components/store/Footer";
import { Star, Package, MessageSquare } from "lucide-react";

const MyReviews = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; image: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [{ data: orderData }, { data: reviewData }] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user.id).in("order_status", ["delivered", "shipped", "processing"]).order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (orderData) setOrders(orderData);
      if (reviewData) setMyReviews(reviewData);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const reviewedProductIds = new Set(myReviews.map((r) => r.product_id));

  const allOrderedProducts = orders.flatMap((order) => {
    const items = (order.items as any[]) || [];
    return items.map((item) => ({ ...item, order_number: order.order_number, order_date: order.created_at }));
  });

  const uniqueProducts = allOrderedProducts.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );

  const openReviewDialog = (product: any) => {
    setSelectedProduct({ id: product.id, name: product.name, image: product.image });
    setRating(0);
    setName("");
    setComment("");
    setReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct || !user) return;
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (!name.trim()) { toast.error("Please enter your name"); return; }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: selectedProduct.id,
      user_id: user.id,
      reviewer_name: name.trim(),
      rating,
      comment: comment.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Review submitted! It will appear after admin approval.");
      setReviewDialog(false);
      setMyReviews((prev) => [{ product_id: selectedProduct.id, rating, reviewer_name: name, comment, approved: false, created_at: new Date().toISOString() }, ...prev]);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar /><Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">My Reviews</h1>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/account">Back to Account</Link>
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : uniqueProducts.length === 0 ? (
            <div className="text-center py-12 border rounded-xl">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="font-medium mb-2">No products to review</p>
              <p className="text-sm text-muted-foreground mb-4">You can review products after your order is processed.</p>
              <Button asChild className="rounded-full"><Link to="/shop">Start Shopping</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {uniqueProducts.map((product) => {
                const reviewed = reviewedProductIds.has(product.id);
                const existingReview = myReviews.find((r) => r.product_id === product.id);
                return (
                  <div key={product.id} className="border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      {reviewed && existingReview ? (
                        <div className="mt-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3.5 w-3.5 ${s <= existingReview.rating ? "fill-warning text-warning" : "text-muted"}`} />
                            ))}
                            <Badge variant={existingReview.approved ? "default" : "secondary"} className="ml-2 text-xs">
                              {existingReview.approved ? "Published" : "Pending Approval"}
                            </Badge>
                          </div>
                          {existingReview.comment && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{existingReview.comment}</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not reviewed yet</p>
                      )}
                    </div>
                    {!reviewed && (
                      <Button size="sm" className="rounded-full" onClick={() => openReviewDialog(product)}>
                        <MessageSquare className="h-4 w-4 mr-1" />Write Review
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="mb-2 block">Rating *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="p-0.5">
                    <Star className={`h-7 w-7 transition-colors ${s <= (hoverRating || rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Your Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={100} />
            </div>
            <div>
              <Label>Comment</Label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." maxLength={1000} rows={3} />
            </div>
            <Button onClick={handleSubmitReview} className="w-full rounded-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyReviews;
