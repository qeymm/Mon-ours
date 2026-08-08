import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({
  status: z.enum(["SHIPPED", "DELIVERED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = getCurrentUser(req);
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { sellerId: user.userId },
  });
  if (!store)
    return NextResponse.json({ error: "No store found" }, { status: 400 });

  const hasItem = await prisma.orderItem.findFirst({
    where: { orderId: id, product: { storeId: store.id } },
  });
  if (!hasItem)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const order = await prisma.order.findUnique({ where: { id } });
  if (order?.status === "CANCELLED") {
    return NextResponse.json({ error: "Order is cancelled" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
