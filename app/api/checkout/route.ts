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
    const orders = await prisma.$transaction(async (tx) => {
      // Look up all products first, group cart items by storeId
      const grouped = new Map<
        string,
        {
          productId: string;
          quantity: number;
          product: Awaited<ReturnType<typeof tx.product.findUniqueOrThrow>>;
        }[]
      >();

      for (const item of parsed.data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const list = grouped.get(product.storeId) ?? [];
        list.push({
          productId: item.productId,
          quantity: item.quantity,
          product,
        });
        grouped.set(product.storeId, list);
      }

      const createdOrders = [];

      for (const [, entries] of grouped) {
        let storeTotal = 0;
        const orderItemsData = [];

        for (const { productId, quantity, product } of entries) {
          if (product.isDailyDrop) {
            const remaining =
              (product.batchQuantity ?? 0) - product.quantitySold;
            if (quantity > remaining)
              throw new Error(`Only ${remaining} left of ${product.name}`);
            await tx.product.update({
              where: { id: productId },
              data: { quantitySold: { increment: quantity } },
            });
          } else {
            if (quantity > product.stock)
              throw new Error(`Only ${product.stock} left of ${product.name}`);
            await tx.product.update({
              where: { id: productId },
              data: { stock: { decrement: quantity } },
            });
          }

          const priceAtPurchase = Number(product.price);
          storeTotal += priceAtPurchase * quantity;
          orderItemsData.push({ productId, quantity, priceAtPurchase });
        }

        const order = await tx.order.create({
          data: {
            buyerId: user.userId,
            total: storeTotal,
            status: "PENDING",
            orderItems: { create: orderItemsData },
          },
          include: { orderItems: true },
        });

        createdOrders.push(order);
      }

      return createdOrders;
    });

    return NextResponse.json(orders);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
