import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional(),
  isDailyDrop: z.boolean().optional(),
  batchDate: z.string().datetime().optional(),
  batchQuantity: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  if (user.role !== "SELLER")
    return NextResponse.json({ error: "Seller Only" }, { status: 403 });

  const store = await prisma.store.findUnique({
    where: { sellerId: user.userId },
  });
  if (!store)
    return NextResponse.json(
      { error: "Set up your store first" },
      { status: 400 },
    );

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      batchDate: parsed.data.batchDate
        ? new Date(parsed.data.batchDate)
        : undefined,
      storeId: store.id,
    },
  });

  return NextResponse.json(product);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const dailyOnly = searchParams.get("dailyDrop") === "true";
  const search = searchParams.get("search");

  const products = await prisma.product.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(dailyOnly ? { isDailyDrop: true } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    include: { store: { select: { id: true, storeName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
