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
    include: {
      product: { select: { name: true } },
      order: {
        select: { id: true, status: true, createdAt: true, buyerId: true },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });
  return NextResponse.json(orderItems);
}
