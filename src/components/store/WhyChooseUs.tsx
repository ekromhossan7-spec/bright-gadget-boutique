import { useState, useEffect } from "react";
import { Check, X, Shield, Truck, Headphones, RotateCcw, Star, Heart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ComparisonItem {
  feature: string;
  us: boolean;
  others: boolean;
}

interface KeyPoint {
  icon: string;
  title: string;
  desc: string;
}

const defaultComparisons: ComparisonItem[] = [
  { feature: "Original Products", us: true, others: false },
  { feature: "Cash on Delivery", us: true, others: false },
  { feature: "7-Day Easy Return", us: true, others: false },
  { feature: "Nationwide Delivery", us: true, others: true },
  { feature: "24/7 Customer Support", us: true, others: false },
  { feature: "Warranty Included", us: true, others: false },
];

const defaultKeyPoints: KeyPoint[] = [
  { icon: "Shield", title: "100% Authentic", desc: "Every product is sourced directly from authorized distributors" },
  { icon: "Truck", title: "Fast Delivery", desc: "Delivery within 2-5 business days across Bangladesh" },
  { icon: "Headphones", title: "24/7 Support", desc: "We're always here to help via phone, chat, or email" },
  { icon: "RotateCcw", title: "Easy Returns", desc: "7-day hassle-free return and exchange policy" },
];

const iconMap: Record<string, any> = { Shield, Truck, Headphones, RotateCcw, Star, Heart, Zap };

const WhyChooseUs = () => {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>(defaultComparisons);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>(defaultKeyPoints);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["comparison_items", "key_points"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "comparison_items" && Array.isArray(row.value)) {
            setComparisons(row.value as unknown as ComparisonItem[]);
          }
          if (row.key === "key_points" && Array.isArray(row.value)) {
            setKeyPoints(row.value as unknown as KeyPoint[]);
          }
        });
      }
    };
    fetch();
  }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Why Best E-Shop?</h2>
          <p className="text-muted-foreground">See how we compare</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto mb-16"
        >
          <div className="rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-3 bg-primary text-primary-foreground p-4 text-sm font-semibold">
              <span>Feature</span>
              <span className="text-center">Best E-Shop</span>
              <span className="text-center">Others</span>
            </div>
            {comparisons.map((item, i) => (
              <div key={i} className={`grid grid-cols-3 p-4 text-sm ${i % 2 === 0 ? "bg-secondary/50" : ""}`}>
                <span className="font-medium">{item.feature}</span>
                <span className="flex justify-center">
                  {item.us ? <Check className="h-5 w-5 text-success" /> : <X className="h-5 w-5 text-destructive" />}
                </span>
                <span className="flex justify-center">
                  {item.others ? <Check className="h-5 w-5 text-success" /> : <X className="h-5 w-5 text-destructive" />}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyPoints.map((point, i) => {
            const IconComp = iconMap[point.icon] || Shield;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                      <IconComp className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="font-semibold mb-2">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
