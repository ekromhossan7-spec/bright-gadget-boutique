import ProductCard from "./ProductCard";

const demoProducts = [
  { id: "1", name: "Wireless Noise Cancelling Headphones Pro", slug: "wireless-headphones-pro", price: 4999, comparePrice: 7999, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80" },
  { id: "2", name: "Smart Watch Ultra Series 3", slug: "smart-watch-ultra-3", price: 8999, comparePrice: 12999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80" },
  { id: "3", name: "Portable Bluetooth Speaker 360°", slug: "bluetooth-speaker-360", price: 2499, comparePrice: 3999, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop&q=80" },
  { id: "4", name: "USB-C Fast Charging Hub 7-in-1", slug: "usbc-charging-hub", price: 1999, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop&q=80" },
  { id: "5", name: "Mechanical Gaming Keyboard RGB", slug: "mechanical-keyboard-rgb", price: 5499, comparePrice: 7499, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop&q=80" },
  { id: "6", name: "Wireless Ergonomic Mouse", slug: "wireless-ergonomic-mouse", price: 1299, comparePrice: 1999, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&q=80" },
  { id: "7", name: "4K Action Camera Waterproof", slug: "4k-action-camera", price: 6999, comparePrice: 9999, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&q=80" },
  { id: "8", name: "TWS Earbuds with ANC", slug: "tws-earbuds-anc", price: 3499, comparePrice: 4999, image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop&q=80" },
];

const FeaturedProducts = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Featured Products</h2>
          <p className="text-muted-foreground">Handpicked gadgets you'll love</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {demoProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
