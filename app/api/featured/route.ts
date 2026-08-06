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
        },
      },
    },
  });

  return NextResponse.json(stores);
}
