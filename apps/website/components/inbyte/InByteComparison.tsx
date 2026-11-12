'use client';

import React from 'react';
import { XCircle, CheckCircle2, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function InByteComparison() {
  const comparisons = [
    {
      feature: 'Customer Experience',
      traditional: 'Clunky pinch-to-zoom PDF menus or dirty paper cards with no food photos.',
      inbyte: 'App-like responsive web menu loading in < 0.3s with high-res photos and dietary badges.',
    },
    {
      feature: 'Menu Updates & Sold-Out Items',
      traditional: 'Requires expensive re-printing or white-out stickers when items sell out or prices change.',
      inbyte: '1-tap instant "86 / Out of Stock" toggle and live price updates from your smartphone.',
    },
    {
      feature: 'Order Speed & Kitchen Dispatch',
      traditional: 'Guests wait 10–15 mins for waiters to write orders on paper tickets by hand.',
      inbyte: 'Instant WebSocket dispatch straight to Kitchen Display (KDS) screens & 80mm thermal printers.',
    },
    {
      feature: 'Upselling & Average Order Value',
      traditional: 'Rely on busy waitstaff to verbally remember daily specials and upsells.',
      inbyte: 'Visual food imagery, side-item recommendations, and modifiers drive +25% higher check sizes.',
    },
    {
      feature: 'Table Service & Calling',
      traditional: 'Guests wave arms frantically across noisy dining rooms to catch a server’s eye.',
      inbyte: 'In-table digital call buttons alert waiter smartwatches and terminals with audio chimes.',
    },
    {
      feature: 'Platform Cost & Commissions',
      traditional: 'Aggregator delivery platforms take 25% to 35% commission on every order.',
      inbyte: '100% commission-free. You keep every rupee/dollar of customer revenue directly.',
    },
  ];

  return (
    <section id="comparison" className="py-20 lg:py-28 border-b border-neutral-200 dark:border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Switch From Paper &amp; PDFs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Stop losing revenue to static PDF menus.
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-base sm:text-lg">
            See why leading restaurants, bars, and cafes are retiring clunky PDF files and paper reprints in favor of
            InByte&apos;s interactive visual ordering engine.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT: The Old Way (Static PDF / Paper) */}
          <div className="p-8 sm:p-10 rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-red-200 dark:border-red-900/30">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-red-600 dark:text-red-400 font-semibold">
                    The Outdated Method
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    Static PDF &amp; Paper Menus
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/40 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <ul className="mt-8 space-y-6">
                {comparisons.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">{item.feature}</div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                        {item.traditional}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-6 border-t border-red-200 dark:border-red-900/30 text-xs font-mono text-red-600 dark:text-red-400 flex items-center gap-2">
              <span>Result: Frustrated guests, slow turns, and wasted print costs.</span>
            </div>
          </div>

          {/* RIGHT: The InByte Way (Interactive Visual Menu) */}
          <div className="p-8 sm:p-10 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-2xl shadow-emerald-500/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-6 border-b border-emerald-200 dark:border-emerald-800/40">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    The Modern Standard
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    InByte Smart QR Platform
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <ul className="mt-8 space-y-6">
                {comparisons.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white">{item.feature}</div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                        {item.inbyte}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-6 border-t border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Result: +25% higher check size, 15m faster turns &amp; 0% commission.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
