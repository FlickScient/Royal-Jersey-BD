import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useGetCart } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCart() {
  const { openCart } = useCart();
  const { data: cart } = useGetCart();

  const itemCount = cart?.itemCount || 0;

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={openCart}
          className="fixed bottom-24 right-6 z-50 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
          data-testid="button-floating-cart"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-background">
            {itemCount}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
