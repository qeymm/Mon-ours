"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  isDailyDrop: boolean;
  batchQuantity: number | null;
  quantitySold: number;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", stock: "" });
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    isDailyDrop: false,
    batchQuantity: "",
  });
  const [error, setError] = useState("");

  async function loadProducts() {
    const storeRes = await fetch("/api/store");
    const storeData = await storeRes.json();
    if (!storeData.store) return;
    setStoreId(storeData.store.id);
    setFeaturedId(storeData.store.featuredProductId); // ADD THIS LINE

    const res = await fetch(`/api/products?storeId=${storeData.store.id}`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const body: Record<string, unknown> = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
    };

    if (form.isDailyDrop) {
      body.isDailyDrop = true;
      body.batchQuantity = Number(form.batchQuantity);
      body.batchDate = new Date().toISOString();
      body.stock = Number(form.batchQuantity);
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error?.formErrors?.[0] || "Failed to create product");
      return;
    }
    toast.success("Product added");

    // NEW: auto-feature it if it's a daily bake
    if (form.isDailyDrop) {
      await fetch("/api/store/featured", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: data.id }),
      });
    }

    setForm({
      name: "",
      price: "",
      stock: "",
      isDailyDrop: false,
      batchQuantity: "",
    });
    loadProducts();
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      price: p.price,
      stock: p.isDailyDrop ? String(p.batchQuantity ?? 0) : String(p.stock),
    });
  }

  async function handleSaveEdit(id: string, isDailyDrop: boolean) {
    const body: Record<string, unknown> = {
      name: editForm.name,
      price: Number(editForm.price),
    };

    if (isDailyDrop) {
      body.batchQuantity = Number(editForm.stock);
    } else {
      body.stock = Number(editForm.stock);
    }

    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    toast.success("Product updated");
    setEditingId(null);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Product deleted");
    loadProducts();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        My Products
      </h1>

      <form
        onSubmit={handleCreate}
        className="bg-surface border border-ink/10 rounded-2xl p-5 mb-8 space-y-3"
      >
        <h2 className="font-display font-semibold text-ink">Add a product</h2>

        <input
          placeholder="Product name"
          className="border border-ink/15 p-2 w-full rounded-lg bg-white"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="flex gap-3">
          <input
            placeholder="Price"
            type="number"
            step="0.01"
            className="border border-ink/15 p-2 w-full rounded-lg bg-white"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          {!form.isDailyDrop && (
            <input
              placeholder="Stock"
              type="number"
              className="border border-ink/15 p-2 w-full rounded-lg bg-white"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.isDailyDrop}
            onChange={(e) =>
              setForm({ ...form, isDailyDrop: e.target.checked })
            }
          />
          This is a "Today's Bake" limited daily drop
        </label>

        {form.isDailyDrop && (
          <input
            placeholder="Quantity made today"
            type="number"
            className="border border-ink/15 p-2 w-full rounded-lg bg-white"
            value={form.batchQuantity}
            onChange={(e) =>
              setForm({ ...form, batchQuantity: e.target.value })
            }
          />
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand/90 transition"
        >
          Add product
        </button>
      </form>

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center bg-surface border border-ink/10 rounded-xl p-4"
          >
            {editingId === p.id ? (
              <div className="flex gap-2 flex-1 items-center">
                <input
                  className="border border-ink/15 p-2 rounded-lg bg-white w-32"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className="border border-ink/15 p-2 rounded-lg bg-white w-24"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="border border-ink/15 p-2 rounded-lg bg-white w-20"
                  value={editForm.stock}
                  onChange={(e) =>
                    setEditForm({ ...editForm, stock: e.target.value })
                  }
                />
                <button
                  onClick={() => handleSaveEdit(p.id, p.isDailyDrop)}
                  className="text-accent text-sm hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-ink/50 text-sm hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-sm text-ink/60">
                    ${p.price} —{" "}
                    {p.isDailyDrop
                      ? `${(p.batchQuantity ?? 0) - p.quantitySold} of ${p.batchQuantity} left today`
                      : `${p.stock} in stock`}
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  {featuredId === p.id && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => startEdit(p)}
                    className="text-ink/70 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {products.length === 0 && (
          <p className="text-ink/50 text-sm">No products yet.</p>
        )}
      </div>
    </div>
  );
}
