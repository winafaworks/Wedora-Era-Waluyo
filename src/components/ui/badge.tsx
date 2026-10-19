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
      bg: "bg-[rgba(212,173,92,0.14)]",
      text: "text-[#D4AD5C]",
      dot: "bg-[#D4AD5C]",
    },
    dikonfirmasi: {
      defaultLabel: "Dikonfirmasi",
      bg: "bg-[rgba(127,211,155,0.14)]",
      text: "text-[#7FD39B]",
      dot: "bg-[#7FD39B]",
    },
    perlu_koreksi: {
      defaultLabel: "Perlu Koreksi",
      bg: "bg-[rgba(232,162,95,0.14)]",
      text: "text-[#E8A25F]",
      dot: "bg-[#E8A25F]",
    },
    dibatalkan: {
      defaultLabel: "Dibatalkan",
      bg: "bg-[rgba(224,122,110,0.14)]",
      text: "text-[#E07A6E]",
      dot: "bg-[#E07A6E]",
    },
    danger: {
      defaultLabel: "Peringatan",
      bg: "bg-[rgba(224,122,110,0.14)]",
      text: "text-[#E07A6E]",
      dot: "bg-[#E07A6E]",
    },
    info: {
      defaultLabel: "Info",
      bg: "bg-[rgba(141,180,217,0.14)]",
      text: "text-[#8DB4D9]",
      dot: "bg-[#8DB4D9]",
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
