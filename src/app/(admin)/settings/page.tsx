import React from "react";
import { Metadata } from "next";
import SettingsClient from "./settings-client";

export const metadata: Metadata = {
  title: "Pengaturan Sistem | WEDORA Era Waluyo",
  description:
    "Pengaturan tema antarmuka (mode terang & gelap), profil usaha, dan konfigurasi sistem manajemen pernikahan WEDORA.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
