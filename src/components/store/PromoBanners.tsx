import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const PromoBanners = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden bg-primary p-8 sm:p-10 min-h-[280px] flex flex-col justify-end"
        >
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Limited Offer</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">Up to 40% Off<br />Audio Gear</h3>
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
              <Link to="/shop?category=headphones">Shop Audio →</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden bg-secondary p-8 sm:p-10 min-h-[280px] flex flex-col justify-end"
        >
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">New Arrivals</p>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Smart Wearables<br />Collection</h3>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link to="/shop?category=smartwatches">Explore Now →</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoBanners;
