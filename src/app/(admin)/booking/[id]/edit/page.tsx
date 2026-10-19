import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBookingById, getPackages } from "@/lib/actions/booking";
import EditBookingClient from "./edit-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EditBookingContent({ params }: PageProps) {
  const { id } = await params;
  const [booking, packages] = await Promise.all([
    getBookingById(id),
    getPackages(),
  ]);

  if (!booking) {
    notFound();
  }

  return <EditBookingClient booking={booking} packages={packages} />;
}

export default function EditBookingPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#A8A49B]">
          Memuat data pesanan...
        </div>
      }
    >
      <EditBookingContent params={params} />
    </Suspense>
  );
}
