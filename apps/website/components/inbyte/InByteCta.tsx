import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChefHat, Sparkles } from 'lucide-react';

export default function InByteCta({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="spotlight-card p-10 sm:p-16 relative overflow-hidden text-center max-w-4xl mx-auto border-emerald-500/20 bg-gradient-to-b from-[#0c0c0e] to-black">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <ChefHat className="w-7 h-7" />
          </div>

          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
            Accelerate Dining Velocity
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-2xl mx-auto">
            Ready to modernize your restaurant operations?
          </h2>

          <p className="mt-5 text-neutral-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Experience how InByte turns tables 32% faster, eliminates kitchen miscommunications, and delights dining guests without requiring expensive proprietary hardware.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenDemo}
              className="px-8 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-400/10 cursor-pointer"
            >
              <span>Book Live Product Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/#products"
              className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-neutral-300 hover:text-white font-medium text-sm transition-colors"
            >
              Back to Product Universe
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

