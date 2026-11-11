import React from 'react';
import { QrCode, ShoppingCart, ChefHat, Receipt } from 'lucide-react';

export default function InByteWorkflow() {
  const steps = [
    {
      num: '01',
      title: 'Scan Table QR',
      subtitle: 'Zero Friction Onboarding',
      desc: 'Guest arrives, sits at an assigned table, and scans the table QR stand with their smartphone camera. No app download or account creation required.',
      icon: <QrCode className="w-5 h-5 text-emerald-400" />,
    },
    {
      num: '02',
      title: 'Order & Customize',
      subtitle: 'Interactive Mobile Cart',
      desc: 'Guest explores categorized dishes, dietary symbols, and high-resolution food photos. Modifiers and custom chef notes are added before placing the order.',
      icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />,
    },
    {
      num: '03',
      title: 'Kitchen Dispatch',
      subtitle: 'Real-Time WebSocket Sync',
      desc: 'The order lands instantly on the Kitchen Display System (KDS) screen with an audio bell alert. An automated KOT ticket is queued for kitchen staff.',
      icon: <ChefHat className="w-5 h-5 text-purple-400" />,
    },
    {
      num: '04',
      title: 'Settlement & Turn',
      subtitle: 'Fast Checkout & Thermal Print',
      desc: 'Guests pay seamlessly via integrated digital payment or settle at the counter. The cashier prints an itemized thermal receipt and the table resets to Available.',
      icon: <Receipt className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <section className="py-20 lg:py-28 border-b border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
            Operational Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            How InByte powers the dining floor.
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            A seamless four-step flow that keeps food moving out of the kitchen and guests satisfied.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="spotlight-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold font-mono text-emerald-400/80">{step.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  {step.subtitle}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] text-[10px] font-mono text-emerald-400">
                Step {idx + 1} of 4
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

