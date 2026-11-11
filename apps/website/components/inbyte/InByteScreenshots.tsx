'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Smartphone, MonitorCheck, Receipt, BarChart3, ChefHat, CheckCircle2 } from 'lucide-react';

export default function InByteScreenshots() {
  const [activeTab, setActiveTab] = useState<'customer' | 'kitchen' | 'pos' | 'admin'>('customer');

  const tabs = [
    {
      id: 'customer' as const,
      name: 'Customer Table View',
      icon: <Smartphone className="w-4 h-4" />,
      tagline: 'Browser-based, zero-install ordering experience right from table QR codes.',
    },
    {
      id: 'kitchen' as const,
      name: 'Kitchen Display (KDS)',
      icon: <ChefHat className="w-4 h-4" />,
      tagline: 'Real-time WebSocket ticket updates, audio chimes, and wake-lock screen persistence.',
    },
    {
      id: 'pos' as const,
      name: 'Admin POS & Tables',
      icon: <Receipt className="w-4 h-4" />,
      tagline: 'Live table floor map, split billing, payment settlement, and thermal receipt printing.',
    },
    {
      id: 'admin' as const,
      name: 'Analytics & Menu Control',
      icon: <BarChart3 className="w-4 h-4" />,
      tagline: 'Instant out-of-stock toggles, pricing controls, and daily revenue telemetry.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 border-b border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
            Interface Showcase
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Designed for high-pressure restaurant workflows.
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            Explore how each role interacts with InByte &mdash; from the dining customer to the executive chef and cashier.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 shadow-lg shadow-emerald-500/5'
                    : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Display Container */}
        <div className="rounded-2xl border border-white/[0.12] bg-[#0c0c0e] shadow-2xl overflow-hidden p-6 sm:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Tab Description Header */}
            <div className="border-b border-white/[0.08] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  {tabs.find((t) => t.id === activeTab)?.name}
                </span>
                <p className="text-sm sm:text-base text-neutral-300 mt-1 font-normal">
                  {tabs.find((t) => t.id === activeTab)?.tagline}
                </p>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 shrink-0">
                Live React 19 Engine
              </span>
            </div>

            {/* Screen Mockup Area */}
            {activeTab === 'customer' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-5 space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-white">Mobile QR Menu Experience</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Customers point their smartphone camera at the custom table QR stand. In less than a second,
                      the restaurant’s branded menu opens in their mobile browser.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs font-mono text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Categorized navigation with instant search</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Veg / Non-Veg &amp; Spice Level badges</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Custom kitchen notes on each dish</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Local cart backup prevents accidental loss</span>
                    </li>
                  </ul>
                </div>

                <div className="md:col-span-7">
                  <div className="max-w-sm mx-auto rounded-3xl border-2 border-neutral-800 bg-black p-4 shadow-2xl relative">
                    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-5 h-5 text-emerald-400" />
                          <span className="text-xs font-bold text-white">The Olive Branch</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Table 08
                        </span>
                      </div>

                      {/* Sample Dishes */}
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-white">Pan-Seared Seabass</div>
                            <div className="text-[10px] text-neutral-500 font-mono">Lemon caper butter &bull; GF</div>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 font-bold">$28.50</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-white">Wild Porcini Tagliatelle</div>
                            <div className="text-[10px] text-neutral-500 font-mono">Fresh thyme, truffle oil &bull; Veg</div>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 font-bold">$22.00</span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-300">2 Items in Cart</span>
                        <span className="text-emerald-400 font-bold">Review &amp; Place Order &rarr;</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kitchen' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Ticket 1 */}
                  <div className="p-4 rounded-xl border border-yellow-500/30 bg-neutral-950 font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-yellow-400 font-bold">#ORD-104 &bull; Table 4</span>
                      <span className="text-[10px] text-neutral-400">01:15m ago</span>
                    </div>
                    <div className="space-y-1 text-neutral-300">
                      <div>1x Burrata &amp; Heirloom Tomato</div>
                      <div>2x Grilled Ribeye (Medium Rare)</div>
                      <div className="text-[10px] text-yellow-300/80 bg-yellow-950/20 p-1 rounded">
                        Note: Dressing on the side
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] text-yellow-400">STATUS: PENDING</span>
                      <span className="px-2 py-0.5 rounded bg-yellow-400 text-black font-semibold text-[10px]">
                        Start Cooking
                      </span>
                    </div>
                  </div>

                  {/* Ticket 2 */}
                  <div className="p-4 rounded-xl border border-blue-500/30 bg-neutral-950 font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-blue-400 font-bold">#ORD-102 &bull; Table 7</span>
                      <span className="text-[10px] text-neutral-400">06:40m ago</span>
                    </div>
                    <div className="space-y-1 text-neutral-300">
                      <div>2x Wood-Fired Margherita</div>
                      <div>1x Caesar Salad</div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] text-blue-400">STATUS: COOKING</span>
                      <span className="px-2 py-0.5 rounded bg-blue-400 text-black font-semibold text-[10px]">
                        Mark Ready
                      </span>
                    </div>
                  </div>

                  {/* Ticket 3 */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-neutral-950 font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-emerald-400 font-bold">#ORD-098 &bull; Table 12</span>
                      <span className="text-[10px] text-neutral-400">14:10m ago</span>
                    </div>
                    <div className="space-y-1 text-neutral-300">
                      <div>3x Artisanal Gelato Trio</div>
                      <div>2x Double Espresso</div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] text-emerald-400">STATUS: READY TO SERVE</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-400 text-black font-semibold text-[10px]">
                        Served
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pos' && (
              <div className="p-6 rounded-xl bg-neutral-950 border border-white/10 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 font-mono text-xs">
                    <div className="text-emerald-400 font-bold text-sm">Table 01</div>
                    <div className="text-neutral-400 mt-1">4 Guests &bull; Occupied</div>
                    <div className="text-white font-bold mt-2">$84.20</div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-xs">
                    <div className="text-neutral-400 font-bold text-sm">Table 02</div>
                    <div className="text-neutral-500 mt-1">2 Guests &bull; Available</div>
                    <div className="text-neutral-500 mt-2">$0.00</div>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-500/30 font-mono text-xs">
                    <div className="text-purple-400 font-bold text-sm">Table 03</div>
                    <div className="text-neutral-400 mt-1">6 Guests &bull; Billing</div>
                    <div className="text-white font-bold mt-2">$142.50</div>
                  </div>

                  <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/30 font-mono text-xs">
                    <div className="text-cyan-400 font-bold text-sm">Table 04</div>
                    <div className="text-neutral-400 mt-1">Reserved 8:00 PM</div>
                    <div className="text-neutral-400 mt-2">Party of 5</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Auto KOT dispatch &amp; Thermal Receipt formatting enabled</span>
                  </div>
                  <span className="px-3 py-1.5 rounded bg-white/10 text-white font-semibold">
                    Print Final Bill (ESC/POS)
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
                <div className="p-5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                  <span className="text-neutral-500">TODAY&apos;S GROSS REVENUE</span>
                  <div className="text-2xl font-bold text-white font-sans">$3,420.50</div>
                  <div className="text-[11px] text-emerald-400">+18% vs yesterday</div>
                </div>

                <div className="p-5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                  <span className="text-neutral-500">ORDERS COMPLETED</span>
                  <div className="text-2xl font-bold text-white font-sans">148</div>
                  <div className="text-[11px] text-emerald-400">Avg ticket: $23.11</div>
                </div>

                <div className="p-5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                  <span className="text-neutral-500">REALTIME DISH STATUS</span>
                  <div className="text-2xl font-bold text-emerald-400 font-sans">42 / 44 Active</div>
                  <div className="text-[11px] text-amber-400">2 Items toggled Out-of-Stock</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

