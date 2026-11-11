import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { PRODUCTS, Product } from '../../../data/products';

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) {
    return { title: 'Product Not Found — ORBYT' };
  }
  return {
    title: `${product.name} — ORBYT Software Solutions`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Back Link */}
        <div>
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Products</span>
          </Link>
        </div>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                {product.category}
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                {product.statusLabel}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              {product.name}
            </h1>

            <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed max-w-2xl">
              {product.tagline}
            </p>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
              {product.longDescription}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
              >
                <span>Request Scoping &amp; Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <span>Launch Live Showcase</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            {product.previewImage ? (
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 shadow-2xl">
                <Image
                  src={product.previewImage}
                  alt={`${product.name} Preview`}
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#0c0c0e] p-8 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Ecosystem Integration</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Engineered to deploy independently or communicate seamlessly across the ORBYT monorepo product ecosystem.
                </p>
                <div className="pt-4 border-t border-white/[0.08] text-xs font-mono text-neutral-500">
                  Built on modern Next.js, React, and TypeScript foundations.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="border-t border-white/[0.08] pt-16">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
              Capabilities
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">Core System Functionalities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.map((feat, idx) => (
              <div key={idx} className="spotlight-card p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-semibold text-white">{feat}</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Production-grade implementation with zero external runtime bloat and complete modular test coverage.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Breakdown */}
        <div className="border-t border-white/[0.08] pt-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
              Technology Stack
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Architectural Foundation</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {product.techStack.map((tech, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-neutral-300 font-mono text-xs flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="spotlight-card p-8 sm:p-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Interested in deploying {product.name}?
          </h3>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            Schedule a technical walk-through with our engineering team to review system contracts, API
            integrations, and deployment timelines.
          </p>
          <div className="pt-2">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
            >
              <span>Schedule Technical Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

