import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const reviews = [
  { name: "Rafiq Ahmed", rating: 5, comment: "Amazing quality headphones! Sound is crystal clear. Delivery was super fast to Dhaka.", avatar: "R" },
  { name: "Tasnia Islam", rating: 5, comment: "Best smartwatch at this price. Battery lasts 5 days easily. Very happy with the purchase!", avatar: "T" },
  { name: "Kamal Hossain", rating: 4, comment: "Good product, packaging was excellent. Customer support helped with setup. Highly recommended.", avatar: "K" },
  { name: "Nusrat Jahan", rating: 5, comment: "Ordered a keyboard and mouse combo. Both are premium quality. Will definitely order again!", avatar: "N" },
];

const CustomerReviews = () => {
  return (
    <section className="py-12 sm:py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground">Real reviews from real people</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-accent/30 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < review.rating ? "fill-accent text-accent" : "text-border"}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {review.avatar}
                    </div>
                    <span className="font-medium text-sm">{review.name}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
