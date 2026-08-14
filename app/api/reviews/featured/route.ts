import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: {
      rating: { gte: 4 },
      comment: { not: null },
    },
    include: {
      buyer: { select: { name: true } },
      product: {
        select: {
          name: true,
          imageUrl: true,
          store: { select: { storeName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return NextResponse.json(reviews);
}
