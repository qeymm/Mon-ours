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

  const order = await prisma.order.findUnique({ where: { id } });
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

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
