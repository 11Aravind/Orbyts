'use client';

import { Star, User } from 'lucide-react';
import { TESTIMONIALS } from './data/content';
import { Reveal, Section, SectionHeading } from './ui';

export default function InByteTestimonials() {
  return (
    <Section id="testimonials" tone="alt" labelledBy="testi-title">
      <SectionHeading
        id="testi-title"
        eyebrow="Testimonials"
        title="Trusted by Businesses That Want to Serve Better."
      />
      <div className="testi-grid">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.business} delay={i * 80}>
            <figure className="card testi">
              <span className="sample-tag">Customer review</span>
              <div className="stars" role="img" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} size={16} fill={k < t.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              <blockquote>{t.review}</blockquote>
              <figcaption>
                <span className="avatar" aria-hidden="true">
                  <User size={18} />
                </span>
                <div>
                  <b>{t.name}</b>
                  <small>{t.business}</small>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

