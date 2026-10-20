import React, { Suspense } from "react";
import { getBookings } from "@/lib/actions/booking";
import KalenderClient, { BookingCalendarItem } from "./kalender-client";

export const instant = false;

export const metadata = {
  title: "Kalender Booking | WEDORA Era Waluyo",
  description: "Pantau ketersediaan tanggal dan jadwal acara pernikahan Era Waluyo",
};

async function KalenderLoader() {
  const bookings = await getBookings();
  return <KalenderClient bookings={bookings as BookingCalendarItem[]} />;
}

export default function KalenderPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#A8A49B]">
          Memuat jadwal kalender booking...
        </div>
      }
    >
      <KalenderLoader />
    </Suspense>
  );
}
