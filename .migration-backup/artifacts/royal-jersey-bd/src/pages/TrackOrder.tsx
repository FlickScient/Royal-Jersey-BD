import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Package, Truck, CheckCircle, Clock, MessageCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useGetSiteSettings } from "@workspace/api-client-react";

interface TrackingResult {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: { name: string; price: number; quantity: number; size?: string }[];
  createdAt: string;
  timeline: { label: string; status: string; done: boolean }[];
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-6 h-6 text-yellow-500" />,
  processing: <Package className="w-6 h-6 text-blue-400" />,
  shipped: <Truck className="w-6 h-6 text-blue-500" />,
  delivered: <CheckCircle className="w-6 h-6 text-green-500" />,
  cancelled: <XCircle className="w-6 h-6 text-red-500" />,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Cancel state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data: settings } = useGetSiteSettings();
  const whatsappNumber = settings?.whatsapp_number ?? "+8801234567890";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setResult(null);
    setError(null);
    setShowCancelConfirm(false);
    setCancelError(null);

    try {
      const params = new URLSearchParams({ orderNumber: orderNumber.trim(), phone: phone.trim() });
      const res = await fetch(`/api/orders/track?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Order not found");
      } else {
        const data = await res.json();
        setResult(data);
      }
    } catch {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!result) return;
    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(result.orderNumber)}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error ?? "Could not cancel order.");
        setShowCancelConfirm(false);
      } else {
        // Update result with cancelled status
        setResult(prev => prev ? {
          ...prev,
          status: "cancelled",
          timeline: prev.timeline.map(t => ({ ...t, done: t.status === "pending" })),
        } : null);
        setShowCancelConfirm(false);
      }
    } catch {
      setCancelError("Failed to connect. Please try again.");
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  };

  const waLink = result
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I need help with order ${result.orderNumber}`)}`
    : `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I need help tracking my order")}`;

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          {" / "}
          <span className="text-foreground">Track Order</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order number and phone number to see your delivery status.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSearch} className="p-6 rounded-xl border bg-card space-y-4">
            <div className="space-y-1.5">
              <Label>Order Number</Label>
              <Input
                required
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="e.g. RJB-1748500000-123"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              {loading ? "Tracking..." : "Track Order"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your order number is in the confirmation message sent to your phone.
            </p>
          </form>
        </motion.div>

        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            {error ? (
              <div className="text-center p-8 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-2">Order Not Found</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {error === "Order not found"
                    ? "We couldn't find an order matching that number and phone. Please double-check and try again."
                    : error}
                </p>
                <Button asChild variant="outline">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support on WhatsApp
                  </a>
                </Button>
              </div>
            ) : result ? (
              <div className="p-6 rounded-xl border bg-card space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order #{result.orderNumber}</p>
                    <p className="font-bold text-lg">৳{result.total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{result.customerName} · {result.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted flex-shrink-0">
                    {STATUS_ICONS[result.status] ?? <Clock className="w-6 h-6" />}
                    <span className="font-semibold text-sm">{STATUS_LABELS[result.status] ?? result.status}</span>
                  </div>
                </div>

                {result.address && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
                    <p className="font-medium text-sm">{result.address}</p>
                    {result.paymentMethod && (
                      <p className="text-xs text-muted-foreground mt-1">Payment: {result.paymentMethod.toUpperCase()}</p>
                    )}
                  </div>
                )}

                {result.items?.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Items</h3>
                    <div className="space-y-2">
                      {result.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name}{item.size ? ` (${item.size})` : ""} × {item.quantity}</span>
                          <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-bold mb-4">Tracking Timeline</h3>
                  <div className="space-y-0">
                    {result.timeline.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${step.done ? "bg-primary border-primary" : "border-border bg-background"}`} />
                          {i < result.timeline.length - 1 && (
                            <div className={`w-0.5 flex-1 mt-1 mb-1 min-h-[24px] transition-colors ${step.done ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                        <div className={`pb-5 ${step.done ? "" : "opacity-50"}`}>
                          <p className={`font-medium text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancel error */}
                {cancelError && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{cancelError}</span>
                  </div>
                )}

                {/* Cancel confirmation box */}
                <AnimatePresence>
                  {showCancelConfirm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="p-5 rounded-xl border-2 border-destructive/30 bg-destructive/5 space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Cancel this order?</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This will permanently cancel order <span className="font-mono font-bold">{result.orderNumber}</span>. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancelling}
                        >
                          Keep Order
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={handleCancel}
                          disabled={cancelling}
                        >
                          {cancelling ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Cancelling...</>
                          ) : (
                            <><XCircle className="w-3.5 h-3.5 mr-1.5" /> Yes, Cancel Order</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline" className="flex-1">
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Need Help? Chat on WhatsApp
                    </a>
                  </Button>

                  {/* Cancel button — only for pending orders */}
                  {result.status === "pending" && !showCancelConfirm && (
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                      onClick={() => { setCancelError(null); setShowCancelConfirm(true); }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
}
