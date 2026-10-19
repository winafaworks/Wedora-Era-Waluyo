import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AD5C] focus:ring-offset-2 focus:ring-offset-[#111111] disabled:opacity-40 disabled:cursor-not-allowed";

    const sizeStyles = {
      sm: "h-9 px-4 text-xs tracking-wider",
      md: "h-11 px-6 text-sm tracking-wide",
      lg: "h-12 px-8 text-base tracking-wide",
    };

    const variantStyles = {
      primary:
        "bg-[#D4AD5C] text-[#111111] hover:bg-[#E3C27D] active:bg-[#B8923F] shadow-sm",
      secondary:
        "border border-[#D4AD5C] text-[#D4AD5C] bg-transparent hover:bg-[rgba(212,173,92,0.14)] active:bg-[rgba(212,173,92,0.25)]",
      outline:
        "border border-[#2F2F2F] text-[#F5EDDC] bg-[#1A1A1A] hover:bg-[#242424] hover:border-[#444444]",
      danger:
        "border border-[#E07A6E] text-[#E07A6E] bg-transparent hover:bg-[rgba(224,122,110,0.14)]",
      ghost:
        "text-[#A8A49B] hover:text-[#F5EDDC] hover:bg-[#242424] bg-transparent",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
