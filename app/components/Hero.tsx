"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface FeaturedEntry {
  id: string;
  storeName: string;
  featuredProduct: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: string;
    isDailyDrop: boolean;
    stock: number;
    batchQuantity: number | null;
    quantitySold: number;
  } | null;
}

export default function Hero() {
  const [featured, setFeatured] = useState<FeaturedEntry[]>([]);

  useEffect(() => {
    fetch("/api/featured")
      .then((res) => res.json())
      .then((data) => setFeatured(Array.isArray(data) ? data : []));
  }, []);

  return (
    <section className="bg-background">
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
          Freshly Baked,
          <br />
          By Your Neighborhood Bakers
        </h1>
        <p className="mt-4 text-ink/70 max-w-md mx-auto">
          A marketplace of independent pastry shops — order straight from the
          people who bake it.
        </p>
        <a
          href="/products"
          className="inline-block mt-6 bg-brand text-white px-6
        py-3 rounded-full font-medium hover:bg-brand/90 transition"
        >
          Browse Bakeries
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-display text-xl font-semibold text-ink mb-4">
          Today's Fresh
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {featured.map((entry) => {
            const p = entry.featuredProduct;
            if (!p) return null;

            const remaining = p.isDailyDrop
              ? (p.batchQuantity ?? 0) - p.quantitySold
              : p.stock;

            return (
              <div
                key={entry.id}
                className="relative flex-shrink-0 w-56 bg-surface rounded-2xl shadow-sm overflow-hidden"
              >
                {p.isDailyDrop && (
                  <span className="absolute top-3 left-3 z-10 bg-stamp text-white text-xs font-medium px-3 py-1 rounded-full rotate-[-4deg] border border-dashed border-white/60">
                    Today's Bake
                  </span>
                )}

                <div className="relative w-full h-36 bg-ink/5">
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

                <div className="p-4">
                  <p className="font-display font-semibold text-ink">
                    {p.name}
                  </p>
                  <p className="text-sm text-ink/60">{entry.storeName}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-accent font-semibold">
                      ${p.price}
                    </span>
                    <span className="text-xs text-ink/50">
                      {remaining} left
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {featured.length === 0 && (
            <p className="text-ink/50 text-sm">
              No featured pastries yet — check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
