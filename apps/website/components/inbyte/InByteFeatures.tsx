'use client';

import { FEATURES } from './data/content';
import { Reveal, Section, SectionHeading } from './ui';
import { FeaturePreview } from './mockups/FeaturePreview';

export default function InByteFeatures() {
  return (
    <Section id="features" labelledBy="features-title">
      <SectionHeading
        id="features-title"
        eyebrow="Features"
        title="Everything Your Restaurant Needs to Serve Smarter."
        subtitle="From the first scan to the last status update, every step of the order is covered."
      />
      <div className="feature-grid">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 70}>
            <article className="card feature-card">
              <div className="feature-preview">
                <FeaturePreview kind={f.preview} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
