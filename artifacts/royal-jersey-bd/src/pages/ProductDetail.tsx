import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useAddToCart, useListProducts, getGetCartQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SizeGuide from "@/components/products/SizeGuide";
import ProductCard from "@/components/products/ProductCard";
import {
  Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw,
  Star, Check, MessageCircle, Share2, ChevronLeft, ChevronRight, Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CUSTOM_NAME_FEE = 150;
const CUSTOM_NUMBER_FEE = 100;

const VARIANT_LABELS: Record<string, string> = {
  player: "Player Edition",
  fan: "Fan Edition",
  "thai-bd": "Thai-BD",
};

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
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openCart } = useCart();
  const queryClient = useQueryClient();

  // Parse variant prices from product
  const variantPrices: Record<string, number> = (product as any)?.variantPrices ?? {};
  const hasVariants = Object.keys(variantPrices).length > 0;

  // Displayed price: variant price if selected, else default, plus customization fees
  const basePrice = selectedVariant && variantPrices[selectedVariant]
    ? variantPrices[selectedVariant]
    : product?.price ?? 0;
  const customFee = (customName.trim() ? CUSTOM_NAME_FEE : 0) + (customNumber.trim() ? CUSTOM_NUMBER_FEE : 0);
  const displayPrice = basePrice + customFee;

  // Related products — same category
  const { data: allInCategory } = useListProducts(
    { categoryId: product?.categoryId },
    { query: { enabled: !!product?.categoryId } }
  );
  const relatedProducts = allInCategory?.filter(p => p.id !== id).slice(0, 8) ?? [];

  // Best deals (discounted products)
  const { data: allProducts } = useListProducts({}, { query: { enabled: !!product } });
  const bestDeals = allProducts?.filter(p => p.id !== id && (p.discountPercent ?? 0) > 0).slice(0, 8) ?? [];

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
    setCurrentImageIndex(0);
    setSelectedVariant(null);
  }, [product?.id]);

  // Auto-slide every 2.5s
  useEffect(() => {
    if (!product) return;
    const imgs = product.images?.length ? [product.imageUrl, ...product.images] : [product.imageUrl];
    if (imgs.length < 2) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(i => (i + 1) % imgs.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("main-atc-button");
      if (el) setShowStickyAtc(el.getBoundingClientRect().bottom < 0);
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
          <Link href="/">Home</Link> / <Link href="/products">{product.categoryName}</Link> / <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* ── Gallery ─────────────────────────────────────────── */}
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
                  transition={{ duration: 0.35 }}
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
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1}/{allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ─────────────────────────────────────── */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-bold text-primary tracking-widest uppercase mb-3 flex items-center justify-between">
                <span>{product.categoryName}{product.teamName ? ` · ${product.teamName}` : ""}</span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-foreground">{product.rating || "4.9"}</span>
                  <span className="text-muted-foreground text-xs font-normal">({product.reviewCount || "120"})</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-4">{product.name}</h1>

              {/* Price display */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-serif font-bold text-3xl">৳{displayPrice.toFixed(2)}</span>
                {product.originalPrice && !selectedVariant && (
                  <span className="text-xl text-muted-foreground line-through">৳{product.originalPrice.toFixed(2)}</span>
                )}
                {product.stockCount != null ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${
                    product.stockCount === 0 ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : product.stockCount <= 5 ? "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse"
                      : product.stockCount <= 10 ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-green-500/10 text-green-600 border-green-500/20"
                  }`}>
                    {product.stockCount === 0
                      ? "Out of Stock"
                      : product.stockCount <= 5
                      ? `⚡ Only ${product.stockCount} left!`
                      : product.stockCount <= 10
                      ? `🔥 Limited — ${product.stockCount} units left`
                      : `✓ In Stock`}
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${product.inStock ? "text-green-600" : "text-red-500"}`}>
                    {product.inStock ? <><Check className="w-4 h-4" /> In Stock</> : "Out of Stock"}
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert mb-8 text-muted-foreground">
              <p>{product.description || "Premium quality sportswear crafted for excellence."}</p>
            </div>

            <div className="space-y-8 mb-8 border-y py-8">

              {/* ── Variant Selector ──────────────────────────────── */}
              {hasVariants && (
                <div>
                  <Label className="text-base mb-3 block">Select Edition</Label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(variantPrices).map(([key, price]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedVariant(selectedVariant === key ? null : key)}
                        className={`flex flex-col items-center px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedVariant === key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-primary/50"
                        }`}
                      >
                        <span className="font-bold">{VARIANT_LABELS[key] ?? key}</span>
                        <span className={`text-xs mt-0.5 ${selectedVariant === key ? "text-primary/80" : "text-muted-foreground"}`}>
                          ৳{price.toLocaleString()}
                        </span>
                      </button>
                    ))}
                    {/* Default option */}
                    <button
                      onClick={() => setSelectedVariant(null)}
                      className={`flex flex-col items-center px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedVariant === null
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <span className="font-bold">Standard</span>
                      <span className={`text-xs mt-0.5 ${selectedVariant === null ? "text-primary/80" : "text-muted-foreground"}`}>
                        ৳{product.price.toLocaleString()}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Size Selector ─────────────────────────────────── */}
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

              {/* ── Custom Name & Number ─────────────────────────── */}
              <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-primary" />
                  <Label className="text-base font-semibold text-primary">Customize Your Jersey</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground flex items-center justify-between">
                      <span>Player Name</span>
                      {customName.trim() && (
                        <span className="text-primary font-semibold text-xs">+৳{CUSTOM_NAME_FEE}</span>
                      )}
                    </Label>
                    <Input
                      value={customName}
                      onChange={e => setCustomName(e.target.value.toUpperCase())}
                      placeholder="e.g. RAHMAN"
                      maxLength={15}
                      className="uppercase font-bold tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground flex items-center justify-between">
                      <span>Jersey Number</span>
                      {customNumber.trim() && (
                        <span className="text-primary font-semibold text-xs">+৳{CUSTOM_NUMBER_FEE}</span>
                      )}
                    </Label>
                    <Input
                      value={customNumber}
                      onChange={e => setCustomNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="e.g. 10"
                      maxLength={2}
                      className="font-bold text-center text-xl"
                    />
                  </div>
                </div>
                {customFee > 0 ? (
                  <div className="flex items-center justify-between text-sm bg-primary/10 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">
                      Customization ({[customName.trim() && "Name", customNumber.trim() && "Number"].filter(Boolean).join(" + ")})
                    </span>
                    <span className="font-bold text-primary">+৳{customFee}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Optional · Name printing +৳{CUSTOM_NAME_FEE} · Number +৳{CUSTOM_NUMBER_FEE} · Leave blank to skip
                  </p>
                )}
              </div>

              {/* ── Qty + ATC ─────────────────────────────────────── */}
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

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { icon: ShieldCheck, label: "Premium Fabric", sub: product.fabricType || "Authentic" },
                { icon: Truck, label: "Fast Delivery", sub: "Inside Dhaka 24H" },
                { icon: RotateCcw, label: "Easy Returns", sub: "7 day policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 p-4 bg-muted/30 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground text-xs">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── More from this Category ──────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t mt-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Same Collection</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">More {product.categoryName}</h2>
            </div>
            <Link href={`/products?categoryId=${product.categoryId}`} className="text-sm text-primary hover:underline font-medium">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ── Best Deals ───────────────────────────────────────────── */}
      {bestDeals.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Limited Time</p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">Best Deals</h2>
            </div>
            <Link href="/products" className="text-sm text-primary hover:underline font-medium">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestDeals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ── Reviews ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 border-t">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-serif font-bold mb-6">Customer Reviews</h2>
          <div className="p-6 rounded-xl border bg-muted/20 text-center space-y-4">
            <div className="flex justify-center gap-1">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-6 h-6 text-muted-foreground/30" />)}
            </div>
            <p className="text-muted-foreground text-sm">Be the first to review this product.</p>
            <a
              href={`https://wa.me/+8801234567890?text=${encodeURIComponent(`Hi! I want to leave a review for: ${product.name}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ea855] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Write a Review on WhatsApp
            </a>
          </div>
          <div className="mt-6 p-5 rounded-lg bg-muted/30 border flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-sm">Love this product?</p>
              <p className="text-xs text-muted-foreground">Share it with your friends</p>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at Royal Jersey BD! 🔥 ৳${displayPrice} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ea855] transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </a>
          </div>
        </div>
      </section>

      {/* Sticky ATC */}
      <AnimatePresence>
        {showStickyAtc && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="container mx-auto px-4 flex items-center justify-between gap-4">
              <div className="hidden md:flex items-center gap-4 flex-1">
                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                  <p className="text-primary font-serif font-bold">৳{displayPrice.toFixed(2)}</p>
                </div>
              </div>
              <Button
                size="lg" className="flex-1 md:w-64 h-12 text-base font-bold shadow-lg"
                onClick={handleAddToCart}
                disabled={!product.inStock || addToCart.isPending}
              >
                {isAdded ? "Added!" : "Add to Cart"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
