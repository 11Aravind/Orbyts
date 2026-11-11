import React from 'react';
import { Check } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span>About ORBYT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              A technology partner for what comes next.
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed">
              ORBYT brings software products, security-minded thinking, and custom development together
              under one focused technology brand.
            </p>
            <p className="text-neutral-400 text-base leading-relaxed">
              We believe good technology should be useful, understandable, and built with care. Our focus is
              on practical software products and digital solutions that help businesses do their work better.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-white font-bold text-lg">Build.</div>
                <div className="text-xs text-neutral-400 mt-1">Useful tools engineered for practical daily impact.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-white font-bold text-lg">Secure.</div>
                <div className="text-xs text-neutral-400 mt-1">Defensive architecture baked in from line one.</div>
              </div>
            </div>
          </div>

          <div className="spotlight-card p-8 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-white/[0.08] pb-4">
              What guides us
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Clarity over complexity</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Practical thinking comes before unnecessary architectural bloat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Security from the beginning</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Defensive practices integrated into every phase of the product life cycle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Craft that lasts</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Code quality, responsive performance, and clean maintainability built into every commit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Genuine partnership</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    We stand with you beyond launch &mdash; supporting your ongoing evolution and growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
