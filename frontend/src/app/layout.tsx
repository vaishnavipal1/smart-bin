import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ Correctly load Google fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // helps with FOUT & SSR consistency
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ✅ Optional metadata (shows up in tab & SEO)
export const metadata: Metadata = {
  title: "Smart Bin",
  description: "Next.js + Tailwind + IoT Smart Bin Dashboard",
};

// ✅ Root Layout (applies globally)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true} // 👈 prevents harmless SSR/CSR mismatch warnings
      >
        {children}
      </body>
    </html>
  );
}
