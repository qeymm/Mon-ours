"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    await refreshUser();

    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();

    if (meData.user?.role === "SELLER") {
      const storeRes = await fetch("/api/store");
      const storeData = await storeRes.json();

      if (!storeData.store) {
        router.push("/seller/setup-store");
        return;
      }
      router.push("/seller/orders");
      return;
    }

    router.push("/products");
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6 text-center">
        Welcome back
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Email"
          type="email"
          className="border border-ink/15 p-3 w-full rounded-xl bg-surface"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          className="border border-ink/15 p-3 w-full rounded-xl bg-surface"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-brand text-white w-full py-3 rounded-full font-medium hover:bg-brand/90 transition"
        >
          Login
        </button>
      </form>
      <p className="text-center text-sm text-ink/60 mt-4">
        New here?{" "}
        <a href="/register" className="text-accent hover:underline">
          Create an account
        </a>
      </p>
    </div>
  );
}
