import type { Metadata } from 'next';
import React from 'react';
import ProductUniverseSection from '../../components/sections/ProductUniverseSection';

export const metadata: Metadata = {
  title: 'Products — ORBYT Software Ecosystem',
  description: 'Explore the ORBYT product suite: InByte (Dine), Commerce, Stock, and Flow.',
};

export default function ProductsPage() {
  return (
    <div className="py-12">
      <ProductUniverseSection />
    </div>
  );
}

