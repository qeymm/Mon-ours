import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg font-semibold text-white mb-2">
            Mon Ours
          </p>
          <p className="text-sm text-white/50">
            Handcrafted pastries from independent bakers, all in one place.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-3">Shop</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/products" className="hover:text-white transition">
              All Pastries
            </Link>
            <Link href="/register" className="hover:text-white transition">
              Become a Seller
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-3">Company</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/about" className="hover:text-white transition">
              About
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white mb-3">Account</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/login" className="hover:text-white transition">
              Login
            </Link>
            <Link href="/register" className="hover:text-white transition">
              Register
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Mon Ours. Built as a learning project.
      </div>
    </footer>
  );
}
