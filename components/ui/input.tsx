"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export function Input({
  label,
  error,
  icon,
  hint,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#495057] mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#868e96]">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 rounded-lg border border-[#dee2e6] bg-white text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent transition-colors ${
            icon ? "pl-10" : ""
          } ${error ? "border-[#dc3545]" : ""} ${className}`}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-sm text-[#868e96]">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-[#dc3545]">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#495057] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 rounded-lg border border-[#dee2e6] bg-white text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent transition-colors resize-none ${error ? "border-[#dc3545]" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-[#dc3545]">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#495057] mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2.5 rounded-lg border border-[#dee2e6] bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent transition-colors ${
          error ? "border-[#dc3545]" : ""
        } ${props.disabled ? "bg-[#f8f9fa] text-[#868e96] cursor-not-allowed" : ""} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-sm text-[#868e96]">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-[#dc3545]">{error}</p>
      )}
    </div>
  );
}