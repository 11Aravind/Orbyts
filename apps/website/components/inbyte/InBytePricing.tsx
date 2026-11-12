'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANS, type Plan } from './data/pricing';
import { Button, Reveal, Section, SectionHeading } from './ui';
import { useBooking } from './booking/BookingContext';

function formatPrice(plan: Plan, yearly: boolean): string | null {
  const v = yearly ? plan.priceYearly : plan.priceMonthly;
  return v === null ? null : `${plan.currency}${v.toLocaleString('en-IN')}`;
}

export default function InBytePricing() {
  const [yearly, setYearly] = useState(false);
  const { openBooking } = useBooking();
  const anyPlaceholder = PLANS.some((p) => p.isPlaceholder);

  return (
    <Section id="pricing" labelledBy="pricing-title">
      <SectionHeading
        id="pricing-title"
        eyebrow="Pricing"
        title="Simple Plans for Smarter Restaurant Operations."
        subtitle="Pick a plan that matches the size of your business."
      />
      <div className="billing-toggle" role="group" aria-label="Billing period">
        <button type="button" aria-pressed={!yearly} className={!yearly ? 'is-active' : ''} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button type="button" aria-pressed={yearly} className={yearly ? 'is-active' : ''} onClick={() => setYearly(true)}>
          Yearly
        </button>
      </div>

      <div className="plans">
        {PLANS.map((p, i) => {
          const price = formatPrice(p, yearly);
          return (
            <Reveal key={p.id} delay={i * 80}>
              <article className={'card plan' + (p.recommended ? ' is-recommended' : '')}>
                {p.recommended && <span className="plan-badge">Recommended</span>}
                <h3>{p.name}</h3>
                <p className="plan-desc">{p.description}</p>
                <div className="plan-price">
                  {price ? (
                    <>
                      <b>{price}</b>
                      <span>/ {yearly ? 'year' : 'month'}</span>
                    </>
                  ) : (
                    <b className="plan-contact">Contact for Pricing</b>
                  )}
                </div>
                {p.isPlaceholder && price && <span className="plan-sample">Sample price, editable placeholder</span>}
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>
                      <Check size={16} aria-hidden="true" /> {f}
                    </li>
                  ))}
                </ul>
                {p.cta === 'subscribe' ? (
                  <Button variant={p.recommended ? 'primary' : 'secondary'} onClick={openBooking}>
                    Subscribe
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={openBooking}>
                    Contact Us
                  </Button>
                )}
              </article>
            </Reveal>
          );
        })}
      </div>
      {anyPlaceholder && (
        <p className="fine-print">
          Prices shown are sample placeholders. Plans are loaded from <code>components/inbyte/data/pricing.ts</code>.
        </p>
      )}
    </Section>
  );
}
