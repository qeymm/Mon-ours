import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const user = getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    if (user.role !== "BUYER") return NextResponse.json({ error: "Buyers Only" }, { status: 403 });

    const orders = await prisma.order.findMany({
        where: { buyerId: user.userId },
        include: {
            orderItems: {
                include: { product: { select: { name: true, imageUrl: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
}