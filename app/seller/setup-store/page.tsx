"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupStorePage() {
  const router = useRouter();
  const [form, setForm] = useState({ storeName: "", description: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/seller/orders");
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">
        Set up your shop
      </h1>
      <p className="text-ink/60 text-sm mb-6">
        Give your bakery a name and a short description — you can change this
        anytime.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Shop name"
          className="border border-ink/15 p-3 w-full rounded-xl bg-surface"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="border border-ink/15 p-3 w-full rounded-xl bg-surface"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-brand text-white w-full py-3 rounded-full font-medium hover:bg-brand/90 transition"
        >
          Create my shop
        </button>
      </form>
    </div>
  );
}
