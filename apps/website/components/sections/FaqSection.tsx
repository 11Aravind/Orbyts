'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What does ORBYT actually do?',
      a: 'ORBYT operates across three core domains: developing proprietary software products (like our QR dining platform, commerce tools, and inventory systems), performing practical cybersecurity assessments and hardening, and engineering bespoke software solutions for growing businesses.',
    },
    {
      q: 'Can I request a demo or consultation before committing?',
      a: 'Yes, absolutely. We offer initial technical scoping calls and product walk-throughs to discuss your specific requirements, evaluate your current stack, and map out a tailored solution.',
    },
    {
      q: 'Do you build custom software tailored to specific workflows?',
      a: 'Yes. In addition to our modular product family, our engineering team regularly builds custom web applications, mobile platforms, API gateways, and operational tools designed around your unique operational parameters.',
    },
    {
      q: 'What is included in a security assessment?',
      a: 'Our assessments cover agreed scopes including endpoint vulnerability scanning, authentication and access audits, API boundary checks, web application security (OWASP Top 10), and server configuration review, followed by prioritized executive and developer remediation reports.',
    },
    {
      q: 'When are the upcoming software products releasing?',
      a: 'Orbyt Dine, Commerce, Stock, and Flow are currently in concept and active staging phases. You can join the early-access list via our contact form to receive release dates, beta previews, and early onboarding priority.',
    },
  ];

  return (
    <section id="faq" className="py-24 border-t border-neutral-200 dark:border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-3">FAQ</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Frequently asked questions.
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-base">A few things you might be wondering about ORBYT.</p>
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
                  <span className="font-semibold text-neutral-900 dark:text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-200/80 dark:border-white/[0.04] pt-4 leading-relaxed">
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
