import React from 'react';
import { QrCode, ShoppingCart, ChefHat, Receipt } from 'lucide-react';

export default function InByteWorkflow() {
  const steps = [
    {
      num: '01',
      title: 'Scan Table QR',
      subtitle: 'Zero Friction Onboarding',
      desc: 'Guest arrives, sits at an assigned table, and scans the QR code with their default smartphone camera. No app download or account signup required—loads in < 0.3s.',
      icon: <QrCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    },
    {
      num: '02',
      title: 'Browse Visuals & Order',
      subtitle: 'Appetite-Driven Mobile Cart',
      desc: 'Guests explore vivid dish photos, dietary badges, chef recommendations, and customize preparation notes. Visual suggestions increase average check sizes by +25%.',
      icon: <ShoppingCart className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
    },
    {
      num: '03',
      title: 'Instant Kitchen KDS & Print',
      subtitle: 'Sub-Second WebSocket Dispatch',
      desc: 'Orders land immediately on Kitchen Display System (KDS) screens with audio chime alerts. ESC/POS thermal printers automatically print clean 80mm KOT tickets.',
      icon: <ChefHat className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
    },
    {
      num: '04',
      title: 'Settle & Faster Turnover',
      subtitle: '100% Commission-Free Settle',
      desc: 'Guests pay seamlessly via QR or settle at the cashier counter. Waiters are called with 1 tap. Dining rooms save 15 minutes per table turn during busy dinner peaks.',
      icon: <Receipt className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
    },
  ];

  return (
    <section className="py-20 lg:py-28 border-b border-neutral-200 dark:border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Seamless dining in 4 simple steps.
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-base sm:text-lg">
            A friction-free operational workflow that keeps food moving quickly out of the kitchen and guests delighted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400/80">{step.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  {step.subtitle}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-white/[0.06] text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Step {idx + 1} of 4
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


