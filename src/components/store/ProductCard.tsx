import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  featured?: boolean;
}

const ProductCard = ({ id, name, slug, price, comparePrice, image, featured }: ProductCardProps) => {
  const { addItem } = useCart();
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow"
    >
      {discount > 0 && (
        <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground">
          -{discount}%
        </Badge>
      )}
      <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors">
        <Heart className="h-4 w-4" />
      </button>

      <Link to={`/product/${slug}`} className="block aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      <div className="p-4">
        <Link to={`/product/${slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 mb-2 hover:text-accent transition-colors">{name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg">৳{price.toLocaleString()}</span>
            {comparePrice && (
              <span className="text-sm text-muted-foreground line-through">৳{comparePrice.toLocaleString()}</span>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full hover:bg-accent hover:text-accent-foreground"
            onClick={() => addItem({ id, name, price, image, slug })}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
