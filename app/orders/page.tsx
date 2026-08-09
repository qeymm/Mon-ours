"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/app/components/skeleton";
import { EmptyState } from "@/app/components/EmptyState";

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
      toast.error(data.error);
      return;
    }
    toast.success("Order cancelled");
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink mb-6">
          Order History
        </h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-ink/10 rounded-2xl p-5 space-y-3"
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No orders yet"
        description="When you order something, it'll show up here."
        action={{ label: "Browse pastries", href: "/products" }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Order History
      </h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusStyles: Record<string, string> = {
            PENDING: "bg-amber-100 text-amber-700",
            SHIPPED: "bg-blue-100 text-blue-700",
            DELIVERED: "bg-green-100 text-green-700",
            CANCELLED: "bg-red-100 text-red-700",
          };

          return (
            <div
              key={order.id}
              className="bg-surface border border-ink/10 rounded-2xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-ink">
                  Order #{order.id.slice(0, 8)}
                </span>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <ul className="text-sm text-ink/60 space-y-1 mb-3">
                {order.orderItems.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.product.name} — $
                    {item.priceAtPurchase}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center border-t border-ink/10 pt-3">
                <span className="font-semibold text-ink">
                  Total: ${order.total}
                </span>
                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
