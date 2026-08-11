import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-4">🥐</div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">
        Page not Found
      </h1>
      <p className="text-ink/60 max-w-sm mb-6">
        Looks like this pastry got eaten before you got here. Let's get you back
        to something fresh.
      </p>
      <Link
        href="/products"
        className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition"
      >
        Browse pastries
      </Link>
    </div>
  );
}
