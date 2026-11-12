'use client';

import React from 'react';
import { BookingProvider } from './booking/BookingContext';
import { BookDemoModal } from './booking/BookDemoModal';
import InByteHero from './InByteHero';
import InByteProblemSolution from './InByteProblemSolution';
import InByteFeatures from './InByteFeatures';
import InByteHowItWorks from './InByteHowItWorks';
import InByteLiveDemo from './InByteLiveDemo';
import InByteUseCases from './InByteUseCases';
import InBytePricing from './InBytePricing';
import InByteTestimonials from './InByteTestimonials';
import InByteFaq from './InByteFaq';
import InByteFinalCta from './InByteFinalCta';

export default function InBytePageClient() {
  return (
    <BookingProvider>
      <div className="min-h-screen">
        {/* 1. Hero Section with Live Mockup & Floating Notifications */}
        <InByteHero />

        {/* 2. Before & After Problem / Solution Comparison */}
        <InByteProblemSolution />

        {/* 3. 10 Core Features with Rich Visual Previews */}
        <InByteFeatures />

        {/* 4. How It Works (4 Connected Steps) */}
        <InByteHowItWorks />

        {/* 5. Interactive Live Demo Phone Showcase */}
        <InByteLiveDemo />

        {/* 6. Built for Every Food Business Use Cases */}
        <InByteUseCases />

        {/* 7. Transparent Pricing with Monthly / Yearly Toggle */}
        <InBytePricing />

        {/* 8. Customer Testimonials */}
        <InByteTestimonials />

        {/* 9. Frequently Asked Questions */}
        <InByteFaq />

        {/* 10. Final Call to Action */}
        <InByteFinalCta />
      </div>

      {/* Interactive 4-Step Book Demo Modal */}
      <BookDemoModal />
    </BookingProvider>
  );
}

