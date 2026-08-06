"use client";

import { useEffect, useState } from "react";

interface SellerOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: String;
  product: { name: string };
  order: { id: string; status: string; createdAt: string };
}

export default function SellerOrdersPage() {
  const [items, setItems] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/orders")
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function updateStatus(
    orderId: string,
    status: "SHIPPED" | "DELIVERED",
  ) {
    const res = await fetch(`/api/seller/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.order.id === orderId
          ? { ...item, order: { ...item.order, status } }
          : item,
      ),
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Incoming Orders</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {item.quantity} x {item.product.name}
              </p>
              <p className="text-sm text-gray-500">
                Order #{item.order.id.slice(0, 8)} - {item.order.status}
              </p>
            </div>

            <div className="flex gap-2">
              {item.order.status === "PENDING" && (
                <button
                  onClick={() => updateStatus(item.order.id, "SHIPPED")}
                  className="border px-3 py-1 rounded text-sm"
                >
                  Mark Shipped
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
