import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: { include: { product: true } } },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.buyerId !== user.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (order.status !== "PENDING") {
    return NextResponse.json(
      {
        error: `Can't cancel an order that's already ${order.status.toLowerCase()}`,
      },
      { status: 400 },
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      if (item.product.isDailyDrop) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantitySold: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  });

  return NextResponse.json(updated);
}
