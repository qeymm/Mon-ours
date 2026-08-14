"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/app/components/StarRating";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  buyer: { name: string };
  product: { name: string; store: { storeName: string } };
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews/featured")
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="bg-surface py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display text-2xl font-semibold text-ink text-center mb-10">
          Loved by our buyers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((r) => (
            <div key={r.id} className="bg-background rounded-2xl p-6">
              <StarRating value={r.rating} size="sm" />
              <p className="text-ink/80 text-sm mt-3 leading-relaxed">
                "{r.comment}"
              </p>
              <p className="text-xs text-ink/50 mt-4">
                {r.buyer.name} — on {r.product.name} from{" "}
                {r.product.store.storeName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
