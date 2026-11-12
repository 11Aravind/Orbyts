'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './data/content';
import { Section, SectionHeading } from './ui';

export default function InByteFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" labelledBy="faq-title">
      <SectionHeading
        id="faq-title"
        eyebrow="FAQ"
        title="Frequently Asked Questions."
        subtitle="Common questions about Innbites and QR ordering."
      />
      <div className="faq">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} />
                </button>
              </h3>
              {isOpen && (
                <div role="region">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
