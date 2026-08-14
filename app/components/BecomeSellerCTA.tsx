"use client";

import { useAuth } from "@/lib/auth-context";

export default function BecomeSellerCTA() {
  const { user } = useAuth();

  // Don't show this to sellers, or to buyers already mid-shopping who don't need it
  if (user?.role === "SELLER") return null;

  return (
    <section className="bg-brand py-14">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
          Are you a baker?
        </h2>
        <p className="text-white/80 mb-6 max-w-lg mx-auto">
          Open your own shop on Mon Ours — set your own prices, feature your
          daily bakes, and reach buyers looking for something fresh.
        </p>

        <a
          href="/register"
          className="inline-block bg-white text-brand px-6 py-3 rounded-full font-medium hover:bg-white/90 transition"
        >
          Start Selling
        </a>
      </div>
    </section>
  );
}
