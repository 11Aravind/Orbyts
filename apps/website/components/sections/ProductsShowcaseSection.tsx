import React from 'react';
import { Sparkles } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import ProductCard from '../products/ProductCard';

export default function ProductsShowcaseSection() {
  return (
    <section id="products" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Product Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Useful tools. Thoughtfully built.
            </h2>
            <p className="mt-4 text-neutral-400 text-base sm:text-lg">
              Explore our suite of centralized software products, built to simplify work and drive real business momentum.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              ● 1 Production &bull; 3 Staging/Concept
            </span>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

