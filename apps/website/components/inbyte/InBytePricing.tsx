import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function InBytePricing({ onOpenDemo }: { onOpenDemo: () => void }) {
  const tiers = [
    {
      name: 'Single Outlet',
      tagline: 'Ideal for independent cafes, bistros, and boutique dining rooms.',
      price: 'Contact for Pricing',
      priceSubtitle: 'Tailored to your table count & hardware',
      features: [
        'Branded Customer QR Digital Menu',
        'Unlimited Table QR Generation & Export',
        'Single-Station Kitchen Display (KDS)',
        'Customer Food Modifier & Custom Notes',
        'Standard Business Hours Support',
      ],
      popular: false,
      cta: 'Request Starter Quote',
    },
    {
      name: 'Growth & Multi-Station',
      tagline: 'Built for high-volume restaurants, rooftop bars, and busy dining halls.',
      price: 'Contact for Pricing',
      priceSubtitle: 'Scales with multiple prep lines & bars',
      features: [
        'Everything in Single Outlet, plus:',
        'Multi-Station KDS Routing (Bar, Grill, Pastry)',
        'Cashier POS Desk & Table Bill Settlement',
        'ESC/POS Thermal Receipt & KOT Printing',
        'Waiter 4-Digit PIN Profiles & Table Mapping',
        'Real-Time Revenue & Dish Analytics',
        'Priority Phone & WhatsApp Support',
      ],
      popular: true,
      cta: 'Request Growth Consultation',
    },
    {
      name: 'Enterprise & Multi-Location',
      tagline: 'For multi-location restaurant chains, hotel dining, and franchises.',
      price: 'Custom Enterprise Scope',
      priceSubtitle: 'Annual licensing with volume SLA',
      features: [
        'Everything in Growth, plus:',
        'Centralized Multi-Outlet Headquarter Dashboard',
        'Franchise Master Menu Catalog Distribution',
        'Custom ERP, Accounting & Gateway Bridges',
        'Dedicated Technical Account Manager',
        '99.9% Uptime Service Level Agreement (SLA)',
        'Custom On-Site Staff Onboarding',
      ],
      popular: false,
      cta: 'Contact Enterprise Sales',
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 border-b border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
            Flexible Licensing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Transparent plans tailored to your outlet.
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            Whether you operate an intimate 10-table bistro or a multi-location dining franchise, InByte scales with your floor plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`spotlight-card p-8 flex flex-col justify-between relative ${
                tier.popular ? 'border-emerald-500/40 bg-neutral-950/80 shadow-2xl shadow-emerald-500/5' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-emerald-400 text-black text-[10px] font-mono font-bold tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <p className="text-xs text-neutral-400 mt-2 min-h-[36px]">{tier.tagline}</p>

                <div className="my-6 pt-6 border-t border-white/[0.06]">
                  <div className="text-2xl font-bold text-white font-sans">{tier.price}</div>
                  <div className="text-xs text-neutral-500 font-mono mt-1">{tier.priceSubtitle}</div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
                    Included Capabilities
                  </span>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={onOpenDemo}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    tier.popular
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-400/10'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

