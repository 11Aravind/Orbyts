import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { Product } from '../../data/products';

export default function ProductCard({ product }: { product: Product }) {
  const isProduction = product.status === 'production';

  return (
    <div className="spotlight-card p-6 sm:p-8 flex flex-col justify-between group overflow-hidden h-full">
      <div className="space-y-5">
        {/* Header: Logo, Category, Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <Image
                src={product.logo}
                alt={`${product.name} Logo`}
                width={28}
                height={28}
                className="object-contain h-7 w-auto dark:invert-0 invert"
              />
            </div>
            <div>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                {product.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {product.name}
              </h3>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-mono border shrink-0 ${
              isProduction
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10'
            }`}
          >
            {product.statusLabel}
          </span>
        </div>

        {/* Short description */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{product.description}</p>

        {/* Optional preview image */}
        {product.previewImage && (
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={product.previewImage}
              alt={`${product.name} preview`}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Main Features */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Key Capabilities
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            {product.features.map((feature, fIdx) => (
              <li key={fIdx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer with Actions: View Details + Live Demo */}
      <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {product.techStack.slice(0, 3).map((tech, tIdx) => (
            <span
              key={tIdx}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.03] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/5"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {product.demoUrl && (
            <Link
              href={product.demoUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/20 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <span>Demo</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          <Link
            href={product.detailsUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

