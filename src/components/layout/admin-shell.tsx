"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { Sidebar } from "./sidebar";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#FBF7EC] text-[#1A1A1A] flex flex-col lg:flex-row">
      <Sidebar />
      <main
        className={`flex-1 min-h-screen flex flex-col bg-[#FBF7EC] transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <div className="max-w-[1400px] w-full mx-auto p-6 md:p-10 flex-1 transition-all duration-300">
          {children}
        </div>
      </main>
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
