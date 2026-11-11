'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function InByteFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do customers need to download an app from the App Store or Google Play?',
      a: 'No. InByte is 100% browser-based. When guests scan the table QR code with their default smartphone camera, the menu opens instantly in Safari, Chrome, or any mobile browser with zero installation, zero registration, and zero storage impact.',
    },
    {
      q: 'What hardware does InByte require in the kitchen and cashier desk?',
      a: 'InByte runs on any standard hardware you already own: iPads, Android tablets, touchscreen monitors, laptops, or even smartphones. Kitchen screens feature automated wake-lock technology so displays stay illuminated without sleeping.',
    },
    {
      q: 'How does thermal receipt and Kitchen Order Ticket (KOT) printing work?',
      a: 'InByte natively supports industry-standard ESC/POS 58mm and 80mm thermal printers over USB, Bluetooth, or LAN. When an order is confirmed, KOT tickets can be automatically dispatched directly to kitchen and bar stations.',
    },
    {
      q: 'What happens if our restaurant Wi-Fi experiences a momentary disruption?',
      a: 'InByte includes built-in offline tolerance. Customer carts are continuously synchronized to local device storage, ensuring selections and dish notes are never lost. If connectivity drops, clear visual banners alert staff while queuing requests for instant reconnection.',
    },
    {
      q: 'How does payment processing work?',
      a: 'InByte supports both digital at-table payments (via integrated Razorpay UPI, cards, and digital wallets) as well as traditional Pay-at-Counter cash and terminal card workflows. Cashiers can settle tables with one click from the Admin POS desk.',
    },
    {
      q: 'Can we update dish prices or mark sold-out items during a busy dinner rush?',
      a: 'Yes, instantly. From the manager or waiter portal, tapping the stock toggle on any dish immediately marks it as Out-of-Stock across every customer table QR menu in real time without refreshing pages.',
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 border-b border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
            InByte FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Frequently asked questions.
          </h2>
          <p className="mt-4 text-neutral-400 text-base">
            Common questions from restaurateurs, hospitality directors, and chefs.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="spotlight-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-neutral-400 border-t border-white/[0.04] pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

