import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

interface ReviewFormProps {
  productId: string;
  onSubmitted: () => void;
}

const ReviewForm = ({ productId, onSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-6 border rounded-xl bg-secondary/30">
        <p className="text-muted-foreground mb-3">Please log in to write a review</p>
        <Button asChild className="rounded-full"><Link to="/login">Login</Link></Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (!name.trim()) { toast.error("Please enter your name"); return; }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      reviewer_name: name.trim(),
      rating,
      comment: comment.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Review submitted! It will appear after approval.");
      setRating(0);
      setName("");
      setComment("");
      onSubmitted();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-5 space-y-4 bg-secondary/20">
      <h3 className="font-bold">Write a Review</h3>
      <div>
        <Label className="mb-2 block">Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <Star className={`h-6 w-6 transition-colors ${s <= (hoverRating || rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Your Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required maxLength={100} />
      </div>
      <div>
        <Label>Comment</Label>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." maxLength={1000} rows={3} />
      </div>
      <Button type="submit" className="rounded-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
