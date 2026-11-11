import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import ServicesOverviewSection from '../components/sections/ServicesOverviewSection';
import ProductUniverseSection from '../components/sections/ProductUniverseSection';
import SecurityPreviewSection from '../components/sections/SecurityPreviewSection';
import DevelopmentSection from '../components/sections/DevelopmentSection';
import HowWeWorkSection from '../components/sections/HowWeWorkSection';
import AboutSection from '../components/sections/AboutSection';
import ShowcaseSection from '../components/sections/ShowcaseSection';
import FaqSection from '../components/sections/FaqSection';
import ContactSection from '../components/sections/ContactSection';

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section: 2-Column with Speedometer Gauge */}
      <HeroSection />

      {/* 2. Stats Summary Bar: 12+ Years, 100+ Companies, 500+ Customers, 99.8% Satisfaction */}
      <StatsSection />

      {/* 3. Three Core Pillars: 01 Software, 02 Security, 03 Custom Development */}
      <ServicesOverviewSection />

      {/* 4. The Product Universe: Innbite, Orbyt Commerce, Orbyt Stock + Modal */}
      <ProductUniverseSection />

      {/* 5. Digital Security Services: Assessment, OWASP Top 10 + Active Terminal Scanner */}
      <SecurityPreviewSection />

      {/* 6. Custom Development: Web, Mobile, Desktop, Billing, Operations, APIs */}
      <DevelopmentSection />

      {/* 7. How We Work: 6-Stage Process (Discover, Plan, Build, Secure, Launch, Support) */}
      <HowWeWorkSection />

      {/* 8. About ORBYT: "A technology partner for what comes next" + "What guides us" */}
      <AboutSection />

      {/* 8.5. Showcase Wall: What builders say about ORBYT (3-column masonry tweets) */}
      <ShowcaseSection />

      {/* 9. Frequently Asked Questions: 5-question accordion */}
      <FaqSection />

      {/* 10. Contact Form: Interest pills, inputs, and instant response */}
      <ContactSection />
    </>
  );
}
