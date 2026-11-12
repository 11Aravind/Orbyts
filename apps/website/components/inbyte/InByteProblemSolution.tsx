'use client';

import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { PROBLEM_SOLUTIONS } from './data/content';
import { Reveal, Section, SectionHeading } from './ui';

export default function InByteProblemSolution() {
  return (
    <Section id="problem" tone="alt" labelledBy="problem-title">
      <SectionHeading
        id="problem-title"
        eyebrow="Before and after"
        title="Restaurant Ordering, Without the Usual Hassle."
        subtitle="The everyday friction between guests and staff, and how Innbites removes it."
      />
      <div className="ps-head" aria-hidden="true">
        <span>Without Innbites</span>
        <span />
        <span>With Innbites</span>
      </div>
      <ul className="ps-list">
        {PROBLEM_SOLUTIONS.map((row, i) => (
          <li key={row.problem}>
            <Reveal delay={i * 60} className="ps-row">
              <div className="ps-card ps-bad">
                <XCircle size={20} aria-hidden="true" />
                <p>
                  <span className="sr-only">Problem: </span>
                  {row.problem}
                </p>
              </div>
              <ArrowRight className="ps-arrow" size={20} aria-hidden="true" />
              <div className="ps-card ps-good">
                <CheckCircle2 size={20} aria-hidden="true" />
                <p>
                  <span className="sr-only">Solution: </span>
                  {row.solution}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

