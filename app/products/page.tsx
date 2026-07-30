"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

interface Product {
  id: string;
  name: string;
  price: string;
  storeId: string;
  store: { storeName: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem, items } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Products ({items.length} in cart)
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-500">{p.store.storeName}</p>
            <p>${p.price}</p>
            <button
              onClick={() =>
                addItem({
                  productId: p.id,
                  name: p.name,
                  price: Number(p.price),
                  storeId: p.storeId,
                })
              }
              className="mt-2 bg-black text-white px-3 py-1 rounded text-sm"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
