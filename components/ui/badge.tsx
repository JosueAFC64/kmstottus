import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-[#e9ecef] text-[#495057]",
    success: "bg-[#d4edda] text-[#155724]",
    warning: "bg-[#fff3cd] text-[#856404]",
    error: "bg-[#f8d7da] text-[#721c24]",
    info: "bg-[#d1ecf1] text-[#0c5460]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}