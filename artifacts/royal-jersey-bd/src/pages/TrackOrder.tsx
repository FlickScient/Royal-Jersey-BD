import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Package, Truck, CheckCircle, Clock, MessageCircle } from "lucide-react";

type OrderStatus = "processing" | "shipped" | "out_for_delivery" | "delivered";

interface TrackingInfo {
  orderId: string;
  status: OrderStatus;
  customerName: string;
  items: string;
  estimatedDelivery: string;
  courier: string;
  trackingNumber: string;
  timeline: { label: string; time: string; done: boolean }[];
}

const DEMO_ORDERS: Record<string, TrackingInfo> = {
  "RJ-001": {
    orderId: "RJ-001",
    status: "shipped",
    customerName: "Rahim Uddin",
    items: "Argentina Home Jersey (L) × 1",
    estimatedDelivery: "Tomorrow, by 6 PM",
    courier: "Pathao Courier",
    trackingNumber: "PTH-789456",
    timeline: [
      { label: "Order Placed", time: "Today, 10:00 AM", done: true },
      { label: "Order Confirmed", time: "Today, 10:30 AM", done: true },
      { label: "Packed & Shipped", time: "Today, 2:00 PM", done: true },
      { label: "Out for Delivery", time: "Tomorrow", done: false },
      { label: "Delivered", time: "Tomorrow, by 6 PM", done: false },
    ]
  }
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  processing: <Clock className="w-6 h-6 text-yellow-500" />,
  shipped: <Truck className="w-6 h-6 text-blue-500" />,
  out_for_delivery: <Package className="w-6 h-6 text-orange-500" />,
  delivered: <CheckCircle className="w-6 h-6 text-green-500" />,
};

const statusLabels: Record<OrderStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const result = DEMO_ORDERS[orderId.toUpperCase()];
    if (result) {
      setTracking(result);
      setNotFound(false);
    } else {
      setTracking(null);
      setNotFound(true);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link> / <span className="text-foreground">Track Order</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order ID and phone number to see your delivery status.</p>
        </motion.div>

        {/* Search Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSearch} className="p-6 rounded-xl border bg-card space-y-4">
            <div className="space-y-1.5">
              <Label>Order ID</Label>
              <Input
                required
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="e.g. RJ-001"
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
            <Button type="submit" size="lg" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Track Order
            </Button>
            <p className="text-xs text-center text-muted-foreground">Your Order ID is in the confirmation SMS/WhatsApp you received.</p>
          </form>
        </motion.div>

        {/* Result */}
        {searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
            {notFound ? (
              <div className="text-center p-8 rounded-xl border bg-card">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-2">Order Not Found</h3>
                <p className="text-muted-foreground text-sm mb-6">We couldn't find an order matching that ID and phone number. Please check and try again.</p>
                <Button asChild variant="outline">
                  <a href="https://wa.me/+8801234567890?text=I%20need%20help%20tracking%20my%20order" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </div>
            ) : tracking ? (
              <div className="p-6 rounded-xl border bg-card space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Order #{tracking.orderId}</p>
                    <p className="font-medium">{tracking.items}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                    {statusIcons[tracking.status]}
                    <span className="font-semibold text-sm">{statusLabels[tracking.status]}</span>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="font-bold text-primary">{tracking.estimatedDelivery}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tracking.courier} · {tracking.trackingNumber}</p>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-bold mb-4">Tracking Timeline</h3>
                  <div className="space-y-0">
                    {tracking.timeline.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${step.done ? "bg-primary border-primary" : "border-border bg-background"}`} />
                          {i < tracking.timeline.length - 1 && (
                            <div className={`w-0.5 flex-1 mt-1 mb-1 min-h-[24px] ${step.done ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                        <div className={`pb-5 ${step.done ? "" : "opacity-50"}`}>
                          <p className={`font-medium text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                          <p className="text-xs text-muted-foreground">{step.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <a href={`https://wa.me/+8801234567890?text=Hi, I need help with order ${tracking.orderId}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Need Help? Chat with Us
                  </a>
                </Button>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
}
