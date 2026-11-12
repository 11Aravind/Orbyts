'use client';

import { ArrowRight, Calendar } from 'lucide-react';
import { SITE } from './data/site';
import { useBooking } from './booking/BookingContext';

export default function InByteFinalCta() {
  const { openBooking } = useBooking();
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="container max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8 final-inner">
        <h2 id="final-title">Ready to Make Your Restaurant Smarter?</h2>
        <p>
          Give your customers a faster, easier ordering experience while simplifying your restaurant operations.
        </p>
        <div className="cta-row center">
          <button type="button" onClick={openBooking} className="btn-pill-demo">
            <Calendar className="w-4 h-4 stroke-[2.2]" />
            <span>Book a demo</span>
          </button>
          <a href={SITE.trialUrl} target="_blank" rel="noopener noreferrer" className="btn-pill-trial">
            <span>Start free trial</span>
            <span className="btn-pill-arrow">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.6]" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

