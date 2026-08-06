"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  product: { name: string; imageUrl: string | null };
}

interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);
  async function handleCancel(orderId: string) {
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "PATCH",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
    );
  }

  if (loading) return <div className="p-8"> Loading... </div>;
  if (orders.length === 0) return <div className="p-8">No orders yet.</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">
                Order #{order.id.slice(0, 8)}
              </span>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  order.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.status}
              </span>
            </div>
            <ul className=" text-sm text-gray-600 mb-2">
              {order.orderItems.map((item) => (
                <li key={item.id}>
                  {item.quantity} x {item.product.name} (${item.priceAtPurchase}{" "}
                  each)
                </li>
              ))}
            </ul>

            <div className=" flex justify-between items-center">
              <span className="font-semibold"> Total: ${order.total}</span>
              {order.status === "PENDING" && (
                <button
                  onClick={() => handleCancel(order.id)}
                  className="text-red-600 text-sm underline"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
