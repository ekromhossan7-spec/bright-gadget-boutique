import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Truck, MapPin, Clock, BadgeCheck } from "lucide-react";

const info = [
  { icon: Truck, title: "Nationwide Delivery", desc: "We deliver across Bangladesh. Orders within Dhaka are delivered in 1-2 days, outside Dhaka in 3-5 business days." },
  { icon: MapPin, title: "Delivery Areas", desc: "We cover all 64 districts of Bangladesh including remote areas. Some sub-district areas may take an additional 1-2 days." },
  { icon: Clock, title: "Delivery Charges", desc: "Free delivery on orders above ৳5,000. Standard delivery charge is ৳120 inside Dhaka and ৳150 outside Dhaka." },
  { icon: BadgeCheck, title: "Cash on Delivery", desc: "Pay when you receive your product. We also offer partial online payment (10%) for added convenience." },
];

const ShippingInfo = () => (
  <div className="min-h-screen flex flex-col">
    <TopBar />
    <Header />
    <main className="flex-1 py-12 sm:py-16">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Shipping Information</h1>
        <p className="text-muted-foreground mb-10">Everything you need to know about our delivery process.</p>
        <div className="grid gap-6">
          {info.map((item) => (
            <div key={item.title} className="flex gap-4 p-6 border rounded-2xl bg-card">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default ShippingInfo;
