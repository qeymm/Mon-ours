"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/app/components/skeleton";
import { EmptyState } from "@/app/components/EmptyState";
import { StarRating } from "@/app/components/StarRating";

interface Product {
  id: string;
  name: string;
  price: string;
  storeId: string;
  imageUrl: string | null;
  isDailyDrop: boolean;
  stock: number;
  batchQuantity: number | null;
  quantitySold: number;
  averageRating: number | null;
  reviewCount: number;
  store: { storeName: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dailyOnly, setDailyOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (dailyOnly) params.set("dailyDrop", "true");

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [search, dailyOnly]);

  function handleAddToCart(p: Product) {
    if (!user) {
      localStorage.setItem(
        "pendingCartItem",
        JSON.stringify({
          productId: p.id,
          name: p.name,
          price: Number(p.price),
          storeId: p.storeId,
        }),
      );
      router.push("/login");
      return;
    }

    addItem({
      productId: p.id,
      name: p.name,
      price: Number(p.price),
      storeId: p.storeId,
    });
  }

  const groupedByStore = products.reduce<
    Record<string, { storeName: string; items: Product[] }>
  >((acc, p) => {
    if (!acc[p.storeId]) {
      acc[p.storeId] = { storeName: p.store.storeName, items: [] };
    }
    acc[p.storeId].items.push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-8">
        All Pastries
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search pastries..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-ink/15 p-3 rounded-xl bg-surface flex-1"
        />
        <button
          onClick={() => setDailyOnly((prev) => !prev)}
          className={`px-4 py-3 rounded-xl text-sm font-medium border transition whitespace-nowrap ${
            dailyOnly
              ? "bg-stamp text-white border-stamp"
              : "border-ink/15 text-ink/60"
          }`}
        >
          🥐 Today's Bake only
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl overflow-hidden">
              <Skeleton className="w-full h-40 rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon="🥐"
          title="No pastries yet"
          description="Check back soon — bakers are just getting started."
        />
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedByStore).map(([storeId, group]) => (
            <div key={storeId}>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {group.storeName}
                </h2>
                <a
                  href={`/stores/${storeId}`}
                  className="text-sm text-accent hover:underline"
                >
                  View shop →
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {group.items.map((p) => {
                  const remaining = p.isDailyDrop
                    ? (p.batchQuantity ?? 0) - p.quantitySold
                    : p.stock;
                  const soldOut = remaining <= 0;

                  return (
                    <div
                      key={p.id}
                      className="relative bg-surface rounded-2xl shadow-sm overflow-hidden flex flex-col"
                    >
                      {p.isDailyDrop && (
                        <span className="absolute top-3 left-3 z-10 bg-stamp text-white text-xs font-medium px-3 py-1 rounded-full rotate-[-4deg] border border-dashed border-white/60">
                          Today's Bake
                        </span>
                      )}

                      <div className="relative w-full h-40 bg-ink/5">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <p className="font-display font-semibold text-ink">
                          {p.name}
                        </p>

                        {p.reviewCount > 0 ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <StarRating
                              value={Math.round(p.averageRating ?? 0)}
                              size="sm"
                            />
                            <span className="text-xs text-ink/50">
                              ({p.reviewCount})
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-ink/40 mt-1">
                            No reviews yet
                          </p>
                        )}

                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-accent font-semibold">
                            ${p.price}
                          </span>
                          <span className="text-xs text-ink/50">
                            {soldOut ? "Sold out" : `${remaining} left`}
                          </span>
                        </div>

                        {user?.role !== "SELLER" && (
                          <button
                            disabled={soldOut}
                            onClick={() => handleAddToCart(p)}
                            className="mt-3 bg-brand text-white py-2 rounded-full text-sm font-medium hover:bg-brand/90 transition disabled:bg-ink/20 disabled:cursor-not-allowed"
                          >
                            {soldOut ? "Sold out" : "Add to cart"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
