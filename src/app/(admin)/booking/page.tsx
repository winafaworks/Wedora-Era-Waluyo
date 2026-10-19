import React, { Suspense } from "react";
import { getBookings } from "@/lib/actions/booking";
import BookingListClient from "./booking-list-client";

async function BookingListLoader() {
  const bookings = await getBookings();
  return <BookingListClient initialBookings={bookings} />;
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#A8A49B]">
          Memuat data booking...
        </div>
      }
    >
      <BookingListLoader />
    </Suspense>
  );
}
