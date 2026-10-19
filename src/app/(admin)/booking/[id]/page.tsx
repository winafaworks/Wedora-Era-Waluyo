import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBookingById } from "@/lib/actions/booking";
import BookingDetailClient from "./booking-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function BookingDetailContent({ params }: PageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  return <BookingDetailClient booking={booking} appUrl={appUrl} />;
}

export default function BookingDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#A8A49B]">
          Memuat rincian pesanan...
        </div>
      }
    >
      <BookingDetailContent params={params} />
    </Suspense>
  );
}
