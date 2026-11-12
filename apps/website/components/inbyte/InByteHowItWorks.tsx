'use client';

import { STEPS } from './data/content';
import { Reveal, Section, SectionHeading } from './ui';
import { FeaturePreview } from './mockups/FeaturePreview';

export default function InByteHowItWorks() {
  return (
    <Section id="how-it-works" tone="blue" labelledBy="how-title">
      <SectionHeading
        id="how-title"
        eyebrow="How it works"
        title="From QR Scan to Food on the Table."
        subtitle="Four simple steps, and none of them need an app download."
      />
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <Reveal delay={i * 90}>
              <div className="step-card">
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="step-visual">
                  <FeaturePreview kind={s.preview} />
                </div>
                <h3>
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p>{s.description}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

