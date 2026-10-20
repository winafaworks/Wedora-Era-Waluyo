import React from "react";
import { BookingStatus } from "@/types";

export interface BadgeProps {
  status: BookingStatus | "info" | "danger";
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: BadgeProps) {
  const configs: Record<
    string,
    { defaultLabel: string; bg: string; text: string; dot: string }
  > = {
    belum_dikonfirmasi: {
      defaultLabel: "Belum Dikonfirmasi",
      bg: "bg-[rgba(212,173,92,0.18)]",
      text: "text-[#8A6A22]",
      dot: "bg-[#8A6A22]",
    },
    dikonfirmasi: {
      defaultLabel: "Dikonfirmasi",
      bg: "bg-[rgba(127,211,155,0.22)]",
      text: "text-[#2F7A4B]",
      dot: "bg-[#2F7A4B]",
    },
    perlu_koreksi: {
      defaultLabel: "Perlu Koreksi",
      bg: "bg-[rgba(232,162,95,0.22)]",
      text: "text-[#A5601C]",
      dot: "bg-[#A5601C]",
    },
    dibatalkan: {
      defaultLabel: "Dibatalkan",
      bg: "bg-[rgba(224,122,110,0.22)]",
      text: "text-[#B13C30]",
      dot: "bg-[#B13C30]",
    },
    danger: {
      defaultLabel: "Peringatan",
      bg: "bg-[rgba(224,122,110,0.22)]",
      text: "text-[#B13C30]",
      dot: "bg-[#B13C30]",
    },
    info: {
      defaultLabel: "Info",
      bg: "bg-[rgba(141,180,217,0.22)]",
      text: "text-[#2E5F8A]",
      dot: "bg-[#2E5F8A]",
    },
  };

  const config = configs[status] || configs.belum_dikonfirmasi;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
}
