'use client';

import { Cloud, Coffee, Croissant, Hotel, Sandwich, Store, Truck, Utensils } from 'lucide-react';
import { USE_CASES, type UseCaseIcon } from './data/content';
import { Reveal, Section, SectionHeading } from './ui';

const ICONS: Record<UseCaseIcon, typeof Utensils> = {
  utensils: Utensils,
  coffee: Coffee,
  croissant: Croissant,
  hotel: Hotel,
  store: Store,
  cloud: Cloud,
  sandwich: Sandwich,
  truck: Truck,
};

export default function InByteUseCases() {
  return (
    <Section id="use-cases" labelledBy="use-title">
      <SectionHeading
        id="use-title"
        eyebrow="Who it is for"
        title="One Platform. Every Food Business."
        subtitle="If guests order food and you want it simpler, Innbites fits."
      />
      <div className="use-grid">
        {USE_CASES.map((u, i) => {
          const Icon = ICONS[u.icon];
          return (
            <Reveal key={u.title} delay={(i % 4) * 60}>
              <article className="card use-card">
                <span className="use-icon">
                  <Icon size={24} />
                </span>
                <h3>{u.title}</h3>
                <p>{u.description}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

