import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/app/components/Header";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mon Ours — Handcrafted Pastries",
  description:
    "An online marketplace for independent pastry shops. Fresh bakes, daily drops, straight from the baker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${workSans.variable} font-body bg-background text-ink`}
      >
        <AuthProvider>
          <CartProvider>
            <Header />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#FFFDF9",
                  color: "#3B2418",
                  border: "1px solid rgba(59, 36, 24, 0.1)",
                  borderRadius: "1rem",
                },
              }}
            />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
