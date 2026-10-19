"use client";

import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function KalenderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2F2F2F]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#F5EDDC]">
            Kalender Booking
          </h1>
          <p className="text-sm md:text-base text-[#A8A49B] mt-1">
            Pantau jadwal ketersediaan tanggal dan acara pernikahan
          </p>
        </div>
      </div>

      <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[360px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#D4AD5C]">
          <CalendarIcon size={32} />
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#F5EDDC]">
          Tampilan Kalender Interaktif
        </h2>
        <p className="text-sm text-[#A8A49B] max-w-md">
          Modul kalender booking bulanan dengan penanda tanggal terisi, peringatan duplikasi tanggal, dan preview rincian acara.
        </p>
        <div className="pt-2">
          <Button variant="secondary" size="sm">
            Tahap Pengembangan (WBS 1.2.1)
          </Button>
        </div>
      </Card>
    </div>
  );
}
