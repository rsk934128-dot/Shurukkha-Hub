
"use client"

import React from 'react'

interface AppLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'accent' | 'white';
}

export function AppLogo({ className, size = 40, variant = 'default' }: AppLogoProps) {
  const colors = {
    default: "text-primary",
    accent: "text-accent",
    white: "text-white"
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${colors[variant]}`}
      >
        {/* Shield Outer Frame */}
        <path
          d="M50 5L15 20V45C15 70 50 95 50 95C50 95 85 70 85 45V20L50 5Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-20"
        />
        
        {/* Main Sovereign Shield */}
        <path
          d="M50 12L22 25V48C22 68 50 88 50 88C50 88 78 68 78 48V25L50 12Z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="4"
        />

        {/* River Jamuna Waves */}
        <path
          d="M35 50C40 45 45 55 50 50C55 45 60 55 65 50"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-pulse"
        />
        <path
          d="M38 58C42 54 46 62 50 58C54 54 58 62 62 58"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-60"
        />

        {/* AI Hub Center Point */}
        <circle cx="50" cy="35" r="5" fill="currentColor">
          <animate
            attributeName="r"
            values="4;6;4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Circuit Connectors */}
        <path
          d="M50 35V20M50 35L62 28M50 35L38 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-current rounded-full blur-2xl opacity-10 animate-pulse pointer-events-none" />
    </div>
  )
}
