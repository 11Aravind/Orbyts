'use client';

import React, { useRef } from 'react';
import InByteHero from '../../../components/inbyte/InByteHero';
import InByteAbout from '../../../components/inbyte/InByteAbout';
import InByteFeatures from '../../../components/inbyte/InByteFeatures';
import InByteScreenshots from '../../../components/inbyte/InByteScreenshots';
import InByteWorkflow from '../../../components/inbyte/InByteWorkflow';
import InBytePricing from '../../../components/inbyte/InBytePricing';
import InByteDemoSection from '../../../components/inbyte/InByteDemoSection';
import InByteFaq from '../../../components/inbyte/InByteFaq';
import InByteCta from '../../../components/inbyte/InByteCta';

export default function InByteProductPage() {
  const handleScrollToDemo = () => {
    const demoEl = document.getElementById('demo');
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <InByteHero onOpenDemo={handleScrollToDemo} />

      {/* 2. About InByte */}
      <InByteAbout />

      {/* 3. Core Features */}
      <InByteFeatures />

      {/* 4. Interactive Interface Showcase */}
      <InByteScreenshots />

      {/* 5. How It Works (4-Step Workflow) */}
      <InByteWorkflow />

      {/* 6. Pricing Section */}
      <InBytePricing onOpenDemo={handleScrollToDemo} />

      {/* 7. Live Demo Request Form */}
      <InByteDemoSection />

      {/* 8. Frequently Asked Questions */}
      <InByteFaq />

      {/* 9. Final CTA */}
      <InByteCta onOpenDemo={handleScrollToDemo} />
    </div>
  );
}

