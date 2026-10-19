import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBookingByToken } from "@/lib/actions/booking";
import KonfirmasiClient from "./konfirmasi-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

async function TokenContent({ params }: PageProps) {
  const { token } = await params;
  const booking = await getBookingByToken(token);

  if (!booking) {
    notFound();
  }

  return <KonfirmasiClient booking={booking} />;
}

export default function KonfirmasiPelangganPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="theme-cream min-h-screen py-16 text-center text-[#5E5A52]">
          Memuat data kesepakatan acara...
        </div>
      }
    >
      <TokenContent params={params} />
    </Suspense>
  );
}
