import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const current = getCurrentUser(req);
  if (!current) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: current.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ user });
}
