import React, { Suspense } from "react";
import {
  getChecklistBookings,
  getChecklistItems,
  getChecklistPackages,
} from "@/lib/actions/checklist";
import ChecklistClient from "./checklist-client";

export const instant = false;

export const metadata = {
  title: "Checklist Acara | WEDORA Era Waluyo",
  description:
    "Pantau status barang dimuat dan kembali untuk mencegah barang tertinggal pada acara pernikahan Era Waluyo Purwokerto",
};

async function ChecklistLoader({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [bookings, initialPackages] = await Promise.all([
    getChecklistBookings(),
    getChecklistPackages(),
  ]);
  const matchedBooking = resolvedSearchParams?.bookingId
    ? bookings.find((b) => b.id === resolvedSearchParams.bookingId)
    : null;
  const initialBookingId = matchedBooking
    ? matchedBooking.id
    : bookings.length > 0
    ? bookings[0].id
    : null;
  const initialItems = initialBookingId ? await getChecklistItems(initialBookingId) : [];

  return (
    <ChecklistClient
      key={initialBookingId || "empty"}
      bookings={bookings}
      initialItems={initialItems}
      initialSelectedBookingId={initialBookingId}
      initialPackages={initialPackages}
    />
  );
}

export default async function ChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#8A857B] text-sm">
          Memuat data checklist acara...
        </div>
      }
    >
      <ChecklistLoader searchParams={searchParams} />
    </Suspense>
  );
}
