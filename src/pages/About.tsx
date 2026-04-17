import { useState, useEffect } from "react";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { ShieldCheck, Truck, Heart, Award } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const values = [
  { icon: ShieldCheck, title: "100% Genuine", desc: "Every product is sourced from authorized distributors." },
  { icon: Truck, title: "Nationwide Delivery", desc: "Fast & reliable delivery across Bangladesh." },
  { icon: Heart, title: "Customer First", desc: "We prioritize your satisfaction above everything." },
  { icon: Award, title: "Best Prices", desc: "Competitive prices with regular deals and offers." },
];

interface TeamMember { name: string; role: string; image: string; }

const About = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "about_page")
        .maybeSingle();
      if (row?.value && typeof row.value === "object") setData(row.value);
      setLoading(false);
    };
    fetch();
  }, []);

  const d = {
    hero_title: data?.hero_title || "About Best E-Shop",
    hero_description: data?.hero_description || "Best E-Shop is a premium gadget destination in Bangladesh. We bring you the latest in technology — from smartphones and smartwatches to gaming gear and audio accessories — all backed by genuine warranty and exceptional service.",
    story_title: data?.story_title || "Our Story",
    story_p1: data?.story_p1 || "Founded with a passion for technology, Best E-Shop started as a small venture to make premium gadgets accessible to everyone in Bangladesh.",
    story_p2: data?.story_p2 || "Today, we serve thousands of happy customers with a curated selection of the best tech products at competitive prices, backed by genuine warranty and dedicated support.",
    story_image: data?.story_image || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop",
    mission: data?.mission || "",
    vision: data?.vision || "",
    team: (data?.team as TeamMember[]) || [],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-secondary/40 py-16 sm:py-24">
          <div className="container text-center max-w-3xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-5xl font-bold mb-4">
              {d.hero_title.includes("Best E-Shop") ? (
                <>{d.hero_title.split("Best E-Shop")[0]}<span className="text-accent">Best E-Shop</span>{d.hero_title.split("Best E-Shop")[1]}</>
              ) : d.hero_title}
            </motion.h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{d.hero_description}</p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">{d.story_title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{d.story_p1}</p>
                <p className="text-muted-foreground leading-relaxed">{d.story_p2}</p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl border">
                <img src={d.story_image} alt="Our story" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        {(d.mission || d.vision) && (
          <section className="py-16 bg-secondary/20">
            <div className="container max-w-4xl">
              <div className="grid md:grid-cols-2 gap-8">
                {d.mission && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-background rounded-2xl p-8 border">
                    <h3 className="text-xl font-bold mb-3 text-accent">Our Mission</h3>
                    <p className="text-muted-foreground leading-relaxed">{d.mission}</p>
                  </motion.div>
                )}
                {d.vision && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="bg-background rounded-2xl p-8 border">
                    <h3 className="text-xl font-bold mb-3 text-accent">Our Vision</h3>
                    <p className="text-muted-foreground leading-relaxed">{d.vision}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Team */}
        {d.team.length > 0 && (
          <section className="py-16">
            <div className="container">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Meet Our Team</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {d.team.map((member: TeamMember, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-card rounded-2xl border overflow-hidden text-center">
                    {member.image && (
                      <div className="aspect-square overflow-hidden bg-secondary">
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold">{member.name}</h3>
                      {member.role && <p className="text-sm text-muted-foreground">{member.role}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Values */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Why Best E-Shop?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-background rounded-2xl p-6 border text-center">
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
