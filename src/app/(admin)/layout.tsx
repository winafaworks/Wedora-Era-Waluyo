import React from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#111111] text-[#F5EDDC] flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto p-6 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
