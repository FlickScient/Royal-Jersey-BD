import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Check, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  const { openCart } = useCart();
  const queryClient = useQueryClient();

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setIsAdded(true);
        setTimeout(() => {
          setIsAdded(false);
          onClose();
          openCart();
        }, 1000);
      }
    }
  });

  const handleAddToCart = () => {
    addToCart.mutate({
      data: {
        productId: product.id,
        quantity,
        size: selectedSize
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border/50">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.description}</DialogDescription>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="bg-secondary relative aspect-square md:aspect-auto">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif">
                Royal Jersey BD
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && <Badge className="bg-primary border-none">NEW</Badge>}
              {product.discountPercent && <Badge className="bg-accent border-none">-{product.discountPercent}%</Badge>}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="text-sm text-primary font-medium tracking-widest uppercase mb-2">
              {product.categoryName} • {product.edition} Edition
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">{product.name}</h2>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif font-bold text-2xl">৳{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ৳{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">Select Size</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center rounded-md border text-sm font-medium transition-all ${
                        selectedSize === size 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border rounded-md h-12">
                <Button 
                  variant="ghost" 
                  className="h-full px-3 rounded-none"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  -
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  className="h-full px-3 rounded-none"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </Button>
              </div>
              <Button 
                className="flex-1 h-12 text-base font-semibold"
                onClick={handleAddToCart}
                disabled={!product.inStock || addToCart.isPending}
              >
                {isAdded ? (
                  <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Added to Cart</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Add to Cart</span>
                )}
              </Button>
            </div>

            <div className="mt-auto pt-6 border-t grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Premium {product.fabricType || 'Fabric'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Authentic Design</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
