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
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Card className="flex flex-col justify-between transition-all duration-200 hover:border-[#D4AD5C] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#5E5A52]">{title}</span>
        {icon && <div className="text-[#A67C24] opacity-90">{icon}</div>}
      </div>
      <div className="mt-4">
        <div className="text-4xl font-sans font-bold text-[#A67C24] tracking-tight tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-[#8A857B]">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
