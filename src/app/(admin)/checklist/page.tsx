"use client";

import React from "react";
import { CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9]">
        <div>
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-[#1A1A1A]">
            Checklist Acara
          </h1>
          <p className="text-sm md:text-base text-[#5E5A52] mt-1">
            Pantau status barang dimuat dan kembali untuk mencegah barang tertinggal
          </p>
        </div>
      </div>

      <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[320px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#8A6A22]">
          <CheckSquare size={32} />
        </div>
        <h2 className="font-sans text-2xl font-bold text-[#1A1A1A]">
          Daftar Kelengkapan Barang Acara
        </h2>
        <p className="text-sm text-[#5E5A52] max-w-md">
          Modul penanda barang: Dimuat saat berangkat dan Kembali setelah pembongkaran dengan sorotan khusus untuk barang yang belum kembali.
        </p>
      </Card>
    </div>
  );
}
