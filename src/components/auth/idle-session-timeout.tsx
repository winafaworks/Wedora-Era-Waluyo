"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { logout } from "@/lib/actions/auth";
import { ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 60 menit
const WARNING_BEFORE_MS = 2 * 60 * 1000; // Muncul peringatan 2 menit sebelum logout (di menit ke-58)

export function IdleSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const lastActivityRef = useRef<number>(Date.now());
  const timerCheckRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [showWarning]);

  const handleForceLogout = useCallback(async () => {
    setShowWarning(false);
    await logout();
  }, []);

  useEffect(() => {
    // Event listener untuk mendeteksi keaktifan pengguna
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 1000); // Throttle agar hemat CPU

      // Jangan reset jika dialog peringatan sedang aktif (agar user sengaja mengklik tombol lanjut)
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    // Timer pengecekan periodik setiap 10 detik
    timerCheckRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;

      if (idleTime >= IDLE_TIMEOUT_MS) {
        // Waktu habis, logout paksa
        handleForceLogout();
      } else if (idleTime >= IDLE_TIMEOUT_MS - WARNING_BEFORE_MS && !showWarning) {
        // Tampilkan dialog peringatan
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - idleTime) / 1000));
        setSecondsRemaining(remaining);
        setShowWarning(true);
      }
    }, 10000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (timerCheckRef.current) clearInterval(timerCheckRef.current);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [showWarning, handleForceLogout]);

  // Countdown timer saat dialog peringatan muncul
  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleForceLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning, handleForceLogout]);

  if (!showWarning) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#1E1E1E] border-2 border-[#EEB100] rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EEB100] text-[#111111] flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 className="font-sans text-lg font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
              Peringatan Sesi Tidak Aktif
            </h3>
            <p className="text-xs text-[#8A857B]">Standar Keamanan Siber WEDORA</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-[#5E5A52] dark:text-[#C7C2B6] leading-relaxed bg-[#FAF8F3] dark:bg-[#252525] p-4 rounded-xl border border-[#EFE8D8] dark:border-[#332F28] space-y-2">
          <p>
            Tidak ada aktivitas terdeteksi selama hampir 1 jam. Demi melindungi data pelanggan dan operasional Era Waluyo, sesi admin akan otomatis dikunci dalam:
          </p>
          <div className="flex items-center justify-center gap-2 py-2 text-xl font-bold font-mono text-[#EEB100] bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-lg border border-[#E5DEC9] dark:border-[#38342C]">
            <Clock size={20} />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleForceLogout}
            className="text-xs px-4 h-9 border-[#B13C30]/40 text-[#B13C30] hover:bg-[#B13C30]/10"
          >
            Keluar Sekarang
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={resetActivity}
            className="text-xs px-5 h-9 bg-[#EEB100] text-[#111111] hover:bg-[#D4AD5C] font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Lanjutkan Sesi Saya</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
