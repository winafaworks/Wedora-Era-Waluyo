"use client";

import React from "react";
import { Shirt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function KatalogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2F2F2F]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#F5EDDC]">
            Katalog Busana & Dekorasi
          </h1>
          <p className="text-sm md:text-base text-[#A8A49B] mt-1">
            Koleksi kebaya, beskap adat, ukuran, dan dekorasi pernikahan Era Waluyo
          </p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus size={18} />
          <span>Tambah Item Katalog</span>
        </Button>
      </div>

      <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[320px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#D4AD5C]">
          <Shirt size={32} />
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#F5EDDC]">
          Manajemen Katalog & Galeri Foto
        </h2>
        <p className="text-sm text-[#A8A49B] max-w-md">
          Modul pengelolaan busana, ukuran (S/M/L/XL), dekorasi, dan penyimpanan foto katalog via Supabase Storage.
        </p>
      </Card>
    </div>
  );
}
