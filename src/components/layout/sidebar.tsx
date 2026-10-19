"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#1A1A1A] border-b border-[#2F2F2F] sticky top-0 z-40">
        <div>
          <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#D4AD5C]">
            WEDORA
          </span>
          <span className="block text-[10px] tracking-[0.25em] text-[#A8A49B] font-medium uppercase">
            Era Waluyo
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-[#F5EDDC] bg-[#242424] hover:bg-[#2E2E2E]"
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1A1A1A] border-r border-[#2F2F2F] flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="mb-8 pt-2">
            <Link
              href="/dashboard"
              className="block group"
              onClick={() => setIsOpen(false)}
            >
              <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-[#D4AD5C] group-hover:text-[#E3C27D] transition-colors">
                WEDORA
              </h1>
              <p className="text-[11px] font-medium tracking-[0.25em] text-[#A8A49B] uppercase mt-1">
                Era Waluyo
              </p>
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
                      ? "bg-[rgba(212,173,92,0.14)] text-[#D4AD5C] font-semibold"
                      : "text-[#A8A49B] hover:text-[#F5EDDC] hover:bg-[#242424]"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-[#D4AD5C]" : "text-[#A8A49B]"}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Tombol Keluar */}
        <div className="pt-6 border-t border-[#2F2F2F]">
          <Button
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
                router.push("/dashboard");
              }
            }}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
