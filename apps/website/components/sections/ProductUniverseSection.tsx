'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function ProductUniverseSection() {
  const [modalData, setModalData] = useState<{ title: string; desc: string } | null>(null);

  return (
    <>
      {/* SECTION 4: THE PRODUCT UNIVERSE (Bento Grid) */}
      <section id="products" className="py-24 border-t border-white/[0.08] relative">
        <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Useful tools. Thoughtfully built.
              </h2>
              <p className="mt-4 text-neutral-400 text-base sm:text-lg">
                Explore ORBYT&apos;s software products, built to simplify work and solve real business challenges.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-neutral-400">
                Concept Previews Active
              </span>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0 m-0">
            {/* 1. Innbite */}
            <li className="flex w-full flex-col gap-5">
              <Link
                href="/products/inbyte"
                className="aspect-[40/27] overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950/80 hover:border-white/20 transition-all relative group flex items-center justify-center block"
              >
                <Image
                  src="/images/dine-preview.jpg"
                  alt="Innbite QR Food Ordering Preview"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Link href="/products/inbyte" className="font-semibold text-white text-base hover:text-cyan-400 transition-colors">
                    Innbite (InByte)
                  </Link>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-400">
                    QR Dining
                  </span>
                </div>
                <p className="text-balance text-sm text-neutral-400">
                  Scan QR codes to browse live menus and order food instantly right from your table.
                </p>
              </div>
            </li>

            {/* 2. Orbyt Commerce */}
            <li
              className="flex w-full flex-col gap-5 cursor-pointer"
              onClick={() =>
                setModalData({
                  title: 'Orbyt Commerce',
                  desc: 'A complete SaaS transaction and digital storefront engine with instant automated invoicing, checkout optimization, and webhook handling.',
                })
              }
            >
              <div className="aspect-[40/27] overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950/80 hover:border-white/20 transition-all flex items-center justify-center px-6">
                <div aria-hidden="true" className="flex size-full items-center justify-center bg-transparent px-6">
                  <div className="flex flex-col gap-2 font-mono text-sm leading-6 tracking-tight">
                    <p className="text-neutral-400">
                      <span className="text-emerald-400 font-medium">1,480 orders</span>, 100% fulfilled
                    </p>
                    <p className="text-neutral-400">
                      <span className="font-bold text-white">$142,850 GMV</span>, instant payout
                    </p>
                    <p className="text-neutral-400">
                      0.24s{' '}
                      <span className="bg-gradient-to-r from-[#0096FF] to-[#FF1E56] bg-clip-text text-transparent">
                        &gt;&gt;&gt; HIGH CONVERSION
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-base">Orbyt Commerce</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-400">
                    Storefront
                  </span>
                </div>
                <p className="text-balance text-sm text-neutral-400">
                  A flexible online storefront foundation for modern brands ready to sell and scale with confidence.
                </p>
              </div>
            </li>

            {/* 3. Orbyt Stock */}
            <li
              className="flex w-full flex-col gap-5 cursor-pointer"
              onClick={() =>
                setModalData({
                  title: 'Orbyt Stock',
                  desc: 'Multi-location inventory tracking, low-threshold ingredient triggers, and real-time vendor replenishment pipelines.',
                })
              }
            >
              <div className="aspect-[40/27] overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950/80 hover:border-white/20 transition-all flex items-center justify-center px-4">
                <div aria-hidden="true" className="flex size-full items-center justify-center bg-transparent px-4">
                  <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl border border-white/10">
                    <div className="border-white/10 border-b px-4 py-3 text-neutral-300 font-mono text-xs flex items-center justify-between">
                      <span>
                        <span className="text-neutral-500">$</span> orbyt stock sync
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    </div>
                    <div className="flex flex-col gap-2.5 px-4 py-3.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">&bull;</span>
                        <span className="flex-1 text-neutral-300">warehouse/main</span>
                        <span className="text-emerald-400">in stock</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">&bull;</span>
                        <span className="flex-1 text-neutral-300">outlets/14-stores</span>
                        <span className="text-emerald-400">synced</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">&bull;</span>
                        <span className="flex-1 text-neutral-300">auto-reorder</span>
                        <span className="text-neutral-400">active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-white/10 border-t px-4 py-2.5 text-neutral-300 font-mono text-xs">
                      <span>3 locations</span>
                      <span>38ms</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-base">Orbyt Stock</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-400">
                    Inventory
                  </span>
                </div>
                <p className="text-balance text-sm text-neutral-400">
                  Bring catalog items, real-time stock movements, and multi-location inventory into one clear workspace.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* PRODUCT DETAIL MODAL DIALOG */}
      {modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setModalData(null)}
        >
          <div
            className="spotlight-card max-w-lg w-full p-6 sm:p-8 relative bg-neutral-950 border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalData(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-block px-2.5 py-1 rounded text-xs font-mono bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 mb-3">
              Ecosystem Specification
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{modalData.title}</h3>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6">{modalData.desc}</p>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 mb-6 text-xs font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Deployment:</span>
                <span className="text-white">High-Availability Cloud</span>
              </div>
              <div className="flex justify-between">
                <span>Security Standard:</span>
                <span className="text-emerald-400">SOC2 Type II Ready</span>
              </div>
              <div className="flex justify-between">
                <span>Early Access:</span>
                <span className="text-cyan-400">Open for Beta Partners</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/#contact"
                onClick={() => setModalData(null)}
                className="flex-1 py-3 text-center rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
              >
                Request Early Access
              </Link>
              <button
                onClick={() => setModalData(null)}
                className="px-5 py-3 rounded-xl border border-white/10 text-white font-semibold text-xs hover:bg-white/5 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
