import React from "react";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-[#1a472a]",
    "bg-[#f7941d]",
    "bg-[#00b4d8]",
    "bg-[#6c757d]",
    "bg-[#6610f2]",
    "bg-[#e83e8c]",
    "bg-[#fd7e14]",
    "bg-[#20c997]",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({ name, size = "md", src }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${getColorFromName(name)} rounded-full flex items-center justify-center text-white font-medium`}
    >
      {getInitials(name)}
    </div>
  );
}