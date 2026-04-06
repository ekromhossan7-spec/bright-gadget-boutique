import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";

const allProducts = [
  { id: "9", name: "Wireless Charging Pad 15W", slug: "wireless-charging-pad", price: 999, comparePrice: 1499, image: "https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=400&h=400&fit=crop&q=80" },
  { id: "10", name: "Smart LED Desk Lamp", slug: "smart-led-desk-lamp", price: 2299, image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400&h=400&fit=crop&q=80" },
  { id: "11", name: "Laptop Stand Aluminum", slug: "laptop-stand-aluminum", price: 1799, comparePrice: 2499, image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop&q=80" },
  { id: "12", name: "Power Bank 20000mAh", slug: "power-bank-20000", price: 1599, comparePrice: 2299, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop&q=80" },
  { id: "13", name: "Webcam HD 1080p", slug: "webcam-hd-1080p", price: 2999, image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop&q=80" },
  { id: "14", name: "USB Microphone Studio", slug: "usb-microphone-studio", price: 3499, comparePrice: 4999, image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop&q=80" },
  { id: "15", name: "Smart Plug Wi-Fi", slug: "smart-plug-wifi", price: 699, image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400&h=400&fit=crop&q=80" },
  { id: "16", name: "VR Headset Lite", slug: "vr-headset-lite", price: 7999, comparePrice: 9999, image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=400&fit=crop&q=80" },
];

const AllProducts = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">All Products</h2>
            <p className="text-muted-foreground text-sm">Browse our full collection</p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/shop">View All →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
