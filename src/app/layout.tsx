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

import { ThemeProvider } from "@/components/theme/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${cormorant.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("wedora-theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="light"||(t==="system"&&!d)){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${plusJakarta.className} antialiased min-h-screen`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
