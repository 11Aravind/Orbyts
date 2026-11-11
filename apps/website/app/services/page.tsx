import type { Metadata } from 'next';
import React from 'react';
import ServicesOverviewSection from '../../components/sections/ServicesOverviewSection';
import SecurityPreviewSection from '../../components/sections/SecurityPreviewSection';
import DevelopmentSection from '../../components/sections/DevelopmentSection';

export const metadata: Metadata = {
  title: 'Services — ORBYT',
  description: 'Digital security assessments, web applications, and custom engineering services.',
};

export default function ServicesPage() {
  return (
    <div className="py-12">
      <ServicesOverviewSection />
      <SecurityPreviewSection />
      <DevelopmentSection />
    </div>
  );
}

