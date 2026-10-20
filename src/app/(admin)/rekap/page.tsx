"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RekapPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A]">
            Rekap Booking & Pembayaran
          </h1>
          <p className="text-sm md:text-base text-[#5E5A52] mt-1">
            Laporan bulanan, per paket, dan status konfirmasi pesanan
          </p>
        </div>
      </div>

      <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[320px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#8A6A22]">
          <BarChart3 size={32} />
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#1A1A1A]">
          Laporan Rekapitulasi Data
        </h2>
        <p className="text-sm text-[#5E5A52] max-w-md">
          Modul rekap pendapatan DP, jumlah pesanan bulanan, dan evaluasi paket paling diminati.
        </p>
      </Card>
    </div>
  );
}
