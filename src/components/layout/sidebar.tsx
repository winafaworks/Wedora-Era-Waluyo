"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Shirt,
  CheckSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Kalender Booking",
    href: "/kalender",
    icon: Calendar,
  },
  {
    name: "Data Booking",
    href: "/booking",
    icon: ClipboardList,
  },
  {
    name: "Katalog",
    href: "/katalog",
    icon: Shirt,
  },
  {
    name: "Checklist Acara",
    href: "/checklist",
    icon: CheckSquare,
  },
  {
    name: "Rekap Booking",
    href: "/rekap",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#2C2C2C] border-b border-[#3E3E3E] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Image
            src="/logo_erawaluyo.jpeg"
            alt="Logo Era Waluyo"
            width={34}
            height={34}
            className="w-8 h-8 rounded-full object-cover border border-[#D4AD5C]/50 shrink-0"
          />
          <div>
            <span className="font-brand-logo text-lg font-bold tracking-[0.12em] text-[#D4AD5C] block leading-tight">
              ERA WALUYO
            </span>
            <span className="block text-[9px] tracking-[0.25em] text-[#B8B3A8] font-medium uppercase">
              Wedora
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-[#F5EDDC] bg-[#383838] hover:bg-[#444444]"
          aria-label="Menu navigasi"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#2C2C2C] border-r border-[#3E3E3E] flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="mb-8 pt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3.5 group"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/logo_erawaluyo.jpeg"
                alt="Logo Era Waluyo"
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover border border-[#D4AD5C]/50 shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <h1 className="font-brand-logo text-xl font-bold tracking-[0.12em] text-[#D4AD5C] group-hover:text-[#E3C27D] transition-colors leading-tight truncate">
                  ERA WALUYO
                </h1>
                <p className="text-[10px] font-medium tracking-[0.25em] text-[#B8B3A8] uppercase mt-0.5">
                  Wedora
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 h-12 px-4 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[rgba(212,173,92,0.16)] text-[#D4AD5C] font-semibold"
                      : "text-[#B8B3A8] hover:text-[#F5EDDC] hover:bg-[#383838]"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-[#D4AD5C]" : "text-[#B8B3A8]"}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Tombol Keluar */}
        <div className="pt-6 border-t border-[#3E3E3E]">
          <button
            className="w-full flex items-center justify-center gap-2 h-11 rounded-full border border-[#D4AD5C]/30 text-[#D4AD5C] bg-[#383838] hover:bg-[#444444] hover:border-[#D4AD5C] font-semibold text-sm transition-colors cursor-pointer"
            onClick={async () => {
              if (confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
                await logout();
              }
            }}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
