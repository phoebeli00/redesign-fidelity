import React from 'react';

export const FidelityIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Fidelity Logo"
    >
      <circle cx="50" cy="50" r="48" fill="#1b873f" />
      {/* Radiant sunburst rays of Fidelity emblem */}
      <g stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round">
        <line x1="50" y1="14" x2="50" y2="40" />
        <line x1="50" y1="86" x2="50" y2="60" />
        <line x1="14" y1="50" x2="40" y2="50" />
        <line x1="86" y1="50" x2="60" y2="50" />

        <line x1="24.5" y1="24.5" x2="42.8" y2="42.8" />
        <line x1="75.5" y1="75.5" x2="57.2" y2="57.2" />
        <line x1="24.5" y1="75.5" x2="42.8" y2="57.2" />
        <line x1="75.5" y1="24.5" x2="57.2" y2="42.8" />

        <line x1="36" y1="18" x2="45" y2="39" />
        <line x1="64" y1="18" x2="55" y2="39" />
        <line x1="36" y1="82" x2="45" y2="61" />
        <line x1="64" y1="82" x2="55" y2="61" />

        <line x1="18" y1="36" x2="39" y2="45" />
        <line x1="18" y1="64" x2="39" y2="55" />
        <line x1="82" y1="36" x2="61" y2="45" />
        <line x1="82" y1="64" x2="61" y2="55" />
      </g>
      <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
    </svg>
  );
};
