import React, { Suspense } from "react";
import { getDashboardStats, getBookings } from "@/lib/actions/booking";
import DashboardClient from "./dashboard-client";

async function DashboardLoader() {
  const [stats, bookings] = await Promise.all([
    getDashboardStats(),
    getBookings(),
  ]);

  const upcomingBookings = bookings.slice(0, 5);
  return <DashboardClient stats={stats} upcomingBookings={upcomingBookings} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#A8A49B]">
          Memuat ringkasan dashboard...
        </div>
      }
    >
      <DashboardLoader />
    </Suspense>
  );
}
