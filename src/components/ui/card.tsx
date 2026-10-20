import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E5DEC9] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, className = "" }: StatCardProps) {
  const valueStr = String(value);
  // Ukuran teks adaptif agar teks nominal panjang (contoh: Rp20.500.000) tidak bertabrakan antar card
  const textSizeClass =
    valueStr.length > 13
      ? "text-xl sm:text-2xl lg:text-[22px] xl:text-2xl"
      : valueStr.length > 9
      ? "text-2xl sm:text-3xl lg:text-[26px] xl:text-3xl"
      : "text-3xl sm:text-4xl";

  return (
    <Card className={`flex flex-col justify-between transition-all duration-200 hover:border-[#D4AD5C] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] min-w-0 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[#5E5A52] truncate" title={title}>
          {title}
        </span>
        {icon && <div className="text-[#A67C24] opacity-90 shrink-0">{icon}</div>}
      </div>
      <div className="mt-4 min-w-0">
        <div
          className={`${textSizeClass} font-sans font-bold text-[#A67C24] tracking-tight truncate`}
          title={valueStr}
        >
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-[#8A857B] line-clamp-1" title={subtitle}>
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
