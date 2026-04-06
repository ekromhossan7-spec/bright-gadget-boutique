import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";
import { motion } from "framer-motion";

const HeroBanner = () => {
  return (
    <section className="relative bg-secondary/50 overflow-hidden min-h-[85vh] flex items-center">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-[15%] w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-[10%] w-3 h-3 rounded-full bg-accent/50 animate-pulse" />
      <div className="absolute bottom-32 right-[8%] w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-700" />
      <div className="absolute top-[40%] right-[5%] w-4 h-4 rounded-full border-2 border-accent/40" />

      <div className="container relative py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6">
              <Star className="h-3.5 w-3.5 fill-accent" />
              Trusted by 10,000+ Customers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold leading-[1.1] mb-6 text-foreground">
              Premium Gadgets
              <br />
              <span className="text-accent">With Pleasure</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-8 leading-relaxed">
              Let your lifestyle upgrade with the best tech. Discover premium gadgets, 
              smart devices & accessories — all at unbeatable prices with nationwide delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 shadow-lg shadow-accent/25">
                <Link to="/shop">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link to="/shop">Browse Categories</Link>
              </Button>
            </div>

            {/* Service badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: "Genuine Products" },
                { icon: Truck, label: "Fast Delivery" },
                { icon: Star, label: "7-Day Return" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 bg-background rounded-xl px-4 py-2.5 shadow-sm border text-xs font-medium"
                >
                  <badge.icon className="h-4 w-4 text-accent" />
                  {badge.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent/25 via-primary/15 to-accent/10 border border-accent/15" />

              <div className="absolute inset-12 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 bg-background border">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&q=80"
                  alt="Premium tech gadgets"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -top-2 right-0 bg-background rounded-2xl shadow-xl border p-4 z-10"
              >
                <p className="text-2xl font-bold text-accent">35K+</p>
                <p className="text-xs text-muted-foreground">Products sold<br />every month</p>
              </motion.div>

              {/* Floating review card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -bottom-2 left-0 bg-background rounded-2xl shadow-xl border p-4 z-10"
              >
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-xs font-medium">4.9 Rating</p>
                <p className="text-xs text-muted-foreground">2,400+ Reviews</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 left-4 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center"
              >
                <Truck className="h-5 w-5 text-accent" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-16 right-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <ShieldCheck className="h-5 w-5 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
