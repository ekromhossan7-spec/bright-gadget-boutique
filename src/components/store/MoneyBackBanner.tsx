import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const MoneyBackBanner = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-primary p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-accent blur-3xl" />
          </div>
          <div className="relative z-10">
            <ShieldCheck className="h-16 w-16 text-accent mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">100% Money Back Guarantee</h2>
            <p className="text-primary-foreground/70 max-w-lg mx-auto text-sm sm:text-base">
              If you're not completely satisfied with your purchase, return it within 7 days for a full refund. No questions asked.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoneyBackBanner;
