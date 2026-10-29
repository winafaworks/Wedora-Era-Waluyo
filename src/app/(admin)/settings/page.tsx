import React, { Suspense } from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import SettingsClient from "./settings-client";
import { getAccountSecurityDetails } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Pengaturan Sistem | WEDORA Era Waluyo",
  description:
    "Pengaturan tema antarmuka (mode terang & gelap), template pesan WhatsApp, log aktivitas operasional & login, serta keamanan akun administrator WEDORA.",
};

async function SettingsLoader() {
  await connection();
  const securityDetails = await getAccountSecurityDetails();
  return <SettingsClient initialSecurityDetails={securityDetails} />;
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#A8A49B]">
          Memuat pengaturan sistem...
        </div>
      }
    >
      <SettingsLoader />
    </Suspense>
  );
}
