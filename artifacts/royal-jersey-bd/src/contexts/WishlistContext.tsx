import { createContext, useContext, ReactNode } from "react";
import { useGetWishlist, useAddToWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface WishlistContextType {
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: wishlist } = useGetWishlist();
  
  const addToWishlist = useAddToWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast.success("Added to wishlist");
      }
    }
  });

  const removeFromWishlist = useRemoveFromWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast.success("Removed from wishlist");
      }
    }
  });

  const isInWishlist = (productId: number) => {
    return wishlist?.some(item => item.id === productId) ?? false;
  };

  const toggleWishlist = (productId: number) => {
    if (isInWishlist(productId)) {
      removeFromWishlist.mutate({ productId });
    } else {
      addToWishlist.mutate({ productId });
    }
  };

  return (
    <WishlistContext.Provider value={{ toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
