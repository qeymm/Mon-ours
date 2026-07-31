import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "BUYER")
    return NextResponse.json({ error: "Buyers only" }, { status: 403 });

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  try {
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const item of parsed.data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        // "Today's Bake" stock check
        if (product.isDailyDrop) {
          const remaining = (product.batchQuantity ?? 0) - product.quantitySold;
          if (item.quantity > remaining) {
            throw new Error(`Only ${remaining} left of ${product.name}`);
          }
          await tx.product.update({
            where: { id: product.id },
            data: { quantitySold: { increment: item.quantity } },
          });
        } else {
          if (item.quantity > product.stock) {
            throw new Error(`Only ${product.stock} left of ${product.name}`);
          }
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const priceAtPurchase = Number(product.price);
        total += priceAtPurchase * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase,
        });
      }

      return tx.order.create({
        data: {
          buyerId: user.userId,
          total,
          status: "PENDING",
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true },
      });
    });

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
