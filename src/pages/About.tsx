import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { ShieldCheck, Truck, Heart, Award } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  { icon: ShieldCheck, title: "100% Genuine", desc: "Every product is sourced from authorized distributors." },
  { icon: Truck, title: "Nationwide Delivery", desc: "Fast & reliable delivery across Bangladesh." },
  { icon: Heart, title: "Customer First", desc: "We prioritize your satisfaction above everything." },
  { icon: Award, title: "Best Prices", desc: "Competitive prices with regular deals and offers." },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-secondary/40 py-16 sm:py-24">
          <div className="container text-center max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-bold mb-4"
            >
              About <span className="text-accent">Techllect</span>
            </motion.h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Techllect is a premium gadget destination in Bangladesh. We bring you the latest in technology — 
              from smartphones and smartwatches to gaming gear and audio accessories — all backed by genuine warranty and exceptional service.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded with a passion for technology, Techllect started as a small venture to make premium gadgets accessible to everyone in Bangladesh.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, we serve thousands of happy customers with a curated selection of the best tech products at competitive prices, backed by genuine warranty and dedicated support.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl border">
                <img
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop"
                  alt="Technology workspace"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Why Techllect?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-2xl p-6 border text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
