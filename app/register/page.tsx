"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUYER",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(
        data.error?.formErrors?.[0] || data.error || "Registration Failed",
      );
      return;
    }

    router.push("/login");
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6 text-center">
        Create an account
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Name"
          className="border border-ink/15 p-3 w-full rounded-xl bg-surface"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "BUYER" })}
            className={`flex-1 py-2 rounded-full text-sm border transition ${
              form.role === "BUYER"
                ? "bg-brand text-white border-brand"
                : "border-ink/15 text-ink/60"
            }`}
          >
            I'm a Buyer
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "SELLER" })}
            className={`flex-1 py-2 rounded-full text-sm border transition ${
              form.role === "SELLER"
                ? "bg-brand text-white border-brand"
                : "border-ink/15 text-ink/60"
            }`}
          >
            I'm a Seller
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-brand text-white w-full py-3 rounded-full font-medium hover:bg-brand/90 transition"
        >
          Register
        </button>
      </form>
      <p className="text-center text-sm text-ink/60 mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-accent hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}
