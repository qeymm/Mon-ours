import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const storeSchema = z.object({
  storeName: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  if (user.role !== "SELLER")
    return NextResponse.json({ error: "Seller only" }, { status: 403 });

  const existing = await prisma.store.findUnique({
    where: { sellerId: user.userId },
  });
  if (existing)
    return NextResponse.json({ error: "Store already exist" }, { status: 409 });

  const body = await req.json();
  const parsed = storeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const store = await prisma.store.create({
    data: { ...parsed.data, sellerId: user.userId },
  });

  return NextResponse.json(store);
}

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { sellerId: user.userId },
  });
  return NextResponse.json({ store });
}
