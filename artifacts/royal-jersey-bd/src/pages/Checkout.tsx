import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCart, useCreateOrder, CreateOrderBodyPaymentMethod } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShieldCheck, ArrowLeft, Loader2, LogIn, Lock } from "lucide-react";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  phone: z.string().min(11, "Valid BD phone number required (e.g. 01XXXXXXXXX)"),
  address: z.string().min(10, "Full delivery address required (House, Road, Area, City)"),
  paymentMethod: z.enum(["card", "bkash", "nagad", "rocket", "cod"] as const),
  notes: z.string().optional()
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const { isSignedIn, isLoaded, user } = useUser();
  const queryClient = useQueryClient();
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.fullName ?? "",
      phone: "",
      address: "",
      paymentMethod: "cod",
      notes: ""
    }
  });

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (data: any) => {
        setConfirmedOrder({ orderNumber: data.orderNumber, total: data.total });
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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

  // Order confirmed screen
  if (confirmedOrder) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-4xl font-bold mb-3">Order Confirmed!</h1>
        <div className="mb-4 px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl inline-block">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Your Order Number</p>
          <p className="font-mono text-xl font-bold text-primary">{confirmedOrder.orderNumber}</p>
        </div>
        <p className="text-muted-foreground mb-2 max-w-md">
          Total: <strong className="text-foreground">৳{confirmedOrder.total.toLocaleString()}</strong>
        </p>
        <p className="text-muted-foreground mb-8 max-w-md">
          Thank you for choosing Royal Jersey BD! We'll call you on the number you provided to confirm delivery details.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button size="lg" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/track-order">Track Your Order</Link>
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!isCartLoading && isLoaded && cart && cart.items.length === 0) {
      setLocation("/cart");
    }
  }, [isCartLoading, isLoaded, cart, setLocation]);

  if (isCartLoading || !isLoaded) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Login gate — shown only when user tries to checkout without being signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <div className="max-w-md w-full">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 mx-auto border border-primary/20">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3">Sign In to Order</h1>
          <p className="text-muted-foreground mb-8">
            You need an account to place an order so we can track it and keep you updated on delivery. Browsing and adding to cart is always free — no login needed.
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full h-14 text-base font-bold" asChild>
              <Link href="/sign-in">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full h-14 text-base" asChild>
              <Link href="/sign-up">Create New Account</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Your cart is saved — it'll still be here after you sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="link" asChild className="mb-6 px-0">
          <Link href="/cart"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart</Link>
        </Button>

        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Signed in as <strong className="text-foreground">{user?.primaryEmailAddress?.emailAddress}</strong></p>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="bg-card p-6 md:p-8 rounded-xl border">
                  <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
                    Delivery Information
                  </h2>
                  <div className="grid gap-5">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Your full name" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="01XXXXXXXXX" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl><Textarea placeholder="House no, Road, Area, District, City" className="min-h-[100px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl><Input placeholder="Any special instructions?" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="bg-card p-6 md:p-8 rounded-xl border">
                  <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
                    Payment Method
                  </h2>
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                          {[
                            { value: "cod",    label: "Cash on Delivery", badge: "Pay when received", badgeColor: "bg-green-500/10 text-green-400 border border-green-500/20" },
                            { value: "bkash",  label: "bKash",            badge: "bKash",  badgeColor: "bg-pink-500 text-white" },
                            { value: "nagad",  label: "Nagad",            badge: "Nagad",  badgeColor: "bg-orange-500 text-white" },
                            { value: "rocket", label: "Rocket",           badge: "Rocket", badgeColor: "bg-purple-600 text-white" },
                            { value: "card",   label: "Credit / Debit Card", badge: "Visa · MasterCard", badgeColor: "bg-white/10 text-muted-foreground" },
                          ].map((opt) => (
                            <FormItem key={opt.value} className="flex items-center space-x-3 space-y-0 border p-4 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <FormControl><RadioGroupItem value={opt.value} /></FormControl>
                              <div className="flex-1 flex justify-between items-center">
                                <Label className="font-semibold cursor-pointer">{opt.label}</Label>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${opt.badgeColor}`}>{opt.badge}</span>
                              </div>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="hidden lg:block">
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold" disabled={createOrder.isPending}>
                    {createOrder.isPending && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                    Confirm Order · ৳{cart.total.toFixed(0)}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-card border rounded-xl p-6 md:p-8 sticky top-24">
              <h3 className="font-serif text-xl font-bold mb-5">Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <div className="w-14 h-18 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <h4 className="font-semibold line-clamp-2 leading-tight">{item.name}</h4>
                      <p className="text-muted-foreground text-xs mt-0.5">Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ""}</p>
                      <p className="font-bold mt-1 text-primary">৳{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                  <span>৳{cart.subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-serif text-2xl font-bold text-primary">৳{cart.total.toFixed(0)}</span>
                </div>
              </div>

              <div className="lg:hidden mt-6">
                <Button onClick={form.handleSubmit(onSubmit)} size="lg" className="w-full h-14 text-lg font-bold" disabled={createOrder.isPending}>
                  {createOrder.isPending && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                  Confirm Order · ৳{cart.total.toFixed(0)}
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Secure checkout. We'll call to confirm delivery.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
