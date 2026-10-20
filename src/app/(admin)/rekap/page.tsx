import React, { Suspense } from "react";
import { Metadata } from "next";
import { getRekapData } from "@/lib/actions/rekap";
import RekapClient from "./rekap-client";

export const metadata: Metadata = {
  title: "Rekap Booking & Pembayaran | WEDORA Era Waluyo",
  description: "Laporan rekapitulasi pemesanan acara pernikahan, tren bulanan, evaluasi paket, dan pencatatan pembayaran DP Era Waluyo.",
};

async function RekapContent() {
  const { bookings, packages } = await getRekapData();
  return <RekapClient initialBookings={bookings} packages={packages} />;
}

export default function RekapPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="pb-2 border-b border-[#E5DEC9]">
            <h1 className="font-sans text-[28px] font-bold text-[#1A1A1A]">
              Rekap Booking & Pembayaran
            </h1>
            <p className="text-[14px] text-[#5E5A52] mt-1">
              Memuat data rekapitulasi...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[#EFE9DC] rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <RekapContent />
    </Suspense>
  );
}
