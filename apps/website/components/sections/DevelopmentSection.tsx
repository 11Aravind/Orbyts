import React from 'react';
import Link from 'next/link';
import { Globe, Smartphone, Laptop, CreditCard, Sliders, Cpu, ArrowRight } from 'lucide-react';

export default function DevelopmentSection() {
  const capabilities = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Web Platforms & Portals',
      desc: 'Responsive web apps, dashboards, and client portals built with modern frameworks and intuitive user experiences.',
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile Applications',
      desc: 'Cross-platform and native mobile apps designed for smooth performance, clean interactions, and offline readiness.',
    },
    {
      icon: <Laptop className="w-6 h-6" />,
      title: 'Desktop & Embedded Tools',
      desc: 'Fast, focused desktop and specialized software for specific hardware, point-of-sale setups, or internal tooling.',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Billing & Invoicing',
      desc: 'Automated invoicing pipelines, recurring subscriptions, payment reconciliation, and multi-currency financial workflows.',
    },
    {
      icon: <Sliders className="w-6 h-6" />,
      title: 'Operations & Management',
      desc: 'Tailored software systems to coordinate team schedules, track stock inventory, process orders, and streamline daily business flow.',
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'APIs & Integrations',
      desc: 'Robust backend microservices, webhooks, and third-party data bridges that keep your business software stack completely synchronized.',
    },
  ];

  return (
    <section id="development" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-purple-400 mb-3">
            Custom Development
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Ideas deserve better technology.
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            From focused web platforms to complete digital products, ORBYT turns your ideas into high-performance
            software built around real customer needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="spotlight-card p-8 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                {cap.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{cap.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
