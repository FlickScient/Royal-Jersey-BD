import { Link } from "wouter";
import { useGetWishlist } from "@workspace/api-client-react";
import ProductCard from "@/components/products/ProductCard";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const { data: wishlist, isLoading } = useGetWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          Save your favorite premium items here while you decide.
        </p>
        <Button size="lg" asChild className="h-14 px-8 text-base">
          <Link href="/products">Explore Collections <ArrowRight className="ml-2 w-5 h-5" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-accent fill-accent" />
        <h1 className="font-serif text-3xl md:text-4xl font-bold">Saved Items</h1>
        <span className="text-muted-foreground font-medium text-lg ml-2">({wishlist.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
