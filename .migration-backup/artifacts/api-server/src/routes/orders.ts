import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { items, customerName, phone, address, paymentMethod, notes } = parsed.data;

  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const orderNumber = `RJB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber,
      status: "pending",
      total: total.toString(),
      paymentMethod,
      customerName,
      phone,
      address,
      notes: notes ?? null,
      itemsJson: JSON.stringify(items),
    })
    .returning();

  return res.status(201).json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: parseFloat(order.total),
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
  });
});

router.get("/orders/track", async (req, res) => {
  const { orderNumber, phone } = req.query as { orderNumber?: string; phone?: string };

  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "orderNumber and phone are required" });
  }

  const cleanPhone = String(phone).replace(/[\s\-]/g, "");

  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, String(orderNumber).trim()))
    .limit(1);

  if (!rows.length) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = rows[0];
  const orderPhone = order.phone.replace(/[\s\-]/g, "");
  if (!orderPhone.endsWith(cleanPhone) && !cleanPhone.endsWith(orderPhone)) {
    return res.status(404).json({ error: "Order not found" });
  }

  let items: any[] = [];
  try {
    items = JSON.parse(order.itemsJson);
  } catch {}

  const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];
  const currentIdx = STATUS_STEPS.indexOf(order.status);

  const timeline = [
    { label: "Order Placed", status: "pending", done: currentIdx >= 0 },
    { label: "Order Confirmed", status: "processing", done: currentIdx >= 1 },
    { label: "Shipped", status: "shipped", done: currentIdx >= 2 },
    { label: "Delivered", status: "delivered", done: currentIdx >= 3 },
  ];

  return res.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: parseFloat(order.total),
    paymentMethod: order.paymentMethod,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    notes: order.notes ?? undefined,
    items,
    createdAt: order.createdAt.toISOString(),
    timeline,
  });
});

router.patch("/orders/:orderNumber/cancel", async (req, res) => {
  const { orderNumber } = req.params;
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required for verification" });
  }

  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, orderNumber.trim()))
    .limit(1);

  if (!rows.length) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = rows[0];

  // Verify phone matches the order
  const cleanPhone = String(phone).replace(/[\s\-]/g, "");
  const orderPhone = order.phone.replace(/[\s\-]/g, "");
  if (!orderPhone.endsWith(cleanPhone) && !cleanPhone.endsWith(orderPhone)) {
    return res.status(403).json({ error: "Phone number does not match this order" });
  }

  // Only pending orders can be cancelled
  if (order.status !== "pending") {
    const msg: Record<string, string> = {
      processing: "Your order is already being processed and cannot be cancelled. Please contact us on WhatsApp.",
      shipped: "Your order has already been shipped. Please contact us on WhatsApp to arrange a return.",
      delivered: "Your order has been delivered and cannot be cancelled.",
      cancelled: "This order is already cancelled.",
    };
    return res.status(400).json({ error: msg[order.status] ?? "This order cannot be cancelled." });
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status: "cancelled" })
    .where(eq(ordersTable.orderNumber, orderNumber.trim()))
    .returning();

  return res.json({ success: true, status: updated.status });
});

export default router;
