"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SellerOrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  product: { name: string };
  order: {
    id: string;
    status: string;
    createdAt: string;
    buyer: { name: string };
  };
}

interface GroupedOrder {
  orderId: string;
  status: string;
  buyerName: string;
  items: SellerOrderItem[];
}

export default function SellerOrdersPage() {
  const [groups, setGroups] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/orders")
      .then((res) => res.json())
      .then((data: SellerOrderItem[]) => {
        const list = Array.isArray(data) ? data : [];

        const map = new Map<string, GroupedOrder>();
        for (const item of list) {
          const existing = map.get(item.order.id);
          if (existing) {
            existing.items.push(item);
          } else {
            map.set(item.order.id, {
              orderId: item.order.id,
              status: item.order.status,
              buyerName: item.order.buyer.name,
              items: [item],
            });
          }
        }

        setGroups(Array.from(map.values()));
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
      toast.error(data.error);
      return;
    }

    toast.success(`Marked as ${status.toLowerCase()}`);
    setGroups((prev) =>
      prev.map((g) => (g.orderId === orderId ? { ...g, status } : g)),
    );
  }

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-ink/50">Loading...</div>
    );
  if (groups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">
          Incoming Orders
        </h1>
        <p className="text-ink/60">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Incoming Orders
      </h1>

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.orderId}
            className="bg-surface border border-ink/10 rounded-2xl p-5"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold text-ink">
                  Order #{group.orderId.slice(0, 8)}
                </p>
                <p className="text-sm text-ink/50">Buyer: {group.buyerName}</p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[group.status]}`}
              >
                {group.status}
              </span>
            </div>

            <ul className="text-sm text-ink/70 space-y-1 mb-4 border-t border-ink/10 pt-3">
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.product.name}
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-2">
              {group.status === "PENDING" && (
                <button
                  onClick={() => updateStatus(group.orderId, "SHIPPED")}
                  className="bg-brand text-white px-4 py-1.5 rounded-full text-sm hover:bg-brand/90 transition"
                >
                  Mark Shipped
                </button>
              )}
              {group.status === "SHIPPED" && (
                <button
                  onClick={() => updateStatus(group.orderId, "DELIVERED")}
                  className="bg-brand text-white px-4 py-1.5 rounded-full text-sm hover:bg-brand/90 transition"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
