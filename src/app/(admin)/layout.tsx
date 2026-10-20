import React, { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#2C2C2C] text-[#F5EDDC] flex flex-col lg:flex-row">
      <Suspense fallback={<div className="w-72 bg-[#363636] hidden lg:block" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto p-6 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
