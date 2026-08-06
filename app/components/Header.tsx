"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center  p-4 border-b">
      <Link href="/" className="font-bold text-lg">
        Mon Ours
      </Link>
      <nav className="flex gap-4 items-center">
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
        {user ? (
          <>
            <span className="text-sm">Hi, {user.name}</span>
            <button onClick={logout} className="text-sm underline">
              Logout
            </button>
            {user.role === "BUYER" && <Link href="/orders">My Orders</Link>}
            {user.role === "SELLER" && (
              <Link href="/seller/orders">Incoming Orders</Link>
            )}
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
