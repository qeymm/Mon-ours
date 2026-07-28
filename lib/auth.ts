import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: "SELLER" | "BUYER";
}

export function getCurrentUser(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return payload;
  } catch {
    return null; // expired or tampered token
  }
}
