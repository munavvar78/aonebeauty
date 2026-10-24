import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Syne } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/PageLoader";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aone Beauty",
    template: "%s · Aone Beauty",
  },
  description:
    "Quiet skin care for soft rituals — face wash and cream from Aone Beauty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        <CartProvider>
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <WhatsAppFab />
        </CartProvider>
      </body>
    </html>
  );
}
