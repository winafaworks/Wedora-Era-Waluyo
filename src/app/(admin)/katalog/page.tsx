import React, { Suspense } from "react";
import { getCatalogItems, CatalogItem } from "@/lib/actions/catalog";
import KatalogClient from "./katalog-client";

export const instant = false;

export const metadata = {
  title: "Katalog Busana & Dekorasi | WEDORA Era Waluyo",
  description: "Koleksi kebaya, beskap adat, ukuran, dekorasi, dan layanan vendor Era Waluyo",
};

async function KatalogLoader() {
  const items = await getCatalogItems();
  return <KatalogClient initialItems={items as CatalogItem[]} />;
}

export default function KatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#A8A49B]">
          Memuat data katalog...
        </div>
      }
    >
      <KatalogLoader />
    </Suspense>
  );
}
