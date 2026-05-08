import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";

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

export default router;
