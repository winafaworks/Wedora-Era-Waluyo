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
      "inline-flex items-center justify-center font-semibold rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EEB100] focus:ring-offset-2 focus:ring-offset-[#FBF7EC] disabled:opacity-40 disabled:cursor-not-allowed";

    const sizeStyles = {
      sm: "h-9 px-4 text-xs tracking-wider",
      md: "h-11 px-6 text-sm tracking-wide",
      lg: "h-12 px-8 text-base tracking-wide",
    };

    const variantStyles = {
      primary:
        "bg-[#EEB100] text-[#111111] hover:bg-[#DDA400] active:bg-[#C89400] shadow-sm",
      secondary:
        "border border-[#D4AD5C] text-[#8A6A22] dark:text-[#EEB100] bg-[rgba(212,173,92,0.08)] dark:bg-[rgba(212,173,92,0.12)] hover:bg-[rgba(212,173,92,0.18)] dark:hover:bg-[rgba(212,173,92,0.22)] active:bg-[rgba(212,173,92,0.25)]",
      outline:
        "border border-[#D6CEBE] dark:border-[#3E382E] text-[#1A1A1A] dark:text-[#F5EDDC] bg-[#FFFFFF] dark:bg-[#222222] hover:bg-[#F5EDDC] dark:hover:bg-[#2C2C2C] hover:border-[#B8923F] shadow-2xs",
      danger:
        "border border-[#E07A6E] dark:border-[#B13C30] text-[#B13C30] dark:text-[#FFA39E] bg-transparent hover:bg-[rgba(224,122,110,0.1)] dark:hover:bg-[rgba(177,60,48,0.2)]",
      ghost:
        "text-[#5E5A52] dark:text-[#B8B3A8] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] hover:bg-[#F5EDDC] dark:hover:bg-[#2A2A2A] bg-transparent",
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
