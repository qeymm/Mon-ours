import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  if (user.role !== "SELLER")
    return NextResponse.json({ error: "Seller Only" }, { status: 403 });

  const store = await prisma.store.findUnique({
    where: { sellerId: user.userId },
  });
  if (!store)
    return NextResponse.json({ error: "No store found" }, { status: 400 });

  const orderItems = await prisma.orderItem.findMany({
    where: { product: { storeId: store.id } },
    include: { order: { select: { status: true } } },
  });

  let totalRevenue = 0;
  let totalOrders = new Set<string>();
  let pendingCount = 0;
  let deliveredCount = 0;

  const productSales = new Map<
    string,
    {
      name: string;
      quantity: number;
      revenue: number;
    }
  >();

  for (const item of orderItems) {
    if (item.order.status === "CANCELLED") continue;

    const itemRevenue = Number(item.priceAtPurchase) * item.quantity;
    totalRevenue += itemRevenue;

    if (item.order.status === "PENDING") pendingCount++;
    if (item.order.status === "DELIVERED") deliveredCount++;

    const existing = productSales.get(item.productId);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += itemRevenue;
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      productSales.set(item.productId, {
        name: product?.name ?? "Unknown",
        quantity: item.quantity,
        revenue: itemRevenue,
      });
    }
  }

  const uniqueOrders = await prisma.orderItem.findMany({
    where: {
      product: { storeId: store.id },
      order: { status: { not: "CANCELLED" } },
    },
    select: { orderId: true },
    distinct: ["orderId"],
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return NextResponse.json({
    totalRevenue,
    totalOrders: uniqueOrders.length,
    pendingCount,
    deliveredCount,
    topProducts,
  });
}
