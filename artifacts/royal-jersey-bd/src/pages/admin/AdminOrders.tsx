import { useState } from "react";
import { useAdminListOrders } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Phone, MapPin, Package, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"] as const;
type OrderStatus = (typeof STATUS_FLOW)[number] | "cancelled";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/30" },
  processing: { label: "Processing", color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/30" },
  shipped:    { label: "Shipped",    color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/30" },
  delivered:  { label: "Delivered",  color: "text-green-400",   bg: "bg-green-400/10 border-green-400/30" },
  cancelled:  { label: "Cancelled",  color: "text-red-400",     bg: "bg-red-400/10 border-red-400/30" },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery", bkash: "bKash", nagad: "Nagad", rocket: "Rocket", card: "Card",
};

interface OrderItem {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items?: OrderItem[];
  createdAt: string;
}

async function updateOrderStatus(id: number, status: string) {
  const res = await fetch(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function OrderRow({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (id: number, status: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const currentIdx = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  const handleStatusChange = async (status: string) => {
    setUpdating(status);
    try {
      await onStatusUpdate(order.id, status);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <TableRow
        className="border-border/10 hover:bg-white/3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="font-mono text-xs font-medium text-[#c9a84c]">{order.orderNumber}</TableCell>
        <TableCell className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
        <TableCell className="font-medium">{order.customerName}</TableCell>
        <TableCell className="text-muted-foreground text-sm">{order.phone}</TableCell>
        <TableCell className="text-xs font-medium">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</TableCell>
        <TableCell><StatusBadge status={order.status} /></TableCell>
        <TableCell className="text-right font-bold text-[#c9a84c]">৳{order.total.toLocaleString()}</TableCell>
        <TableCell className="text-right">
          {expanded ? <ChevronUp className="w-4 h-4 ml-auto text-muted-foreground" /> : <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />}
        </TableCell>
      </TableRow>

      <AnimatePresence>
        {expanded && (
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell colSpan={8} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-[#0d0d0d] border-t border-border/10 p-6 grid md:grid-cols-2 gap-6">
                  {/* Customer + Delivery Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider">Delivery Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span>{order.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span>{order.address}</span>
                      </div>
                      {order.notes && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-muted-foreground italic">{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Actions */}
                    <div className="pt-2 space-y-2">
                      <h4 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_FLOW.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
                            disabled={order.status === s || !!updating}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              order.status === s
                                ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} opacity-100`
                                : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white disabled:opacity-40"
                            }`}
                          >
                            {updating === s ? <Loader2 className="w-3 h-3 animate-spin inline" /> : STATUS_CONFIG[s].label}
                          </button>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange("cancelled"); }}
                          disabled={order.status === "cancelled" || !!updating}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            order.status === "cancelled"
                              ? `${STATUS_CONFIG.cancelled.bg} ${STATUS_CONFIG.cancelled.color}`
                              : "border-red-500/30 text-red-400/70 hover:border-red-500 hover:text-red-400 disabled:opacity-40"
                          }`}
                        >
                          {updating === "cancelled" ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Cancel"}
                        </button>
                      </div>
                      {nextStatus && (
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(nextStatus); }}
                          disabled={!!updating}
                          className="mt-1 bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold h-9"
                        >
                          {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                          Mark as {STATUS_CONFIG[nextStatus].label} →
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" /> Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className="w-12 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ""}</p>
                          </div>
                          <span className="text-sm font-bold text-[#c9a84c] shrink-0">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Order Total</span>
                      <span className="font-bold text-lg text-[#c9a84c]">৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminListOrders() as { data: Order[] | undefined; isLoading: boolean };
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(["adminListOrders"], (old: Order[] | undefined) =>
        old?.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
      );
      toast.success(`Order updated to ${STATUS_CONFIG[updated.status]?.label ?? updated.status}`);
    },
    onError: () => toast.error("Failed to update order status"),
  });

  const pendingCount = orders?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-serif font-bold">Orders</h2>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 text-xs font-bold">
              {pendingCount} pending
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{orders?.length ?? 0} total orders</p>
      </div>

      {/* Summary cards */}
      {orders && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["pending", "processing", "shipped", "delivered"] as const).map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            return (
              <div key={s} className={`rounded-lg border p-4 ${STATUS_CONFIG[s].bg}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${STATUS_CONFIG[s].color}`}>{STATUS_CONFIG[s].label}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-[#111] rounded-xl border border-border/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c9a84c]" />
                </TableCell>
              </TableRow>
            ) : orders?.length ? (
              [...orders].reverse().map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusUpdate={(id, status) => statusMutation.mutateAsync({ id, status })}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No orders yet. They'll appear here when customers place orders.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
