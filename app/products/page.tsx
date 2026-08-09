"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

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
  store: { storeName: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink mb-8">
        All Pastries
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => {
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
                <p className="font-display font-semibold text-ink">{p.name}</p>
                <p className="text-sm text-ink/60 mb-2">{p.store.storeName}</p>

                <div className="mt-auto flex justify-between items-center">
                  <span className="text-accent font-semibold">${p.price}</span>
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

      {products.length === 0 && <p className="text-ink/50">No products yet.</p>}
    </div>
  );
}
