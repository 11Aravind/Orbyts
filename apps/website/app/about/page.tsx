import type { Metadata } from 'next';
import React from 'react';
import AboutSection from '../../components/sections/AboutSection';
import ShowcaseSection from '../../components/sections/ShowcaseSection';

export const metadata: Metadata = {
  title: 'About — ORBYT',
  description: 'Our engineering philosophy, principles, and team standards.',
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <AboutSection />
      <ShowcaseSection />
    </div>
  );
}

