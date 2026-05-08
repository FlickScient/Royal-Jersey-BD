import { useState } from "react";
import { Link } from "wouter";
import { Heart, Eye, ShoppingCart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@workspace/api-client-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openCart } = useCart();
  const queryClient = useQueryClient();
  
  const inWishlist = isInWishlist(product.id);
  
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        openCart();
      }
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    
    addToCart.mutate({
      data: {
        productId: product.id,
        quantity: 1,
        // If it has sizes, maybe we shouldn't quick add, or default to first size
        size: product.sizes?.[0]
      }
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group relative flex flex-col bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-secondary block">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-serif">
              Royal Jersey BD
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground border-none">NEW</Badge>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <Badge className="bg-accent text-accent-foreground border-none">-{product.discountPercent}%</Badge>
            )}
            {!product.inStock && (
              <Badge variant="destructive" className="border-none">SOLD OUT</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-accent transition-colors"
          >
            <motion.div
              animate={inWishlist ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-accent text-accent' : ''}`} />
            </motion.div>
          </button>

          {/* Quick Actions Overlay */}
          <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300`}>
            <Button 
              className="flex-1" 
              variant={isAdded ? "outline" : "default"}
              onClick={handleAddToCart}
              disabled={!product.inStock || addToCart.isPending}
            >
              {isAdded ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> Added
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Add
                </div>
              )}
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-1">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{product.categoryName}</div>
          <Link href={`/products/${product.id}`} className="font-medium text-base hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
            {product.name}
          </Link>
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-serif font-bold text-lg">৳{product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">৳{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </motion.div>

      <QuickViewModal 
        product={product} 
        isOpen={showQuickView} 
        onClose={() => setShowQuickView(false)} 
      />
    </>
  );
}
