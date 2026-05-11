import { useState, useMemo } from "react";
import { useAdminListOrders, getAdminListOrdersQueryKey } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, MessageCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/15 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const PAYMENT_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  cod: "COD",
  card: "Card",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminListOrders();
  const queryClient = useQueryClient();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
    },
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let result = [...orders].reverse();
    if (statusFilter !== "all") {
      result = result.filter(o => o.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  const pendingCount = orders?.filter(o => o.status === "pending").length ?? 0;

  const handleStatusChange = (orderId: number, status: string) => {
    updateStatus.mutate({ id: orderId, status });
  };

  const getWhatsAppLink = (order: { phone: string; customerName: string; orderNumber: string; status: string }) => {
    const phone = order.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hello ${order.customerName}, your Royal Jersey BD order #${order.orderNumber} status has been updated to: ${order.status.toUpperCase()}. Thank you for shopping with us!`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-serif font-bold text-white">Orders</h2>
          {pendingCount > 0 && (
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by name, phone, or order #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {search || statusFilter !== "all" ? "No orders match your search." : "No orders yet."}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/3 transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[#c9a84c]">{order.orderNumber}</span>
                    <Badge className={`text-xs border ${STATUS_COLORS[order.status] || "bg-gray-500/15 text-gray-400"} capitalize`}>
                      {order.status}
                    </Badge>
                    {order.paymentMethod && (
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                        {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-sm font-semibold text-white">{order.customerName}</span>
                    <span className="text-sm text-gray-400">{order.phone}</span>
                    <span className="text-sm font-bold text-[#c9a84c]">৳{order.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short" }) : ""}
                  </span>
                  {expandedId === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedId === order.id && (
                <div className="bg-[#0d0d0d] border-t border-white/5 p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider mb-3">Delivery Details</h4>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-white font-medium">{order.customerName}</p>
                        <p className="text-gray-400">{order.phone}</p>
                        <p className="text-gray-300">{order.address}</p>
                        {order.notes && (
                          <p className="text-gray-400 italic mt-2 bg-white/5 rounded p-2">Note: {order.notes}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {(order.items as any[])?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">
                                {item.size && <span>Size: {item.size} · </span>}
                                Qty: {item.quantity} · ৳{item.price}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-[#c9a84c] flex-shrink-0">৳{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-white/10">
                          <span className="text-sm font-semibold text-white">Total</span>
                          <span className="text-sm font-bold text-[#c9a84c]">৳{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                      <span className="text-sm text-gray-400 font-medium">Update Status:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(order.id, s)}
                            disabled={order.status === s || updateStatus.isPending}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize border transition-all ${
                              order.status === s
                                ? STATUS_COLORS[s] + " border opacity-100 cursor-default"
                                : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-white/5"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <a
                      href={getWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full hover:bg-green-600/30 transition-colors flex-shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Customer
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
