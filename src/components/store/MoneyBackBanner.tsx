import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MoneyBackData {
  title: string;
  description: string;
}

const defaultData: MoneyBackData = {
  title: "100% Money Back Guarantee",
  description: "If you're not completely satisfied with your purchase, return it within 7 days for a full refund. No questions asked.",
};

const MoneyBackBanner = () => {
  const [data, setData] = useState<MoneyBackData>(defaultData);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "moneyback_settings")
        .single();
      if (row?.value && typeof row.value === "object") {
        setData(prev => ({ ...prev, ...(row.value as unknown as MoneyBackData) }));
      }
    };
    fetch();
  }, []);

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
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">{data.title}</h2>
            <p className="text-primary-foreground/70 max-w-lg mx-auto text-sm sm:text-base">
              {data.description}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoneyBackBanner;
