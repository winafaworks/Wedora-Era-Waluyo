"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    // Pastikan session storage bersih saat admin berada di halaman login
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("wedora_session_active");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login({ email, password });

    if (res.success) {
      // Inisialisasi sesi aktif pada tab ini sebelum navigasi
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wedora_session_active", "true");
      }
      window.location.href = "/dashboard";
    } else {
      setIsLoading(false);
      setErrorMessage(res.error || "Gagal masuk. Silakan periksa kembali akun Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7EC] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5EDDC] flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Brand Header: Logo & Era Waluyo Prominent */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg border border-[#EEB100]/40 bg-[#0A0A0A] p-1 flex items-center justify-center">
              <Image
                src="/logo_erawaluyo.jpeg"
                alt="Logo Era Waluyo Purwokerto"
                width={96}
                height={96}
                className="w-full h-full object-contain rounded-xl"
                priority
              />
            </div>
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-[0.15em] text-[#EEB100] uppercase">
              ERA WALUYO
            </h1>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#5E5A52] dark:text-[#A8A296] uppercase mt-1">
              PURWOKERTO
            </p>
          </div>

          <p className="text-xs text-[#8A857B] dark:text-[#7A756D]">
            WEDORA — Sistem Digital Manajemen Pernikahan & Acara
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 space-y-6 border border-[#E5DEC9] dark:border-[#332F28] shadow-[0_4px_20px_rgba(0,0,0,0.05)] bg-[#FFFFFF] dark:bg-[#1C1C1C]">
          <div>
            <h2 className="font-sans text-[20px] font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
              Masuk Admin
            </h2>
            <p className="text-[14px] text-[#5E5A52] dark:text-[#A8A296] mt-1">
              Gunakan akun email resmi Era Waluyo untuk mengakses dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-[rgba(177,60,48,0.12)] border border-[#B13C30] rounded-xl text-xs text-[#B13C30] flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-[#5E5A52] dark:text-[#A8A296] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A857B]"
                  size={18}
                />
                <input
                  type="email"
                  required
                  placeholder="admin@erawaluyo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-[#FFFFFF] dark:bg-[#252525] border border-[#D6CEBE] dark:border-[#38342C] rounded-xl text-sm text-[#1A1A1A] dark:text-[#F5EDDC] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-[#5E5A52] dark:text-[#A8A296] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A857B]"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-11 pr-11 bg-[#FFFFFF] dark:bg-[#252525] border border-[#D6CEBE] dark:border-[#38342C] rounded-xl text-sm text-[#1A1A1A] dark:text-[#F5EDDC] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] transition-colors cursor-pointer"
                  aria-label="Lihat kata sandi"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full gap-2 shadow-sm cursor-pointer"
              >
                <LogIn size={18} />
                <span>{isLoading ? "Memeriksa Akun..." : "Masuk ke Dashboard"}</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#5E5A52] dark:text-[#8A857B]">
          Akses terbatas hanya untuk 3 pengelola administrasi Era Waluyo Purwokerto
        </p>
      </div>
    </div>
  );
}
