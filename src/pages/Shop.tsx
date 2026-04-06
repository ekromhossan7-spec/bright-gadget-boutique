import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import TopBar from "@/components/store/TopBar";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

const allProducts = [
  { id: "1", name: "Wireless Noise Cancelling Headphones Pro", slug: "wireless-headphones-pro", price: 4999, comparePrice: 7999, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", category: "headphones" },
  { id: "2", name: "Smart Watch Ultra Series 3", slug: "smart-watch-ultra-3", price: 8999, comparePrice: 12999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", category: "smartwatches" },
  { id: "3", name: "Portable Bluetooth Speaker 360°", slug: "bluetooth-speaker-360", price: 2499, comparePrice: 3999, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop", category: "headphones" },
  { id: "4", name: "USB-C Fast Charging Hub 7-in-1", slug: "usbc-charging-hub", price: 1999, image: "https://images.unsplash.com/photo-1625723044792-44de16bc5428?w=400&h=400&fit=crop", category: "laptops" },
  { id: "5", name: "Mechanical Gaming Keyboard RGB", slug: "mechanical-keyboard-rgb", price: 5499, comparePrice: 7499, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop", category: "gaming" },
  { id: "6", name: "Wireless Ergonomic Mouse", slug: "wireless-ergonomic-mouse", price: 1299, comparePrice: 1999, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop", category: "laptops" },
  { id: "7", name: "4K Action Camera Waterproof", slug: "4k-action-camera", price: 6999, comparePrice: 9999, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop", category: "cameras" },
  { id: "8", name: "TWS Earbuds with ANC", slug: "tws-earbuds-anc", price: 3499, comparePrice: 4999, image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop", category: "headphones" },
  { id: "9", name: "Wireless Charging Pad 15W", slug: "wireless-charging-pad", price: 999, comparePrice: 1499, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop", category: "smartphones" },
  { id: "10", name: "Smart LED Desk Lamp", slug: "smart-led-desk-lamp", price: 2299, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", category: "laptops" },
  { id: "11", name: "Laptop Stand Aluminum", slug: "laptop-stand-aluminum", price: 1799, comparePrice: 2499, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop", category: "laptops" },
  { id: "12", name: "Power Bank 20000mAh", slug: "power-bank-20000", price: 1599, comparePrice: 2299, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop", category: "smartphones" },
  { id: "13", name: "Webcam HD 1080p", slug: "webcam-hd-1080p", price: 2999, image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop", category: "cameras" },
  { id: "14", name: "USB Microphone Studio", slug: "usb-microphone-studio", price: 3499, comparePrice: 4999, image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop", category: "gaming" },
  { id: "15", name: "Smart Plug Wi-Fi", slug: "smart-plug-wifi", price: 699, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", category: "smartphones" },
  { id: "16", name: "VR Headset Lite", slug: "vr-headset-lite", price: 7999, comparePrice: 9999, image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=400&fit=crop", category: "gaming" },
];

const categories = [
  { slug: "all", name: "All" },
  { slug: "headphones", name: "Headphones" },
  { slug: "smartphones", name: "Smartphones" },
  { slug: "smartwatches", name: "Smartwatches" },
  { slug: "laptops", name: "Laptops" },
  { slug: "cameras", name: "Cameras" },
  { slug: "gaming", name: "Gaming" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const filtered = useMemo(() => {
    let products = allProducts;
    if (activeCategory !== "all") {
      products = products.filter((p) => p.category === activeCategory);
    }
    if (search) {
      products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (sortBy === "price-low") products = [...products].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") products = [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [activeCategory, search, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Shop</h1>
            <p className="text-muted-foreground">Browse our full collection of premium gadgets</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background border rounded-lg px-3 py-2 text-sm"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.slug}
                variant={activeCategory === cat.slug ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => {
                  if (cat.slug === "all") {
                    searchParams.delete("category");
                  } else {
                    searchParams.set("category", cat.slug);
                  }
                  setSearchParams(searchParams);
                }}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Products grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
