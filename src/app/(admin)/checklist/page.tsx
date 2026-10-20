import React, { Suspense } from "react";
import { getChecklistBookings, getChecklistItems } from "@/lib/actions/checklist";
import ChecklistClient from "./checklist-client";

export const instant = false;

export const metadata = {
  title: "Checklist Acara | WEDORA Era Waluyo",
  description:
    "Pantau status barang dimuat dan kembali untuk mencegah barang tertinggal pada acara pernikahan Era Waluyo Purwokerto",
};

async function ChecklistLoader() {
  const bookings = await getChecklistBookings();
  const initialBookingId = bookings.length > 0 ? bookings[0].id : null;
  const initialItems = initialBookingId ? await getChecklistItems(initialBookingId) : [];

  return (
    <ChecklistClient
      bookings={bookings}
      initialItems={initialItems}
      initialSelectedBookingId={initialBookingId}
    />
  );
}

export default function ChecklistPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#8A857B] text-sm">
          Memuat data checklist acara...
        </div>
      }
    >
      <ChecklistLoader />
    </Suspense>
  );
}
