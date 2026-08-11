"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const { items, bumpCount } = useCart();
  const router = useRouter();
  const { user, logout } = useAuth();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [bumping, setBumping] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  useEffect(() => {
    if (bumpCount === 0) return; // skip on initial mount
    setBumping(true);
    const timeout = setTimeout(() => setBumping(false), 300);
    return () => clearTimeout(timeout);
  }, [bumpCount]);

  return (
    <header className="bg-surface border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-brand"
        >
          Mon Ours
        </Link>

        <nav className="flex items-center gap-6 text-sm text-ink/80">
          <Link href="/products" className="hover:text-accent transition">
            Products
          </Link>

          {user?.role === "BUYER" && (
            <Link href="/orders" className="hover:text-accent transition">
              My Orders
            </Link>
          )}
          {user?.role === "SELLER" && (
            <Link
              href="/seller/orders"
              className="hover:text-accent transition"
            >
              Incoming Orders
            </Link>
          )}

          {user?.role === "SELLER" && (
            <Link
              href="/seller/products"
              className="hover:text-accent transition"
            >
              My Products
            </Link>
          )}

          {user?.role !== "SELLER" && (
            <Link
              href="/cart"
              className={`hover:text-accent transition-transform ${bumping ? "scale-150" : "scale-100"}`}
            >
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-ink/10 hover-pointer">
              <span className="text-ink/60">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-accent hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-ink/10">
              <Link href="/login" className="hover:text-accent transition">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-brand text-white px-4 py-1.5 rounded-full hover:bg-brand/90 transition"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
