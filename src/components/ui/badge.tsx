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
      bg: "bg-[rgba(212,173,92,0.18)] dark:bg-[rgba(212,173,92,0.14)]",
      text: "text-[#8A6A22] dark:text-[#EEB100]",
      dot: "bg-[#8A6A22] dark:bg-[#EEB100]",
    },
    dikonfirmasi: {
      defaultLabel: "Dikonfirmasi",
      bg: "bg-[rgba(127,211,155,0.22)] dark:bg-[rgba(47,122,75,0.25)]",
      text: "text-[#2F7A4B] dark:text-[#7FD39B]",
      dot: "bg-[#2F7A4B] dark:bg-[#7FD39B]",
    },
    perlu_koreksi: {
      defaultLabel: "Perlu Koreksi",
      bg: "bg-[rgba(232,162,95,0.22)] dark:bg-[rgba(165,96,28,0.25)]",
      text: "text-[#A5601C] dark:text-[#FFA940]",
      dot: "bg-[#A5601C] dark:bg-[#FFA940]",
    },
    dibatalkan: {
      defaultLabel: "Dibatalkan",
      bg: "bg-[rgba(224,122,110,0.22)] dark:bg-[rgba(177,60,48,0.25)]",
      text: "text-[#B13C30] dark:text-[#FFA39E]",
      dot: "bg-[#B13C30] dark:bg-[#FFA39E]",
    },
    danger: {
      defaultLabel: "Peringatan",
      bg: "bg-[rgba(224,122,110,0.22)] dark:bg-[rgba(177,60,48,0.25)]",
      text: "text-[#B13C30] dark:text-[#FFA39E]",
      dot: "bg-[#B13C30] dark:bg-[#FFA39E]",
    },
    info: {
      defaultLabel: "Info",
      bg: "bg-[rgba(141,180,217,0.22)] dark:bg-[rgba(46,95,138,0.25)]",
      text: "text-[#2E5F8A] dark:text-[#8DB4D9]",
      dot: "bg-[#2E5F8A] dark:bg-[#8DB4D9]",
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
