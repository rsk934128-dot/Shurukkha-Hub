"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'accent' | 'white';
}

export function AppLogo({ className, size, variant = 'default' }: AppLogoProps) {
  const colors = {
    default: "text-primary",
    accent: "text-accent",
    white: "text-white"
  }

  // If size is provided as a number, we use it for absolute pixel sizing
  const style = size ? { width: size, height: size } : {};

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={style}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${colors[variant]}`}
      >
        {/* Shield Outer Frame - Heavy Imperial Border */}
        <path
          d="M50 5L15 20V45C15 70 50 95 50 95C50 95 85 70 85 45V20L50 5Z"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-20"
        />
        
        {/* Main Sovereign Shield - Core ID */}
        <path
          d="M50 12L22 25V48C22 68 50 88 50 88C50 88 78 68 78 48V25L50 12Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="4"
        />

        {/* River Jamuna Waves - Sirajganj Essence */}
        <path
          d="M30 55C35 50 40 60 45 55C50 50 55 60 60 55C65 50 70 60 75 55"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-pulse"
        />
        <path
          d="M35 63C38 60 42 66 45 63C48 60 52 66 55 63C58 60 62 66 65 63"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-40"
        />

        {/* AI Hub Center Point - Intelligence Node */}
        <circle cx="50" cy="35" r="7" fill="currentColor" className="animate-pulse">
          <animate
            attributeName="opacity"
            values="1;0.4;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Circuit Connectors - Global Grid */}
        <path
          d="M50 35V18M50 35L65 26M50 35L35 26M50 35L50 50"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-80"
        />
      </svg>
      
      {/* Imperial Glow Effect */}
      <div className="absolute inset-0 bg-current rounded-full blur-3xl opacity-[0.08] animate-sos-pulse pointer-events-none" />
    </div>
  )
}
