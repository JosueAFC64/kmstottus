"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#1a472a] text-white hover:bg-[#0f2d1a] focus:ring-[#1a472a]",
    secondary: "bg-[#f7941d] text-white hover:bg-[#e8851a] focus:ring-[#f7941d]",
    outline: "border-2 border-[#1a472a] text-[#1a472a] hover:bg-[#1a472a] hover:text-white focus:ring-[#1a472a]",
    ghost: "text-[#495057] hover:bg-[#f1f3f5] focus:ring-[#1a472a]",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}