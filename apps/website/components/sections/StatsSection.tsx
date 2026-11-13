'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface StatConfig {
  id: string;
  target: number;
  suffix: string;
  isFloat?: boolean;
}

const STATS: StatConfig[] = [
  { id: 'stat-years', target: 12, suffix: '+' },
  { id: 'stat-companies', target: 100, suffix: '+' },
  { id: 'stat-customers', target: 500, suffix: '+' },
  { id: 'stat-satisfaction', target: 99.8, suffix: '%', isFloat: true },
];

export default function StatsSection() {
  const containerRef = useRef<HTMLDListElement | null>(null);
  const counterRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const animationFrameIds = useRef<{ [key: string]: number }>({});
  const hasAnimatedRef = useRef(false);

  const runStatsAnimation = useCallback(() => {
    const duration = 1400; // 1.4s mechanical counter ticker
    const startTime = performance.now();

    STATS.forEach((stat) => {
      const el = counterRefs.current[stat.id];
      if (!el) return;

      if (animationFrameIds.current[stat.id]) {
        cancelAnimationFrame(animationFrameIds.current[stat.id]);
      }

      function updateCount(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic deceleration out curve matching original
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = stat.target * ease;

        if (progress < 1) {
          if (stat.isFloat) {
            el!.textContent = currentVal.toFixed(1) + (progress > 0.85 ? stat.suffix : '');
          } else {
            el!.textContent = Math.floor(currentVal) + (progress > 0.92 ? stat.suffix : '');
          }
          animationFrameIds.current[stat.id] = requestAnimationFrame(updateCount);
        } else {
          el!.textContent = (stat.isFloat ? stat.target.toFixed(1) : stat.target) + stat.suffix;
        }
      }

      animationFrameIds.current[stat.id] = requestAnimationFrame(updateCount);
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            runStatsAnimation();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    // Initial trigger fallback
    const timer = setTimeout(() => {
      if (!hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        runStatsAnimation();
      }
    }, 400);

    const frames = animationFrameIds.current;
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      Object.values(frames).forEach(cancelAnimationFrame);
    };
  }, [runStatsAnimation]);

  return (
    <section className="relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <dl
          ref={containerRef}
          id="statsGrid"
          className="grid grid-cols-2 gap-x-3 gap-y-10 py-10 sm:gap-x-8 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))] lg:gap-x-12 lg:py-14 select-none"
        >
          {/* Stat 1: 12+ Years (Gradient from #FF1E56 to #0196FF) */}
          <div
            className="min-w-0 stat-item cursor-pointer group"
            title="Click to replay count animation"
            onClick={runStatsAnimation}
          >
            <dt className="text-[32px] sm:text-[40px] lg:text-[64px] font-[450] tracking-[-0.02em] leading-none inline-block bg-gradient-to-r from-[#FF1E56] to-[#0196FF] bg-clip-text pr-1 text-transparent">
              <span
                ref={(node) => {
                  counterRefs.current['stat-years'] = node;
                }}
                className="stat-counter inline-block tabular-nums min-w-0"
              >
                12+
              </span>
            </dt>
            <dd className="text-[16px] leading-[24px] text-neutral-700 dark:text-[#ededed] mt-2 sm:whitespace-nowrap font-normal">
              Years in Business<span className="hidden lg:inline text-neutral-400 dark:text-[#888888]"> of continuous engineering</span>
            </dd>
          </div>

          {/* Stat 2: 100+ Companies */}
          <div
            className="min-w-0 lg:justify-self-end stat-item cursor-pointer group"
            title="Click to replay count animation"
            onClick={runStatsAnimation}
          >
            <dt className="text-[32px] sm:text-[40px] lg:text-[64px] font-[450] tracking-[-0.02em] leading-none text-neutral-900 dark:text-[#ededed]">
              <span
                ref={(node) => {
                  counterRefs.current['stat-companies'] = node;
                }}
                className="stat-counter inline-block tabular-nums min-w-0"
              >
                100+
              </span>
            </dt>
            <dd className="text-[16px] leading-[24px] text-neutral-700 dark:text-[#ededed] mt-2 sm:whitespace-nowrap font-normal">
              Companies empowered
            </dd>
          </div>

          {/* Stat 3: 500+ Happy Customers */}
          <div
            className="min-w-0 lg:justify-self-end stat-item cursor-pointer group"
            title="Click to replay count animation"
            onClick={runStatsAnimation}
          >
            <dt className="text-[32px] sm:text-[40px] lg:text-[64px] font-[450] tracking-[-0.02em] leading-none text-neutral-900 dark:text-[#ededed]">
              <span
                ref={(node) => {
                  counterRefs.current['stat-customers'] = node;
                }}
                className="stat-counter inline-block tabular-nums min-w-0"
              >
                500+
              </span>
            </dt>
            <dd className="text-[16px] leading-[24px] text-neutral-700 dark:text-[#ededed] mt-2 sm:whitespace-nowrap font-normal">
              Happy customers
            </dd>
          </div>

          {/* Stat 4: 99.8% Satisfaction Rate */}
          <div
            className="min-w-0 lg:justify-self-end stat-item cursor-pointer group"
            title="Click to replay count animation"
            onClick={runStatsAnimation}
          >
            <dt className="text-[32px] sm:text-[40px] lg:text-[64px] font-[450] tracking-[-0.02em] leading-none text-neutral-900 dark:text-[#ededed]">
              <span
                ref={(node) => {
                  counterRefs.current['stat-satisfaction'] = node;
                }}
                className="stat-counter inline-block tabular-nums min-w-0"
              >
                99.8%
              </span>
            </dt>
            <dd className="text-[16px] leading-[24px] text-neutral-700 dark:text-[#ededed] mt-2 sm:whitespace-nowrap font-normal">
              Satisfaction rate
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
