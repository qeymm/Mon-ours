import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "BUYER")
    return NextResponse.json({ error: "Buyers only" }, { status: 403 });

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { productId, rating, comment } = parsed.data;

  // Confirm this buyer actually received a delivered order containing this product
  const eligible = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { buyerId: user.userId, status: "DELIVERED" },
    },
  });

  if (!eligible) {
    return NextResponse.json(
      { error: "You can only review products from delivered orders" },
      { status: 403 },
    );
  }

  const review = await prisma.review.upsert({
    where: { productId_buyerId: { productId, buyerId: user.userId } },
    update: { rating, comment },
    create: { productId, buyerId: user.userId, rating, comment },
  });

  return NextResponse.json(review);
}
