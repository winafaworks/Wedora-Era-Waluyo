"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { IdleSessionTimeout } from "@/components/auth/idle-session-timeout";
import { TourGuide } from "./tour-guide";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#FBF7EC] dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-[#F5EDDC] flex flex-col lg:flex-row">
      <IdleSessionTimeout />
      <TourGuide />
      <React.Suspense fallback={null}>
        <Sidebar />
      </React.Suspense>
      <div
        className={`flex-1 min-h-screen flex flex-col bg-[#FBF7EC] dark:bg-[#1E1E1E] transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <React.Suspense fallback={null}>
          <Topbar />
        </React.Suspense>
        <main className="max-w-[1400px] w-full mx-auto p-6 md:p-10 flex-1 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
