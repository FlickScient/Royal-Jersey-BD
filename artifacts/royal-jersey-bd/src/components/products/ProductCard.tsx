import { useState, useRef } from "react";
import { Link } from "wouter";
import { Heart, Eye, ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [cartBounce, setCartBounce] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openCart } = useCart();
  const queryClient = useQueryClient();

  const inWishlist = isInWishlist(product.id);
  const videoUrl = (product as any).videoUrl as string | undefined;

  const stockCount = product.stockCount;
  const isLowStock = stockCount != null && stockCount > 0 && stockCount <= 10;
  const isCriticalStock = stockCount != null && stockCount > 0 && stockCount <= 5;

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setIsAdded(true);
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 600);
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
        size: product.sizes?.[0]
      }
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 500);
    toggleWishlist(product.id);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && videoUrl) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group relative flex flex-col bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-secondary block">

          {/* Static image — always rendered, fades out on hover if video exists */}
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered && videoUrl ? "opacity-0" : "opacity-100"
              } ${isHovered ? "scale-110" : "scale-100"}`}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-serif">
              Royal Jersey BD
            </div>
          )}

          {/* Fabric shine video — plays on hover */}
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              preload="none"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Fabric video indicator */}
          {videoUrl && (
            <div className={`absolute bottom-14 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Fabric Preview
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground border-none">NEW</Badge>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <Badge className="bg-accent text-accent-foreground border-none">-{product.discountPercent}%</Badge>
            )}
            {!product.inStock && (
              <Badge variant="destructive" className="border-none">SOLD OUT</Badge>
            )}
            {product.inStock && isCriticalStock && (
              <Badge className="bg-red-500 text-white border-none text-[10px] font-bold animate-pulse">
                Only {stockCount} left!
              </Badge>
            )}
            {product.inStock && isLowStock && !isCriticalStock && (
              <Badge className="bg-amber-500 text-white border-none text-[10px] font-semibold">
                Limited Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button with pop-heart */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-accent transition-colors"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={inWishlist ? "filled" : "empty"}
                initial={{ scale: heartPop ? 0.5 : 1 }}
                animate={heartPop
                  ? { scale: [0.5, 1.5, 0.9, 1.2, 1], rotate: [0, -15, 15, -5, 0] }
                  : { scale: 1 }
                }
                transition={{ duration: 0.45, type: "spring", stiffness: 400, damping: 15 }}
              >
                <Heart className={`h-5 w-5 transition-colors ${inWishlist ? "fill-accent text-accent" : ""}`} />
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <motion.div
              className="flex-1"
              animate={cartBounce ? { scale: [1, 0.9, 1.15, 0.95, 1], y: [0, 2, -6, 2, 0] } : { scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 400, damping: 15 }}
            >
              <Button
                className="w-full"
                variant={isAdded ? "outline" : "default"}
                onClick={handleAddToCart}
                disabled={!product.inStock || addToCart.isPending}
              >
                {isAdded ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-green-500" /> Added!
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Add
                  </div>
                )}
              </Button>
            </motion.div>
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

          {/* Low stock FOMO text under price */}
          <div className="flex items-center gap-2 mt-auto flex-wrap">
            <span className="font-serif font-bold text-lg">৳{product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">৳{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          {product.inStock && isLowStock && (
            <p className="text-[11px] mt-1 font-medium text-amber-600 dark:text-amber-400">
              {isCriticalStock
                ? `⚡ Only ${stockCount} left — order soon!`
                : `🔥 Low stock — only ${stockCount} units remaining`}
            </p>
          )}
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
