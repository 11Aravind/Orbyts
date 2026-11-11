import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Code2, ArrowRight } from 'lucide-react';

export default function ServicesOverviewSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            One Technology Partner
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Three ways to move forward.
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            Technology that simplifies business through smart software, secure engineering, and custom digital
            solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Software Products */}
          <div className="spotlight-card p-8 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-cyan-400">01 / SOFTWARE</div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Focused SaaS and operational tools designed around real workflows &mdash; from dining and commerce to
                inventory and automation.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>4 ECOSYSTEM PRODUCTS</span>
              <Link
                href="/#products"
                className="text-white flex items-center gap-1 group-hover:text-cyan-400 transition-colors"
              >
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Security Services */}
          <div className="spotlight-card p-8 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-emerald-400">02 / SECURITY</div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Professional vulnerability scanning, application penetration testing, and code-hardening assessments.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>6 ASSESSMENT MODULES</span>
              <Link
                href="/security"
                className="text-white flex items-center gap-1 group-hover:text-emerald-400 transition-colors"
              >
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Custom Development */}
          <div className="spotlight-card p-8 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-purple-400">03 / CUSTOM DEVELOPMENT</div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                End-to-end design and engineering for custom web platforms, mobile apps, desktop systems, and automation
                pipelines.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>END-TO-END SPRINTS</span>
              <Link
                href="/#development"
                className="text-white flex items-center gap-1 group-hover:text-purple-400 transition-colors"
              >
                Scope Project <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
