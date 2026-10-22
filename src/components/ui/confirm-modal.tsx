"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, Info, X } from "lucide-react";
import { Button } from "./button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: <Trash2 size={22} className="text-[#B13C30]" />,
      bg: "bg-[rgba(177,60,48,0.14)] border border-[rgba(177,60,48,0.25)]",
      confirmBtn: "bg-[#B13C30] hover:bg-[#922F24] text-white shadow-sm font-semibold",
    },
    warning: {
      icon: <AlertTriangle size={22} className="text-[#EEB100]" />,
      bg: "bg-[rgba(238,177,0,0.16)] border border-[rgba(238,177,0,0.3)]",
      confirmBtn: "bg-[#EEB100] hover:bg-[#D4AD5C] text-[#1A1A1A] shadow-sm font-semibold",
    },
    info: {
      icon: <Info size={22} className="text-[#2E5F8A] dark:text-[#93C5FD]" />,
      bg: "bg-[rgba(46,95,138,0.14)] border border-[rgba(46,95,138,0.25)]",
      confirmBtn: "bg-[#2E5F8A] hover:bg-[#23496B] text-white shadow-sm font-semibold",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${iconConfig.bg}`}>
              {iconConfig.icon}
            </div>
            <div>
              <h3 className="font-sans text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                {title}
              </h3>
              <p className="text-xs text-[#8A857B] mt-0.5">Konfirmasi Tindakan</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A857B] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] hover:bg-[#FAF6ED] dark:hover:bg-[#282828] transition-colors cursor-pointer"
            title="Batal / Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-[#5E5A52] dark:text-[#C7C2B6] leading-relaxed bg-[#FAF8F3] dark:bg-[#252525] p-3.5 rounded-xl border border-[#EFE8D8] dark:border-[#332F28]">
          {description}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs px-4 h-9"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs px-5 h-9 ${iconConfig.confirmBtn}`}
          >
            {isLoading ? "Memproses..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
