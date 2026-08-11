"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/app/components/skeleton";
import { EmptyState } from "@/app/components/EmptyState";

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

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  pendingCount: number;
  deliveredCount: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export default function SellerOrdersPage() {
  const [groups, setGroups] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

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

    fetch("/api/seller/analytics")
      .then((res) => res.json())
      .then(setAnalytics);
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

    fetch("/api/seller/analytics")
      .then((res) => res.json())
      .then(setAnalytics);
  }

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink mb-6">
          Incoming Orders
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
  if (groups.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No orders yet"
        description="Once buyers order from your shop, they'll appear here."
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Incoming Orders
      </h1>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-ink/10 rounded-2xl p-4">
            <p className="text-xs text-ink/50 mb-1">Total Revenue</p>
            <p className="font-display text-2xl font-semibold text-accent">
              ${analytics.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-surface border border-ink/10 rounded-2xl p-4">
            <p className="text-xs text-ink/50 mb-1">Total Orders</p>
            <p className="font-display text-2xl font-semibold text-ink">
              {analytics.totalOrders}
            </p>
          </div>
          <div className="bg-surface border border-ink/10 rounded-2xl p-4">
            <p className="text-xs text-ink/50 mb-1">Pending</p>
            <p className="font-display text-2xl font-semibold text-amber-600">
              {analytics.pendingCount}
            </p>
          </div>
          <div className="bg-surface border border-ink/10 rounded-2xl p-4">
            <p className="text-xs text-ink/50 mb-1">Delivered</p>
            <p className="font-display text-2xl font-semibold text-green-600">
              {analytics.deliveredCount}
            </p>
          </div>
        </div>
      )}

      {analytics && analytics.topProducts.length > 0 && (
        <div className="bg-surface border border-ink/10 rounded-2xl p-5 mb-8">
          <h2 className="font-display font-semibold text-ink mb-3">
            Top Sellers
          </h2>
          <div className="space-y-2">
            {analytics.topProducts.map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {p.name} × {p.quantity}
                </span>
                <span className="text-accent font-medium">
                  ${p.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
