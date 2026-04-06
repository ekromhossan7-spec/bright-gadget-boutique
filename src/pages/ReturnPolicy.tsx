import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { ShieldCheck, Clock, Package, AlertCircle } from "lucide-react";

const policies = [
  { icon: Clock, title: "7-Day Return Window", desc: "You can return any product within 7 days of delivery if it's unused and in its original packaging." },
  { icon: Package, title: "Original Packaging Required", desc: "Items must be returned in their original box with all accessories, manuals, and tags included." },
  { icon: ShieldCheck, title: "Defective Product Replacement", desc: "If you receive a defective or damaged product, we'll replace it free of charge within 48 hours." },
  { icon: AlertCircle, title: "Non-Returnable Items", desc: "Opened earbuds, software products, and personalized items cannot be returned for hygiene and security reasons." },
];

const ReturnPolicy = () => (
  <div className="min-h-screen flex flex-col">
    <TopBar />
    <Header />
    <main className="flex-1 py-12 sm:py-16">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Return Policy</h1>
        <p className="text-muted-foreground mb-10">We want you to be 100% satisfied with your purchase. Here's our return policy.</p>
        <div className="grid gap-6">
          {policies.map((p) => (
            <div key={p.title} className="flex gap-4 p-6 border rounded-2xl bg-card">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <p.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 p-6 bg-secondary/50 rounded-2xl">
          <h3 className="font-semibold mb-2">How to Return</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Contact us at <a href="tel:+8801835925510" className="text-accent font-medium">+88 01835 925510</a> with your order number.</li>
            <li>Pack the item securely in its original packaging.</li>
            <li>Our courier will pick up the item from your location.</li>
            <li>Refund or replacement will be processed within 3-5 business days.</li>
          </ol>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default ReturnPolicy;
