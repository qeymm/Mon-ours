"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
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
}

interface Store {
  id: string;
  storeName: string;
  description: string | null;
  products: Product[];
}

export default function StorePage() {
  const params = useParams();
  const storeId = params.id as string;

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/stores/${storeId}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStore(data);
        setLoading(false);
      });
  }, [storeId]);

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <EmptyState
        icon="🏚️"
        title="Shop not found"
        description="This bakery doesn't exist or may have been removed."
        action={{ label: "Browse all pastries", href: "/products" }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {store.storeName}
        </h1>
        {store.description && (
          <p className="text-ink/60 mt-2 max-w-lg">{store.description}</p>
        )}
      </div>

      {store.products.length === 0 ? (
        <EmptyState
          icon="🧁"
          title="No products yet"
          description="This bakery hasn't added any pastries yet — check back soon."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {store.products.map((p) => {
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
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating
                        value={Math.round(p.averageRating ?? 0)}
                        size="sm"
                      />
                      <span className="text-xs text-ink/50">
                        ({p.reviewCount})
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-ink/40 mt-0.5">No reviews yet</p>
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
      )}
    </div>
  );
}
