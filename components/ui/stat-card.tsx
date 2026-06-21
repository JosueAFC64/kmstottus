import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "green" | "orange" | "blue" | "gray";
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  color = "green",
}: StatCardProps) {
  const colorStyles = {
    green: "bg-green-50 text-[#1a472a]",
    orange: "bg-orange-50 text-[#f7941d]",
    blue: "bg-blue-50 text-[#00b4d8]",
    gray: "bg-gray-50 text-[#868e96]",
  };

  return (
    <div className="bg-white rounded-xl border border-[#dee2e6] p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#868e96] mb-1">{title}</p>
          <p className="text-3xl font-bold text-[#212529] mb-1">{value}</p>
          {description && (
            <p className="text-sm text-[#adb5bd]">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-[#1a472a]" : "text-[#dc3545]"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-[#adb5bd] ml-1">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}