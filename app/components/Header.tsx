"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="flex justify-between items-center  p-4 border-b">
      <Link href="/" className="font-bold text-lg">
        Mon Ours
      </Link>
      <nav className="flex gap-4 items-center">
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
      </nav>
    </header>
  );
}
