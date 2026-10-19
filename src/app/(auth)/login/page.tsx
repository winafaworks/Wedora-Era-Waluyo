"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login({ email, password });

    if (res.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setIsLoading(false);
      setErrorMessage(res.error || "Gagal masuk. Silakan periksa kembali akun Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#F5EDDC] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-4xl font-bold tracking-[0.2em] text-[#D4AD5C]">
            WEDORA
          </h1>
          <p className="text-xs font-medium tracking-[0.25em] text-[#A8A49B] uppercase">
            Era Waluyo Purwokerto
          </p>
          <p className="text-xs text-[#6E6B64] pt-1">
            Sistem Digital Manajemen Pernikahan & Acara
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 space-y-6 border border-[#2F2F2F] shadow-xl">
          <div>
            <h2 className="font-serif text-2xl font-medium text-[#F5EDDC]">
              Masuk Admin
            </h2>
            <p className="text-xs text-[#A8A49B] mt-1">
              Gunakan akun email resmi Era Waluyo untuk mengakses dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-[rgba(224,122,110,0.14)] border border-[#E07A6E] rounded-xl text-xs text-[#E07A6E] flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6B64]"
                  size={18}
                />
                <input
                  type="email"
                  required
                  placeholder="admin@erawaluyo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-[#242424] border border-[#2F2F2F] rounded-xl text-sm text-[#F5EDDC] placeholder-[#6E6B64] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6B64]"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-11 pr-11 bg-[#242424] border border-[#2F2F2F] rounded-xl text-sm text-[#F5EDDC] placeholder-[#6E6B64] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6B64] hover:text-[#A8A49B] transition-colors"
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
                className="w-full gap-2 shadow-md cursor-pointer"
              >
                <LogIn size={18} />
                <span>{isLoading ? "Memeriksa Akun..." : "Masuk ke Dashboard"}</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#6E6B64]">
          Akses terbatas hanya untuk 3 pengelola administrasi Era Waluyo Purwokerto
        </p>
      </div>
    </div>
  );
}
