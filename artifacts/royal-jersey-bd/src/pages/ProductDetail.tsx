import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useAddToCart, useListProducts, getGetCartQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import SizeGuide from "@/components/products/SizeGuide";
import ProductCard from "@/components/products/ProductCard";
import { Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw, Star, Check, MessageCircle, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");

  const { data: product, isLoading } = useGetProduct(id, {
    query: { queryKey: getGetProductQueryKey(id), enabled: !!id }
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyAtc, setShowStickyAtc] = useState(false);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openCart } = useCart();
  const queryClient = useQueryClient();

  // Related products — same category, exclude current
  const { data: allInCategory } = useListProducts(
    { categoryId: product?.categoryId },
    { query: { enabled: !!product?.categoryId } }
  );
  const relatedProducts = allInCategory?.filter(p => p.id !== id).slice(0, 8) ?? [];

  // Featured products as fallback / secondary section
  const { data: featuredProducts } = useListProducts(
    {},
    { query: { enabled: !!product } }
  );
  const bestDeals = featuredProducts
    ?.filter(p => p.id !== id && (p.discountPercent ?? 0) > 0)
    .slice(0, 8) ?? [];

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
    setCurrentImageIndex(0);
  }, [product?.id]);

  // Auto-advance slideshow every 3s when multiple images exist
  useEffect(() => {
    if (!product) return;
    const imgs = product.images?.length ? [product.imageUrl, ...product.images] : [product.imageUrl];
    if (imgs.length < 2) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(i => (i + 1) % imgs.length);
    }, 3000);
    return () => clearInterval(interval);
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
      data: { productId: product.id, quantity, size: selectedSize }
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
  const displayImage = allImages[currentImageIndex] ?? product.imageUrl;
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
            <div className="aspect-[4/5] bg-secondary rounded-lg overflow-hidden relative group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge className="bg-primary text-primary-foreground border-none">NEW</Badge>}
                {product.discountPercent ? <Badge className="bg-accent text-accent-foreground border-none">-{product.discountPercent}%</Badge> : null}
              </div>
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(i => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => (i + 1) % allImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? "bg-white w-4" : "bg-white/50 w-1.5"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`aspect-[4/5] rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
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
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-serif font-bold text-3xl">৳{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">৳{product.originalPrice.toFixed(2)}</span>
                )}
                {product.stockCount != null ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${
                    product.stockCount === 0
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : product.stockCount <= 5
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                        : "bg-green-500/10 text-green-600 border-green-500/20"
                  }`}>
                    {product.stockCount === 0 ? "Out of Stock" : `${product.stockCount} in stock`}
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${product.inStock ? "text-green-600" : "text-red-500"}`}>
                    {product.inStock ? <><Check className="w-4 h-4" /> In Stock</> : "Out of Stock"}
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert mb-8 text-muted-foreground">
              <p>{product.description || "Premium quality sportswear crafted for excellence. This jersey combines authentic design with superior comfort, making it perfect for both intense matches and casual wear."}</p>
            </div>

            <div className="space-y-8 mb-8 border-y py-8">
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

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border rounded-md h-14 bg-background">
                  <Button variant="ghost" className="h-full px-4 rounded-none hover:bg-muted" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button variant="ghost" className="h-full px-4 rounded-none hover:bg-muted" onClick={() => setQuantity(q => q + 1)}>+</Button>
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
                  ) : !product.inStock ? "Out of Stock" : (
                    <span className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Add to Cart</span>
                  )}
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 flex-shrink-0 border-2" onClick={() => toggleWishlist(product.id)}>
                  <Heart className={`w-6 h-6 transition-colors ${inWishlist ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </Button>
              </div>
            </div>

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

      {/* ── More from this Category ──────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t mt-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Same Collection</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">More {product.categoryName}</h2>
            </div>
            <Link href={`/products?categoryId=${product.categoryId}`} className="text-sm text-primary hover:underline font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Best Deals ───────────────────────────────────────────────────── */}
      {bestDeals.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Limited Time</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">Best Deals</h2>
            </div>
            <Link href="/products" className="text-sm text-primary hover:underline font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestDeals.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Reviews & Share ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 border-t">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-serif font-bold mb-6">Customer Reviews</h2>
          <div className="p-6 rounded-xl border bg-muted/20 text-center space-y-4">
            <div className="flex justify-center gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-6 h-6 text-muted-foreground/30" />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">Be the first to review this product.</p>
            <a
              href={`https://wa.me/+8801234567890?text=${encodeURIComponent(`Hi! I want to leave a review for: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ea855] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Write a Review on WhatsApp
            </a>
          </div>
          <div className="mt-6 p-5 rounded-lg bg-muted/30 border flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-sm">Love this product?</p>
              <p className="text-xs text-muted-foreground">Share it with your friends on WhatsApp</p>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at Royal Jersey BD! 🔥 ৳${product.price} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ea855] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </a>
          </div>
        </div>
      </section>

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
