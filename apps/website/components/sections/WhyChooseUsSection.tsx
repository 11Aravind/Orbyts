import React from 'react';
import { ShieldCheck, Cpu, Code2, Users2, Check } from 'lucide-react';

export default function WhyChooseUsSection() {
  const pillars = [
    {
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      title: 'Zero Technical Debt',
      desc: 'We write strict, modular code with clean architectural boundaries. Every package is isolated, typed, and verifiable.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Security by Default',
      desc: 'Defensive thinking is baked into day one. We enforce OWASP guidelines, input validation, and Row-Level Security.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      title: 'Production Performance',
      desc: 'Engineered for sub-second page loads, instant camera QR scanning, and hardware-accelerated local print operations.',
    },
    {
      icon: <Users2 className="w-5 h-5 text-amber-400" />,
      title: 'Direct Engineering Partnership',
      desc: 'You collaborate directly with senior architects and developers who understand both business goals and deep code contracts.',
    },
  ];

  return (
    <section className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span>Why Choose ORBYT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Thoughtful engineering for long-term reliability.
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed">
              We reject brittle shortcuts and unnecessary framework hype. Our commitment is delivering software
              that operates smoothly today and scales effortlessly tomorrow.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Strict TypeScript contracts &amp; end-to-end linting</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Automated Playwright integration and E2E coverage</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Complete source code ownership &amp; clean repository hygiene</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="spotlight-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

