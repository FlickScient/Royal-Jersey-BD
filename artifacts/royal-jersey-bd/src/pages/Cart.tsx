import { Link } from "wouter";
import { useGetCart, useRemoveFromCart, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const queryClient = useQueryClient();

  const removeFromCart = useRemoveFromCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    }
  });

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    }
  });

  const handleUpdateQuantity = (productId: number, currentQuantity: number, change: number, size?: string) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      removeFromCart.mutate({ productId });
    } else {
      addToCart.mutate({ data: { productId, quantity: newQuantity, size } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          Looks like you haven't added any premium gear to your cart yet. Explore our collections and find your perfect fit.
        </p>
        <Button size="lg" asChild className="h-14 px-8 text-base">
          <Link href="/products">Continue Shopping <ArrowRight className="ml-2 w-5 h-5" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div 
                key={`${item.productId}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 md:py-6 border-b items-center relative"
              >
                {/* Mobile view delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden absolute top-4 right-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart.mutate({ productId: item.productId })}
                  disabled={removeFromCart.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>

                <div className="col-span-1 md:col-span-6 flex gap-4 pr-8 md:pr-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/products/${item.productId}`} className="font-bold text-lg hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <div className="text-muted-foreground mt-1 font-serif">৳{item.price.toFixed(2)}</div>
                    {item.size && (
                      <Badge variant="outline" className="w-fit mt-2">Size: {item.size}</Badge>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 flex md:justify-center mt-2 md:mt-0">
                  <div className="flex items-center border rounded-md h-10 w-fit">
                    <Button
                      variant="ghost"
                      className="h-full px-3 rounded-none"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1, item.size)}
                      disabled={addToCart.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      className="h-full px-3 rounded-none"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1, item.size)}
                      disabled={addToCart.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-between md:block md:text-right mt-2 md:mt-0 font-serif font-bold text-xl">
                  <span className="md:hidden text-muted-foreground font-sans text-sm font-normal">Subtotal:</span>
                  ৳{(item.price * item.quantity).toFixed(2)}
                </div>

                <div className="hidden md:block col-span-1 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => removeFromCart.mutate({ productId: item.productId })}
                    disabled={removeFromCart.isPending}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div>
          <div className="bg-card border rounded-lg p-6 md:p-8 sticky top-24 shadow-sm">
            <h3 className="font-serif text-2xl font-bold mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium">৳{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="font-serif text-3xl font-bold text-primary">৳{cart.total.toFixed(2)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full h-14 text-lg font-bold" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            
            <div className="mt-6 flex justify-center gap-2">
              {/* Trust indicators */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" /> Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
