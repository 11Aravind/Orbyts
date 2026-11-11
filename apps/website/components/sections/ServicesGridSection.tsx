import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Globe,
  Smartphone,
  Monitor,
  Receipt,
  Briefcase,
  Layers,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function ServicesGridSection() {
  const services = [
    {
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      title: 'Custom Software Solutions',
      desc: 'Bespoke, end-to-end software built from the ground up to solve complex operational challenges with zero unnecessary technical debt.',
      tag: 'Tailored Architecture',
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      title: 'Web Applications',
      desc: 'High-performance web apps built on Next.js 15, React 19, and TypeScript, engineered for lightning-fast responsiveness and SEO visibility.',
      tag: 'Next.js & React',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-purple-400" />,
      title: 'Mobile Applications',
      desc: 'Progressive Web Apps (PWAs) and cross-platform mobile solutions featuring offline caching, instant load times, and push notifications.',
      tag: 'PWA & Mobile',
    },
    {
      icon: <Monitor className="w-5 h-5 text-blue-400" />,
      title: 'Desktop Applications',
      desc: 'Cross-platform desktop software for specialized retail, industrial, or internal operational workflows requiring local hardware connectivity.',
      tag: 'Cross-Platform',
    },
    {
      icon: <Receipt className="w-5 h-5 text-amber-400" />,
      title: 'Billing Software & POS',
      desc: 'Real-time billing engines supporting dual-mode table/counter billing, automated tax computation (GST/CGST/SGST), and 80mm ESC/POS thermal printing.',
      tag: 'POS & Thermal Print',
    },
    {
      icon: <Briefcase className="w-5 h-5 text-rose-400" />,
      title: 'Business Management Software',
      desc: 'Centralized platforms for staff management, live kitchen KDS kanban views, table reservations, and operational oversight.',
      tag: 'Operations & KDS',
    },
    {
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      title: 'SaaS Products',
      desc: 'Multi-tenant software-as-a-service platforms featuring automated customer onboarding, subscription billing, and secure webhooks.',
      tag: 'SaaS & Subscriptions',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Security & Code Hardening',
      desc: 'OWASP ASVS v4.0 code audits, API security reviews, and defensive hardening to eliminate vulnerabilities before release.',
      tag: 'Defensive Engineering',
    },
  ];

  return (
    <section id="services" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
              <span>Core Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Engineering solutions across the product spectrum.
            </h2>
            <p className="mt-4 text-neutral-400 text-base sm:text-lg">
              We design and construct production-grade software across web, mobile, desktop, and embedded retail
              environments.
            </p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 text-xs font-mono text-white hover:text-cyan-400 transition-colors"
          >
            <span>Request Custom Solution</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="spotlight-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {svc.icon}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {svc.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{svc.desc}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>{svc.tag}</span>
                <span className="text-neutral-600">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

