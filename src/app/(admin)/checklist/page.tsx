"use client";

import React from "react";
import { CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3D3D3D]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#F5EDDC]">
            Checklist Acara
          </h1>
          <p className="text-sm md:text-base text-[#A8A49B] mt-1">
            Pantau status barang dimuat dan kembali untuk mencegah barang tertinggal
          </p>
        </div>
      </div>

      <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[320px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#D4AD5C]">
          <CheckSquare size={32} />
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#F5EDDC]">
          Daftar Kelengkapan Barang Acara
        </h2>
        <p className="text-sm text-[#A8A49B] max-w-md">
          Modul penanda barang: Dimuat saat berangkat dan Kembali setelah pembongkaran dengan sorotan khusus untuk barang yang belum kembali.
        </p>
      </Card>
    </div>
  );
}
