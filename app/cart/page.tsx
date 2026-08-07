"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  useEffect(() => {
    if (user?.role === "SELLER") {
      router.push("/seller/orders");
    }
  }, [user, router]);

  if (items.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2x1 font-bold mb-4">Your Cart </h1>
        <p>Your Cart is empty.</p>
        <Link href="/products" className="text-blue-600 underline">
          {" "}
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2x1">
      <h1 className="text-2x1 font-bold mb-4">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b pb-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">
                ${item.price.toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
              >
                +
              </button>

              <button
                onClick={() => removeItem(item.productId)}
                className="text-red-600 text-sm ml-4"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <div className="flex gap-2">
          <button onClick={clearCart} className="border px-4 py-2 rounded">
            Clear Cart
          </button>
          <button
            onClick={handleCheckout}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );

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
      alert(data.error);
      return;
    }

    clearCart();
    alert("Order placed!");
    // later: redirect to an order confirmation / order history page
  }
}
