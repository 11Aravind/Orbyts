'use client';

import React, { useState } from 'react';

type SpeedoMode = 'software' | 'ai' | 'security' | 'development';

export default function HeroSection() {
  const [mode, setMode] = useState<SpeedoMode>('software');
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getCommand = (m: SpeedoMode) => {
    switch (m) {
      case 'software':
        return "let't connect";
      case 'ai':
        return 'orbyt ai --stream';
      case 'security':
        return 'orbyt audit --target api';
      case 'development':
        return 'turbo run build --affected';
    }
  };

  const commandText = getCommand(mode);

  const handleCopy = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getRotation = () => {
    let base = 0;
    switch (mode) {
      case 'software':
        base = 0;
        break;
      case 'ai':
        base = 4;
        break;
      case 'security':
        base = 8;
        break;
      case 'development':
        base = 12;
        break;
    }
    // Idle shows Image 1 (0°). Hover revs up and shows Image 2 (36°).
    return isHovered ? 36 : base;
  };

  const needleRotation = getRotation();
  const fillPercent = Math.min(100, Math.max(0, 80.9513 + (needleRotation / 220) * 100));
  const remainPercent = 100 - fillPercent;
  const dashArray = `${fillPercent.toFixed(2)} ${remainPercent.toFixed(2)}`;
  const remainderDashArray = `0 ${fillPercent.toFixed(2)} ${remainPercent.toFixed(2)} 0`;

  return (
    <section className="relative pt-12 pb-24 lg:pt-28 lg:pb-36 overflow-hidden">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-8">
          {/* LEFT COLUMN: Heading, Subtitle, Tabs, Command Pill */}
          <div className="relative z-10 flex flex-col justify-center lg:col-span-7 lg:pr-8 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-neutral-900 dark:text-white tracking-[-0.035em] leading-[1.1] max-w-[720px] whitespace-normal">
              Build smarter, Go further
            </h1>

            <p className="text-[16px] sm:text-[17px] text-neutral-600 dark:text-neutral-400 font-normal leading-[1.6] max-w-[540px]">
              We build powerful software, modern digital experiences and intelligent solutions that help businesses move
              forward.
            </p>

            {/* Mode Selector Tabs: Software | AI | Security | Development */}
            <div className="flex items-center gap-1 pt-1">
              <button
                type="button"
                onClick={() => setMode('software')}
                className={`cursor-pointer px-2.5 py-1 rounded text-[13px] transition-colors ${
                  mode === 'software'
                    ? 'text-neutral-900 dark:text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-normal'
                }`}
              >
                Software
              </button>
              <span className="text-neutral-300 dark:text-neutral-700 select-none">|</span>
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`cursor-pointer px-2.5 py-1 rounded text-[13px] transition-colors ${
                  mode === 'ai'
                    ? 'text-neutral-900 dark:text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-normal'
                }`}
              >
                AI
              </button>
              <span className="text-neutral-300 dark:text-neutral-700 select-none">|</span>
              <button
                type="button"
                onClick={() => setMode('security')}
                className={`cursor-pointer px-2.5 py-1 rounded text-[13px] transition-colors ${
                  mode === 'security'
                    ? 'text-neutral-900 dark:text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-normal'
                }`}
              >
                Security
              </button>
              <span className="text-neutral-300 dark:text-neutral-700 select-none">|</span>
              <button
                type="button"
                onClick={() => setMode('development')}
                className={`cursor-pointer px-2.5 py-1 rounded text-[13px] transition-colors ${
                  mode === 'development'
                    ? 'text-neutral-900 dark:text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-normal'
                }`}
              >
                Development
              </button>
            </div>

            {/* Command Pill Box */}
            <div className="pt-1">
              <div
                onClick={handleCopy}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors cursor-pointer shadow-sm"
              >
                <span className="text-neutral-500 font-mono text-xs select-none">$</span>
                <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all">{commandText}</span>
                {copied ? (
                  <span className="text-emerald-500 dark:text-emerald-400 font-mono text-[10px] px-1 font-semibold">copied!</span>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.25 2c.14 0 .25.11.25.25V3H10v-.75C10 1.28 9.22.5 8.25.5h-5.5C1.78.5 1 1.28 1 2.25v7.5c0 .97.78 1.75 1.75 1.75H4.5V10H2.75a.25.25 0 0 1-.25-.25v-7.5c0-.14.11-.25.25-.25zm5 4c.14 0 .25.11.25.25v7.5q-.02.23-.25.25h-5.5a.25.25 0 0 1-.25-.25v-7.5c0-.14.11-.25.25-.25zm0 9.5c.97 0 1.75-.78 1.75-1.75v-7.5c0-.97-.78-1.75-1.75-1.75h-5.5C6.78 4.5 6 5.28 6 6.25v7.5c0 .97.78 1.75 1.75 1.75z"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Speedometer Gauge Graphic matching index.html */}
          <div className="relative order-first mx-auto flex min-h-56 w-full items-center justify-center pt-6 lg:order-last lg:col-span-5 lg:min-h-80 lg:pt-0">
            <div
              className="speedometer-container relative w-full max-w-[500px] aspect-[24/17] select-none group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible" viewBox="0 0 480 340">
                <defs>
                  <linearGradient id="remote-cache-gauge-gradient" gradientUnits="userSpaceOnUse" x1="46.4" x2="433.6" y1="310.5" y2="310.5">
                    <stop offset="0" stopColor="#0196FF" />
                    <stop offset="1" stopColor="#FF1E56" />
                  </linearGradient>
                  <linearGradient id="remote-cache-gauge-inner-gradient" gradientUnits="userSpaceOnUse" x1="46.4" x2="433.6" y1="310.5" y2="310.5">
                    <stop offset="0" stopColor="#52C7FF" />
                    <stop offset="1" stopColor="#FF1E56" />
                  </linearGradient>
                  <linearGradient id="remote-cache-gauge-pointer-gradient" gradientUnits="userSpaceOnUse" x1="236.58" x2="243.42" y1="230.6" y2="249.4">
                    <stop offset="0" stopColor="#666666" />
                    <stop offset="0.42" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#444444" />
                  </linearGradient>
                  <radialGradient id="remote-cache-gauge-dot-gradient" gradientUnits="userSpaceOnUse" cx="234" cy="233" fx="234" fy="233" r="27">
                    <stop offset="0" stopColor="#666666" />
                    <stop offset="0.48" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#666666" />
                  </radialGradient>
                  <radialGradient id="remote-cache-gauge-pin-gradient" cx="35%" cy="30%">
                    <stop offset="0" stopColor="#ededed" />
                    <stop offset="1" stopColor="#888888" />
                  </radialGradient>
                  <radialGradient id="remote-cache-gauge-fade" cx="240" cy="240" gradientUnits="userSpaceOnUse" r="197">
                    <stop offset="75%" stopColor="white" stopOpacity="0" />
                    <stop offset="81%" stopColor="white" stopOpacity="0.03" />
                    <stop offset="87%" stopColor="white" stopOpacity="0.12" />
                    <stop offset="92%" stopColor="white" stopOpacity="0.32" />
                    <stop offset="95%" stopColor="white" stopOpacity="0.64" />
                    <stop offset="100%" stopColor="white" stopOpacity="1" />
                  </radialGradient>
                  <mask id="remote-cache-gauge-fade-mask" style={{ maskType: 'alpha' }}>
                    <rect fill="url(#remote-cache-gauge-fade)" height="340" width="480" />
                  </mask>
                  <mask id="remote-cache-gauge-segment-mask" style={{ maskType: 'luminance' }}>
                    <path d="M46.4 310.5a206 206 0 1 1 387.2 0" fill="none" stroke="white" strokeLinecap="butt" strokeWidth="120" />
                    <g stroke="black" strokeWidth="2.77">
                      <line x1="102.78" x2="-24.65" y1="212.26" y2="186.5" />
                      <line x1="137.37" x2="42.08" y1="144.78" y2="56.35" />
                      <line x1="202.08" x2="166.87" y1="105.23" y2="-19.91" />
                      <line x1="277.92" x2="313.13" y1="105.23" y2="-19.91" />
                      <line x1="342.63" x2="437.92" y1="144.78" y2="56.35" />
                      <line x1="377.22" x2="504.65" y1="212.26" y2="186.5" />
                    </g>
                  </mask>
                  <mask id="remote-cache-gauge-inner-indicator-mask" style={{ maskType: 'alpha' }}>
                    <path
                      d="M54.9 307.4a197 197 0 1 1 370.2 0"
                      fill="none"
                      pathLength="100"
                      stroke="white"
                      strokeDasharray={dashArray}
                      strokeLinecap="butt"
                      strokeWidth="394"
                      style={{
                        transition: 'stroke-dasharray 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </mask>
                  <mask id="remote-cache-gauge-inner-remainder-mask" style={{ maskType: 'alpha' }}>
                    <path
                      d="M54.9 307.4a197 197 0 1 1 370.2 0"
                      fill="none"
                      pathLength="100"
                      stroke="white"
                      strokeDasharray={remainderDashArray}
                      strokeLinecap="butt"
                      strokeWidth="394"
                      style={{
                        transition: 'stroke-dasharray 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </mask>
                  <linearGradient id="remote-cache-gauge-end-fade" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="310.5" y2="270">
                    <stop offset="0" stopColor="white" stopOpacity="0" />
                    <stop offset="100%" stopColor="white" />
                  </linearGradient>
                  <mask id="remote-cache-gauge-end-fade-mask" style={{ maskType: 'alpha' }}>
                    <rect fill="url(#remote-cache-gauge-end-fade)" height="340" width="480" />
                  </mask>
                  <filter id="remote-cache-gauge-glow" height="160%" width="160%" x="-30%" y="-30%">
                    <feGaussianBlur stdDeviation="2.5" />
                  </filter>
                  <filter id="needle-soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" />
                  </filter>
                </defs>

                {/* Outer Glow */}
                <g mask="url(#remote-cache-gauge-end-fade-mask)">
                  <path
                    className="opacity-25 dark:mix-blend-screen dark:opacity-40"
                    d="M46.4 310.5a206 206 0 1 1 387.2 0"
                    fill="none"
                    filter="url(#remote-cache-gauge-glow)"
                    pathLength="100"
                    stroke="url(#remote-cache-gauge-gradient)"
                    strokeDasharray={dashArray}
                    strokeLinecap="butt"
                    strokeWidth="21"
                    style={{
                      transition: 'stroke-dasharray 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </g>

                {/* Segmented Base Track and Active Arc */}
                <g mask="url(#remote-cache-gauge-segment-mask)">
                  <g mask="url(#remote-cache-gauge-end-fade-mask)">
                    <path d="M46.4 310.5a206 206 0 1 1 387.2 0" fill="none" stroke="var(--remote-cache-track-color)" strokeLinecap="butt" strokeWidth="18" />
                    <g mask="url(#remote-cache-gauge-inner-indicator-mask)">
                      <path className="opacity-30 dark:opacity-25" d="M54.9 307.4a197 197 0 1 1 370.2 0L240 240Z" fill="url(#remote-cache-gauge-inner-gradient)" mask="url(#remote-cache-gauge-fade-mask)" />
                    </g>
                    <g mask="url(#remote-cache-gauge-inner-remainder-mask)">
                      <path className="opacity-30 dark:opacity-20" d="M54.9 307.4a197 197 0 1 1 370.2 0L240 240Z" fill="var(--remote-cache-remainder-fill)" mask="url(#remote-cache-gauge-fade-mask)" />
                    </g>
                    <path
                      d="M46.4 310.5a206 206 0 1 1 387.2 0"
                      fill="none"
                      pathLength="100"
                      stroke="url(#remote-cache-gauge-gradient)"
                      strokeDasharray={dashArray}
                      strokeLinecap="butt"
                      strokeWidth="18"
                      style={{
                        transition: 'stroke-dasharray 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </g>
                </g>

                {/* Tick Marks (43 lines matching original) */}
                <g className="mix-blend-multiply dark:mix-blend-normal" stroke="var(--remote-cache-tick-color)" strokeWidth="1">
                  <line x1="58.85" x2="51.14" y1="290.27" y2="292.41" />
                  <line x1="55.47" x2="47.61" y1="275.94" y2="277.47" />
                  <line x1="53.22" x2="45.27" y1="261.38" y2="262.29" />
                  <line x1="52.12" x2="44.12" y1="246.69" y2="246.98" />
                  <line x1="52.17" x2="44.18" y1="231.97" y2="231.62" />
                  <line x1="53.38" x2="45.44" y1="217.29" y2="216.32" />
                  <line x1="59.21" x2="51.52" y1="188.44" y2="186.24" />
                  <line x1="63.8" x2="56.3" y1="174.44" y2="171.65" />
                  <line x1="69.47" x2="62.22" y1="160.85" y2="157.48" />
                  <line x1="76.19" x2="69.22" y1="147.75" y2="143.82" />
                  <line x1="83.92" x2="77.27" y1="135.21" y2="130.75" />
                  <line x1="92.6" x2="86.33" y1="123.31" y2="118.34" />
                  <line x1="112.62" x2="107.2" y1="101.73" y2="95.85" />
                  <line x1="123.83" x2="118.89" y1="92.18" y2="85.89" />
                  <line x1="135.76" x2="131.33" y1="83.54" y2="76.89" />
                  <line x1="148.33" x2="144.43" y1="75.86" y2="68.88" />
                  <line x1="161.46" x2="158.12" y1="69.19" y2="61.92" />
                  <line x1="175.07" x2="172.31" y1="63.57" y2="56.06" />
                  <line x1="203.41" x2="201.85" y1="55.6" y2="47.75" />
                  <line x1="217.95" x2="217.01" y1="53.3" y2="45.35" />
                  <line x1="232.64" x2="232.32" y1="52.14" y2="44.15" />
                  <line x1="247.36" x2="247.68" y1="52.14" y2="44.15" />
                  <line x1="262.05" x2="262.99" y1="53.3" y2="45.35" />
                  <line x1="276.59" x2="278.15" y1="55.6" y2="47.75" />
                  <line x1="304.93" x2="307.69" y1="63.57" y2="56.06" />
                  <line x1="318.54" x2="321.88" y1="69.19" y2="61.92" />
                  <line x1="331.67" x2="335.57" y1="75.86" y2="68.88" />
                  <line x1="344.24" x2="348.67" y1="83.54" y2="76.89" />
                  <line x1="356.17" x2="361.11" y1="92.18" y2="85.89" />
                  <line x1="367.38" x2="372.8" y1="101.73" y2="95.85" />
                  <line x1="387.4" x2="393.67" y1="123.31" y2="118.34" />
                  <line x1="396.08" x2="402.73" y1="135.21" y2="130.75" />
                  <line x1="403.81" x2="410.78" y1="147.75" y2="143.82" />
                  <line x1="410.53" x2="417.78" y1="160.85" y2="157.48" />
                  <line x1="416.2" x2="423.7" y1="174.44" y2="171.65" />
                  <line x1="420.79" x2="428.48" y1="188.44" y2="186.24" />
                  <line x1="426.62" x2="434.56" y1="217.29" y2="216.32" />
                  <line x1="427.83" x2="435.82" y1="231.97" y2="231.62" />
                  <line x1="427.88" x2="435.88" y1="246.69" y2="246.98" />
                  <line x1="426.78" x2="434.73" y1="261.38" y2="262.29" />
                  <line x1="424.53" x2="432.39" y1="275.94" y2="277.47" />
                  <line x1="421.15" x2="428.86" y1="290.27" y2="292.41" />
                  <line x1="416.66" x2="424.18" y1="304.3" y2="307.04" />
                </g>

                {/* Needle and Center Metallic Pin */}
                <g transform="translate(1 2)">
                  <g
                    id="needleGroup"
                    style={{
                      transformOrigin: '240px 240px',
                      transformBox: 'view-box',
                      transform: `rotate(${needleRotation}deg)`,
                      transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      willChange: 'transform',
                    }}
                  >
                    {/* Needle Drop Shadow with soft blur */}
                    <polygon
                      points="243.12,249.37 374.53,185.90 236.88,230.57"
                      fill="var(--remote-cache-needle-shadow)"
                      filter="url(#needle-soft-shadow)"
                      transform="translate(1, 3)"
                    />
                    {/* Main Metallic Needle Body with theme-adaptive stroke */}
                    <polygon
                      points="243.12,249.37 374.53,185.90 236.88,230.57"
                      fill="url(#remote-cache-gauge-pointer-gradient)"
                      stroke="var(--remote-cache-needle-stroke)"
                      strokeWidth="0.8"
                    />
                    {/* Highlight Spine */}
                    <line x1="236.88" y1="230.57" x2="374.53" y2="185.90" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
                  </g>

                  {/* Center Metallic Hub */}
                  <g>
                    <circle cx="240" cy="240" fill="var(--remote-cache-hub-halo)" r="20" />
                    <circle cx="240" cy="240" fill="url(#remote-cache-gauge-dot-gradient)" r="18" />
                    <ellipse cx="235" cy="233.5" fill="white" fillOpacity="0.22" rx="7" ry="3" transform="rotate(-25 235 233.5)" />
                    <circle cx="240" cy="240" fill="url(#remote-cache-gauge-pin-gradient)" r="7" stroke="var(--remote-cache-needle-stroke)" strokeWidth="1" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
