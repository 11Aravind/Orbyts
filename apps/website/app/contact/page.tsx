import type { Metadata } from 'next';
import React from 'react';
import ContactSection from '../../components/sections/ContactSection';
import FaqSection from '../../components/sections/FaqSection';

export const metadata: Metadata = {
  title: 'Contact & Enterprise Scoping — ORBYT',
  description: 'Schedule a scoping call or request technical consultation with ORBYT.',
};

export default function ContactPage() {
  return (
    <div className="py-12">
      <ContactSection />
      <FaqSection />
    </div>
  );
}

