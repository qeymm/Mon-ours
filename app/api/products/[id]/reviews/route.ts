import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const reviews = await prisma.review.findMany({
    where: { productId: id },
    include: { buyer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return NextResponse.json({ reviews, average, count: reviews.length });
}
