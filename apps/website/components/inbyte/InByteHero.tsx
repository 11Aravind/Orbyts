'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, QrCode, MonitorCheck, Receipt, Sparkles, ChefHat } from 'lucide-react';

export default function InByteHero({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden border-b border-white/[0.08]">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/#products" className="hover:text-white transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-emerald-400">InByte Restaurant Suite</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production-Ready Restaurant Suite</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-[-0.03em] leading-[1.1]">
                  InByte
                </h1>
                <p className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  By ORBYT Software Solutions
                </p>
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-[450] text-neutral-200 tracking-[-0.02em] leading-snug">
              Modern digital dining, real-time KDS, and effortless restaurant operations.
            </p>

            <p className="text-base text-neutral-400 leading-relaxed max-w-2xl font-normal">
              InByte replaces clunky paper menus and slow service with a lightning-fast QR dining workflow.
              Customers scan, browse live categorized menus, and order directly from their table. Kitchen orders sync
              in real time over WebSockets while cashiers settle bills and print thermal receipts effortlessly.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenDemo}
                className="px-6 py-3.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-400/10 cursor-pointer"
              >
                <span>Request Live Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#features"
                className="px-6 py-3.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] text-neutral-300 hover:text-white font-medium text-sm transition-colors"
              >
                Explore System Features
              </a>
            </div>

            {/* Metric Highlights */}
            <div className="pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
              <div>
                <div className="text-xl font-bold text-white tracking-tight font-sans">&lt; 0.5s</div>
                <div className="text-neutral-500 mt-1">WebSocket KDS Sync</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight font-sans">+32%</div>
                <div className="text-neutral-500 mt-1">Table Turnover Rate</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight font-sans">0 App</div>
                <div className="text-neutral-500 mt-1">Downloads Required</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight font-sans">100%</div>
                <div className="text-neutral-500 mt-1">Thermal Printer Ready</div>
              </div>
            </div>
          </div>

          {/* Right Hero Preview Window */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.12] bg-[#0c0c0e] shadow-2xl overflow-hidden relative group">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-neutral-900/70 font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-neutral-300 font-mono text-[11px]">inbyte.restaurant/table/12</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TABLE #12
                </span>
              </div>

              {/* Mockup Preview Graphic */}
              <div className="p-6 space-y-5 bg-gradient-to-b from-neutral-950 to-black">
                {/* Simulated Customer Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm">Grand Bistro Dining</h3>
                    <p className="text-xs text-neutral-400 font-mono">Table 12 &bull; 4 Guests</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono">
                    Session Active
                  </span>
                </div>

                {/* Simulated Live Order Stream */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-neutral-200">1x Truffle Wild Mushroom Risotto</span>
                    </div>
                    <span className="text-neutral-400">$24.00</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-neutral-200">2x Rosemary Garlic Focaccia</span>
                    </div>
                    <span className="text-neutral-400">$16.00</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-neutral-200">2x Artisanal Citrus Mocktail</span>
                    </div>
                    <span className="text-neutral-400">$18.00</span>
                  </div>
                </div>

                {/* KDS Dispatch Status */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <MonitorCheck className="w-4 h-4" />
                    <span>Kitchen KOT Synced (Cooking)</span>
                  </div>
                  <span className="text-neutral-400">03:42 mins</span>
                </div>

                {/* Total and Settle Bar */}
                <div className="pt-2 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-neutral-400 text-xs block font-mono">TOTAL ORDER</span>
                    <span className="text-white font-bold text-lg font-mono">$58.00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 px-2.5 py-1.5 rounded bg-white/5 border border-white/10">
                      Receipt Ready
                    </span>
                    <span className="text-xs font-mono text-emerald-400 px-2.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      Paid via QR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

