import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-[#1A1A1A] border border-[#2F2F2F] rounded-2xl p-6 ${className}`}
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
    <Card className="flex flex-col justify-between transition-all duration-200 hover:border-[#444444]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#A8A49B]">{title}</span>
        {icon && <div className="text-[#D4AD5C] opacity-80">{icon}</div>}
      </div>
      <div className="mt-4">
        <div className="text-4xl font-serif text-[#D4AD5C] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-[#6E6B64]">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
