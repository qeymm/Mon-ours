import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stores = await prisma.store.findMany({
    where: { featuredProductId: { not: null } },
    select: {
      id: true,
      storeName: true,
      featuredProduct: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
          isDailyDrop: true,
          stock: true,
          batchQuantity: true,
          quantitySold: true,
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  const withRatings = stores.map((s) => {
    if (!s.featuredProduct) return s;
    const count = s.featuredProduct.reviews.length;
    const average =
      count > 0
        ? s.featuredProduct.reviews.reduce((sum, r) => sum + r.rating, 0) /
          count
        : null;
    const { reviews, ...rest } = s.featuredProduct;
    return {
      ...s,
      featuredProduct: { ...rest, averageRating: average, reviewCount: count },
    };
  });

  return NextResponse.json(withRatings);
}
