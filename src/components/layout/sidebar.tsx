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
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { useSidebar } from "./sidebar-context";

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
  const { isCollapsed, toggleSidebar } = useSidebar();

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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#2C2C2C] border-r border-[#3E3E3E] flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20 p-3.5" : "lg:w-72 p-6"}`}
      >
        {/* Toggle Collapse Button (Desktop Only) */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3.5 top-8 z-50 w-7 h-7 bg-[#2C2C2C] border border-[#D4AD5C]/50 hover:border-[#EEB100] text-[#EEB100] hover:bg-[#383838] rounded-full items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer"
          title={isCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
          aria-label={isCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        <div className="flex-1 flex flex-col justify-between min-h-0">
          <div>
            {/* Logo Brand */}
            <div className={`mb-8 pt-2 flex ${isCollapsed ? "justify-center" : "items-center"}`}>
              <Link
                href="/dashboard"
                className={`flex items-center group ${isCollapsed ? "justify-center" : "gap-3.5"}`}
                onClick={() => setIsOpen(false)}
                title="ERA WALUYO — Wedora"
              >
                <Image
                  src="/logo_erawaluyo.jpeg"
                  alt="Logo Era Waluyo"
                  width={44}
                  height={44}
                  className={`${isCollapsed ? "w-10 h-10" : "w-11 h-11"} rounded-full object-cover border border-[#D4AD5C]/50 shadow-sm shrink-0 transition-all duration-300`}
                />
                {!isCollapsed && (
                  <div className="min-w-0 transition-opacity duration-200">
                    <h1 className="font-brand-logo text-xl font-bold tracking-[0.12em] text-[#D4AD5C] group-hover:text-[#E3C27D] transition-colors leading-tight truncate">
                      ERA WALUYO
                    </h1>
                    <p className="text-[10px] font-medium tracking-[0.25em] text-[#B8B3A8] uppercase mt-0.5">
                      Wedora
                    </p>
                  </div>
                )}
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
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center h-12 rounded-xl text-sm transition-all duration-200 ${
                      isCollapsed ? "justify-center px-0 w-full" : "px-4 gap-3.5"
                    } ${
                      isActive
                        ? "bg-[rgba(212,173,92,0.16)] text-[#EEB100] font-semibold"
                        : "text-[#B8B3A8] hover:text-[#F5EDDC] hover:bg-[#383838]"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`${isActive ? "text-[#EEB100]" : "text-[#B8B3A8]"} shrink-0`}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Menu Pengaturan di Posisi Paling Bawah, Mepet Batas Garis */}
          <div className="pt-2 mb-2">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? "Pengaturan" : undefined}
              className={`flex items-center h-12 rounded-xl text-sm transition-all duration-200 ${
                isCollapsed ? "justify-center px-0 w-full" : "px-4 gap-3.5"
              } ${
                pathname.startsWith("/settings")
                  ? "bg-[rgba(212,173,92,0.16)] text-[#EEB100] font-semibold"
                  : "text-[#B8B3A8] hover:text-[#F5EDDC] hover:bg-[#383838]"
              }`}
            >
              <Settings
                size={20}
                className={`${
                  pathname.startsWith("/settings") ? "text-[#EEB100]" : "text-[#B8B3A8]"
                } shrink-0`}
              />
              {!isCollapsed && <span className="truncate">Pengaturan</span>}
            </Link>
          </div>
        </div>

        {/* Footer / Tombol Keluar */}
        <div className="pt-4 border-t border-[#3E3E3E]">
          <button
            className={`w-full flex items-center justify-center h-11 rounded-full border border-[#D4AD5C]/30 text-[#D4AD5C] hover:text-[#EEB100] bg-[#383838] hover:bg-[#444444] hover:border-[#EEB100] font-semibold text-sm transition-all cursor-pointer ${
              isCollapsed ? "px-0" : "gap-2"
            }`}
            title={isCollapsed ? "Keluar dari sesi admin" : undefined}
            onClick={async () => {
              if (confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
                await logout();
              }
            }}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
