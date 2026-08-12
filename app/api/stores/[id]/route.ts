import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: { reviews: { select: { rating: true } } },
      },
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const productsWithRatings = store.products.map((p) => {
    const count = p.reviews.length;
    const average =
      count > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / count
        : null;
    const { reviews, ...rest } = p;
    return { ...rest, averageRating: average, reviewCount: count };
  });

  return NextResponse.json({ ...store, products: productsWithRatings });
}
