import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SizeGuide from "@/components/products/SizeGuide";
import { Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw, Star, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  
  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id }
  });
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyAtc, setShowStickyAtc] = useState(false);
  
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openCart } = useCart();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (product?.imageUrl && !selectedImage) {
      setSelectedImage(product.imageUrl);
    }
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      const mainAtc = document.getElementById("main-atc-button");
      if (mainAtc) {
        const rect = mainAtc.getBoundingClientRect();
        setShowStickyAtc(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate({
      data: {
        productId: product.id,
        quantity,
        size: selectedSize
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-serif">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Product not found</h1>
      </div>
    );
  }

  const allImages = product.images?.length ? [product.imageUrl, ...product.images] : [product.imageUrl];
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen pt-20 pb-32">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          Home / {product.categoryName} / <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-secondary rounded-lg overflow-hidden relative">
              <img 
                src={selectedImage || product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge className="bg-primary text-primary-foreground border-none">NEW</Badge>}
                {product.discountPercent && <Badge className="bg-accent text-accent-foreground border-none">-{product.discountPercent}%</Badge>}
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-[4/5] rounded-md overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-bold text-primary tracking-widest uppercase mb-3 flex items-center justify-between">
                <span>{product.categoryName} • {product.edition} Edition</span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-foreground">{product.rating || "4.9"}</span>
                  <span className="text-muted-foreground text-xs font-normal">({product.reviewCount || "120"} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="font-serif font-bold text-3xl">৳{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">৳{product.originalPrice.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert mb-8 text-muted-foreground">
              <p>{product.description || "Premium quality sportswear crafted for excellence. This jersey combines authentic design with superior comfort, making it perfect for both intense matches and casual wear."}</p>
            </div>

            <div className="space-y-8 mb-8 border-y py-8">
              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base">Select Size</Label>
                    <SizeGuide />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 px-6 rounded-md border text-sm font-bold transition-all ${
                          selectedSize === size 
                            ? "border-primary bg-primary text-primary-foreground shadow-md" 
                            : "border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border rounded-md h-14 bg-background">
                  <Button variant="ghost" className="h-full px-4 rounded-none hover:bg-muted" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                    -
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button variant="ghost" className="h-full px-4 rounded-none hover:bg-muted" onClick={() => setQuantity(q => q + 1)}>
                    +
                  </Button>
                </div>
                
                <Button 
                  id="main-atc-button"
                  size="lg" 
                  className="flex-1 h-14 text-lg font-bold shadow-lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addToCart.isPending}
                >
                  {isAdded ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <Check className="w-6 h-6 text-green-500" /> Added to Cart
                    </motion.div>
                  ) : !product.inStock ? (
                    "Out of Stock"
                  ) : (
                    <span className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Add to Cart</span>
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  className="h-14 w-14 flex-shrink-0 border-2"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart className={`w-6 h-6 transition-colors ${inWishlist ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-muted/30 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="font-medium">Premium Fabric</span>
                <span className="text-muted-foreground text-xs">{product.fabricType || 'Authentic Material'}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-muted/30 rounded-lg">
                <Truck className="w-6 h-6 text-primary" />
                <span className="font-medium">Fast Delivery</span>
                <span className="text-muted-foreground text-xs">Inside Dhaka 24H</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-muted/30 rounded-lg">
                <RotateCcw className="w-6 h-6 text-primary" />
                <span className="font-medium">Easy Returns</span>
                <span className="text-muted-foreground text-xs">7 days return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart */}
      <AnimatePresence>
        {showStickyAtc && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="container mx-auto px-4 flex items-center justify-between gap-4">
              <div className="hidden md:flex items-center gap-4 flex-1">
                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                  <p className="text-primary font-serif font-bold">৳{product.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button 
                  size="lg" 
                  className="flex-1 md:w-64 h-12 text-base font-bold shadow-lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addToCart.isPending}
                >
                  {isAdded ? "Added!" : "Add to Cart"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
