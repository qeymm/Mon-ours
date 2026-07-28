import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyOwnership(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });
  if (!product) return { error: "Not Found", status: 404 as const };
  if (product.store.sellerId !== userId)
    return { error: "Forbidden", status: 403 as const };
  return { product };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getCurrentUser(req);
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const check = await verifyOwnership(user.userId, params.id);
  if ("error" in check)
    return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getCurrentUser(req);
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const check = await verifyOwnership(user.userId, params.id);
  if ("error" in check)
    return NextResponse.json({ error: check.error }, { status: check.status });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
