import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCart, useCreateOrder, CreateOrderBodyPaymentMethod } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(11, "Valid phone number required"),
  address: z.string().min(10, "Full delivery address required"),
  paymentMethod: z.enum(["card", "bkash", "nagad", "rocket", "cod"] as const),
  notes: z.string().optional()
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const queryClient = useQueryClient();
  const [orderSuccess, setOrderSuccess] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      address: "",
      paymentMethod: "cod",
      notes: ""
    }
  });

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: () => {
        setOrderSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] }); // Actually would invalidate getGetCartQueryKey() but doing it simply
        toast.success("Order placed successfully!");
      },
      onError: () => {
        toast.error("Failed to place order. Please try again.");
      }
    }
  });

  const onSubmit = (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) return;
    
    createOrder.mutate({
      data: {
        items: cart.items,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        paymentMethod: data.paymentMethod as CreateOrderBodyPaymentMethod,
        notes: data.notes
      }
    });
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-4xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Thank you for choosing Royal Jersey BD. We'll contact you shortly to confirm delivery details.
        </p>
        <Button size="lg" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  if (isCartLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 bg-muted/10">
      <div className="max-w-6xl mx-auto">
        <Button variant="link" asChild className="mb-6 px-0">
          <Link href="/cart"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart</Link>
        </Button>

        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="lg:col-span-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="bg-card p-6 md:p-8 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
                    Delivery Information
                  </h2>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="h-12 bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+880 1..." className="h-12 bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="House, Road, Area, City" className="min-h-[100px] bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Any special instructions?" className="h-12 bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-card p-6 md:p-8 rounded-lg shadow-sm border">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</span>
                    Payment Method
                  </h2>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="cod" />
                              </FormControl>
                              <div className="flex-1 flex justify-between items-center">
                                <FormLabel className="font-semibold cursor-pointer">Cash on Delivery</FormLabel>
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Pay when you receive</span>
                              </div>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="bkash" />
                              </FormControl>
                              <div className="flex-1 flex justify-between items-center">
                                <FormLabel className="font-semibold cursor-pointer">bKash</FormLabel>
                                <div className="w-12 h-6 bg-pink-500 rounded text-white flex items-center justify-center text-[10px] font-bold">bKash</div>
                              </div>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="nagad" />
                              </FormControl>
                              <div className="flex-1 flex justify-between items-center">
                                <FormLabel className="font-semibold cursor-pointer">Nagad</FormLabel>
                                <div className="w-12 h-6 bg-orange-500 rounded text-white flex items-center justify-center text-[10px] font-bold">Nagad</div>
                              </div>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="card" />
                              </FormControl>
                              <div className="flex-1 flex justify-between items-center">
                                <FormLabel className="font-semibold cursor-pointer">Credit/Debit Card</FormLabel>
                                <span className="text-xs text-muted-foreground">Visa, MasterCard, Amex</span>
                              </div>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="hidden lg:block">
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold" disabled={createOrder.isPending}>
                    {createOrder.isPending ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                    Confirm Order - ৳{cart.total.toFixed(2)}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-card border rounded-lg p-6 md:p-8 sticky top-24 shadow-sm">
              <h3 className="font-serif text-2xl font-bold mb-6">In Your Cart</h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <h4 className="font-bold line-clamp-2">{item.name}</h4>
                      <p className="text-muted-foreground mt-1">Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</p>
                      <p className="font-serif font-bold mt-1">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">৳{cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-primary">Free</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-end">
                  <span className="text-lg font-bold">Total</span>
                  <span className="font-serif text-3xl font-bold text-primary">৳{cart.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="lg:hidden mt-8">
                <Button 
                  onClick={form.handleSubmit(onSubmit)} 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold" 
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                  Confirm Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
