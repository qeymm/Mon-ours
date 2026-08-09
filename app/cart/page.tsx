"use client";

import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/app/components/EmptyState";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "SELLER") {
      router.push("/seller/orders");
    }
  }, [user, router]);

  async function handleCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
      return;
    }

    clearCart();
    toast.success("Order placed!");
    router.push("/orders");
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Looks like you haven't added any pastries yet."
        action={{ label: "Browse pastries", href: "/products" }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Your Cart
      </h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between bg-surface border border-ink/10 rounded-xl p-4"
          >
            <div>
              <p className="font-semibold text-ink">{item.name}</p>
              <p className="text-sm text-ink/50">
                ${item.price.toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-ink/15 rounded-full">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="w-8 h-8 text-ink/60 hover:text-ink"
                >
                  −
                </button>
                <span className="w-6 text-center text-ink">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  className="w-8 h-8 text-ink/60 hover:text-ink"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center border-t border-ink/10 pt-6">
        <p className="font-display text-xl font-semibold text-ink">
          Total: ${total.toFixed(2)}
        </p>
        <div className="flex gap-3">
          <button
            onClick={clearCart}
            className="border border-ink/15 text-ink/70 px-4 py-2 rounded-full text-sm hover:bg-ink/5"
          >
            Clear
          </button>
          <button
            onClick={handleCheckout}
            className="bg-brand text-white px-6 py-2 rounded-full font-medium hover:bg-brand/90 transition"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
