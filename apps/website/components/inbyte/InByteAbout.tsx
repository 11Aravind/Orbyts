import React from 'react';
import { Clock, DollarSign, AlertCircle, TrendingUp, UtensilsCrossed, Coffee, Building2, Store } from 'lucide-react';

export default function InByteAbout() {
  const problems = [
    {
      icon: <Clock className="w-5 h-5 text-red-500" />,
      title: 'Wait Staff Bottlenecks',
      desc: 'Guests wait 10-15 minutes just to catch a waiter’s attention for menus, refills, or checks during rush hours.',
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      title: 'Order Miscommunication & Errors',
      desc: 'Handwritten slips and noisy dining floors result in wrong modifiers, food allergies ignored, and expensive meal refunds.',
    },
    {
      icon: <DollarSign className="w-5 h-5 text-cyan-500" />,
      title: 'Paper Reprint & POS Costs',
      desc: 'Restaurants spend $500–$2,000 annually reprinting paper cards whenever prices shift, plus proprietary hardware lock-ins.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      title: 'Slow Table Turnover',
      desc: 'Delays in taking orders and processing paper checks prevent dining rooms from seating waiting guests during peak evening windows.',
    },
  ];

  const venueTypes = [
    {
      title: 'Casual & Fine Dining',
      desc: 'Elevate hospitality with contactless digital menus, sommelier recommendations, and instant table service calling.',
      icon: <UtensilsCrossed className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    },
    {
      title: 'Cafes & Bakeries',
      desc: 'High-volume coffee counters and brunch spots with seamless seat-and-order flows that keep lines moving.',
      icon: <Coffee className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
    },
    {
      title: 'Breweries, Bars & Lounges',
      desc: 'Guests order rounds of craft drinks directly from tables or booths without pushing through crowded bars.',
      icon: <Building2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
    },
    {
      title: 'Food Courts & Cloud Kitchens',
      desc: 'Centralized ordering for multiple preparation stations with unified Kitchen Display System (KDS) dispatching.',
      icon: <Store className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
    },
  ];

  return (
    <section className="py-20 lg:py-28 border-b border-neutral-200 dark:border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Intro */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">About InByte</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Built from real kitchen grit to empower modern hospitality.
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-base sm:text-lg leading-relaxed">
            InByte was engineered to bridge the disconnect between the guest table, the kitchen line, and the
            manager&apos;s desk. By treating customer smartphones as intelligent ordering endpoints and pairing them
            with an edge-synced Kitchen Display System, InByte streamlines dining from the first scan to final payment.
          </p>
        </div>

        {/* Problems Solved */}
        <div>
          <div className="mb-8">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">The Challenges We Eliminate</span>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">Why modern restaurants switch to InByte.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((p, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 flex items-center justify-center mb-4">
                    {p.icon}
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">{p.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-white/[0.06] text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Resolved by InByte Flow
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who Can Use It */}
        <div>
          <div className="mb-8">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Built For Your Operation</span>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">Versatile hospitality deployment.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {venueTypes.map((v, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 flex items-center justify-center mb-4">
                    {v.icon}
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">{v.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{v.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-white/[0.06] text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  Full Feature Compatibility
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


