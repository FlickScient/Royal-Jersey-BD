import { useState } from "react";
import { Link } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useGetCart, useRemoveFromCart, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, closeCart } = useCart();
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

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-background/95 backdrop-blur-xl border-l-border/50">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-serif text-2xl flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Your Cart
            {cart && cart.itemCount > 0 && (
              <span className="text-sm font-sans font-normal text-muted-foreground ml-2">
                ({cart.itemCount} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-20 h-24 bg-muted rounded-md" />
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-medium">Your cart is empty</h3>
              <p className="text-muted-foreground max-w-[200px]">
                Looks like you haven't added any premium gear to your cart yet.
              </p>
              <Button onClick={closeCart} asChild className="mt-4">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {cart.items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.size}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-4"
                  >
                    <div className="w-20 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium line-clamp-1 text-sm">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2 -mt-1"
                            onClick={() => removeFromCart.mutate({ productId: item.productId })}
                            disabled={removeFromCart.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {item.size && (
                          <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md h-8">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1, item.size)}
                            disabled={addToCart.isPending}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1, item.size)}
                            disabled={addToCart.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-medium text-sm">৳{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t pt-4 pb-2 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-serif text-lg font-bold">৳{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild onClick={closeCart}>
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button asChild onClick={closeCart}>
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
