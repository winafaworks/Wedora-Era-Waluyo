import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WEDORA — Wedding Digital Management | Era Waluyo",
  description:
    "Sistem digital manajemen booking, katalog busana, checklist acara, dan konfirmasi pernikahan Era Waluyo Purwokerto.",
  icons: {
    icon: "/logo_erawaluyo.jpeg",
    shortcut: "/logo_erawaluyo.jpeg",
    apple: "/logo_erawaluyo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${cormorant.variable}`}>
      <body className={`${plusJakarta.className} antialiased min-h-screen`}>{children}</body>
    </html>
  );
}
