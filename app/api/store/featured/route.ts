import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const featuredSchema = z.object({ productId: z.string() });

export async function PATCH(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { sellerId: user.userId },
  });
  if (!store)
    return NextResponse.json({ error: "No store found" }, { status: 400 });

  const body = await req.json();
  const parsed = featuredSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  // confirm the seller actually owns this product
  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || product.storeId !== store.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: { featuredProductId: product.id },
  });

  return NextResponse.json(updated);
}
