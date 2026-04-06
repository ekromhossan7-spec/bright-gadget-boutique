import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroBanner = () => {
  return (
    <section className="relative bg-primary overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
      </div>
      <div className="container relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-accent font-semibold text-sm uppercase tracking-widest mb-4"
          >
            New Collection 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6"
          >
            Premium Gadgets
            <br />
            <span className="text-accent">For Everyone</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary-foreground/70 text-lg mb-8 max-w-lg"
          >
            Discover the latest tech accessories, smart devices, and premium gadgets at unbeatable prices.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">
              <Link to="/shop">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/categories">Browse Categories</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
