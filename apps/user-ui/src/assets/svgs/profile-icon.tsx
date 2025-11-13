import React from "react";

export const ProfileIcon = ({
  size = 24,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth="2"
    width={size}
    height={size}
  >
    {/* Larger head */}
    <circle cx="32" cy="22" r="12" fill="#fff" />

    {/* Broader shoulders */}
    <path
      d="M12 48c0-8.837 7.163-16 16-16h8c8.837 0 16 7.163 16 16v4H12v-4z"
      fill="#fff"
    />
  </svg>
);
