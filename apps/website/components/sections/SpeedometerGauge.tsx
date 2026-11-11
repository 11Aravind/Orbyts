'use client';

import React, { useState } from 'react';

type GaugeMode = 'software' | 'ai' | 'security' | 'development';

interface ModeConfig {
  angle: number;
  label: string;
  metric1: { value: string; label: string };
  metric2: { value: string; label: string };
}

const MODES: Record<GaugeMode, ModeConfig> = {
  software: {
    angle: 0,
    label: 'Engineered for Performance',
    metric1: { value: '92.4%', label: 'Compute Efficiency' },
    metric2: { value: '< 250ms', label: 'Average Response' },
  },
  ai: {
    angle: 42,
    label: 'Agent-Accelerated Workflows',
    metric1: { value: '10x', label: 'Iteration Velocity' },
    metric2: { value: '99.98%', label: 'Context Accuracy' },
  },
  security: {
    angle: -45,
    label: 'Defensive Architecture',
    metric1: { value: 'Zero', label: 'False Positives' },
    metric2: { value: '100%', label: 'OWASP Coverage' },
  },
  development: {
    angle: 25,
    label: 'Rapid Scalable Foundations',
    metric1: { value: '4x', label: 'Release Cadence' },
    metric2: { value: '0', label: 'Debt Backlog' },
  },
};

export default function SpeedometerGauge({
  activeMode,
  onModeChange,
}: {
  activeMode: GaugeMode;
  onModeChange: (mode: GaugeMode) => void;
}) {
  const current = MODES[activeMode];

  return (
    <div className="relative w-full max-w-[500px] aspect-[24/17] select-none group">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
        viewBox="0 0 480 340"
      >
        <defs>
          <linearGradient
            id="remote-cache-gauge-gradient"
            gradientUnits="userSpaceOnUse"
            x1="46.4"
            x2="433.6"
            y1="310.5"
            y2="310.5"
          >
            <stop offset="0" stopColor="#0196FF" />
            <stop offset="1" stopColor="#FF1E56" />
          </linearGradient>
          <linearGradient
            id="remote-cache-gauge-inner-gradient"
            gradientUnits="userSpaceOnUse"
            x1="46.4"
            x2="433.6"
            y1="310.5"
            y2="310.5"
          >
            <stop offset="0" stopColor="#52C7FF" />
            <stop offset="1" stopColor="#FF1E56" />
          </linearGradient>
          <filter id="needle-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0"
            />
          </filter>
        </defs>

        {/* Gauge Background Track */}
        <path
          d="M46.4 310.5a206 206 0 1 1 387.2 0"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Colored Gradient Active Arc */}
        <path
          d="M46.4 310.5a206 206 0 1 1 387.2 0"
          fill="none"
          stroke="url(#remote-cache-gauge-gradient)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray="500"
          strokeDashoffset="120"
          className="opacity-75"
        />

        {/* Center Rotating Needle */}
        <g
          style={{
            transformOrigin: '240px 240px',
            transform: `rotate(${current.angle}deg)`,
            transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Needle Pointer */}
          <line
            x1="240"
            y1="240"
            x2="240"
            y2="75"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Inner Accent Line */}
          <line
            x1="240"
            y1="240"
            x2="240"
            y2="105"
            stroke="#00f0ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Needle Center Pin */}
          <circle cx="240" cy="240" r="14" fill="#121215" stroke="#ffffff" strokeWidth="2" />
          <circle cx="240" cy="240" r="5" fill="#00f0ff" />
        </g>
      </svg>

      {/* Floating Center Stats Overlay */}
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center text-center">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
          {current.label}
        </span>
        <div className="mt-2 flex items-center gap-6">
          <div>
            <div className="text-xl font-bold font-mono text-white">{current.metric1.value}</div>
            <div className="text-[11px] text-neutral-400">{current.metric1.label}</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-xl font-bold font-mono text-emerald-400">{current.metric2.value}</div>
            <div className="text-[11px] text-neutral-400">{current.metric2.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

