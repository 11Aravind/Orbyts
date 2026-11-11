import React from 'react';
import { Layers, Server, Cpu, Terminal } from 'lucide-react';

export default function TechStackSection() {
  const categories = [
    {
      title: 'Frontend & Client Architecture',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      items: [
        { name: 'React 19', role: 'Latest concurrent UI primitives' },
        { name: 'Next.js 15', role: 'App Router, SSR & static generation' },
        { name: 'TypeScript', role: 'Strict end-to-end type safety' },
        { name: 'Tailwind CSS', role: 'Utility styling & shared design tokens' },
      ],
    },
    {
      title: 'Backend, Database & Cloud',
      icon: <Server className="w-4 h-4 text-emerald-400" />,
      items: [
        { name: 'Supabase', role: 'PostgreSQL 15+, RLS & Auth' },
        { name: 'Cloudflare R2', role: 'S3-compatible distributed media bucket' },
        { name: 'Serverless APIs', role: 'Node.js edge execution & route handlers' },
        { name: 'WebSockets', role: 'Sub-second real-time state synchronization' },
      ],
    },
    {
      title: 'Monorepo & Build Tooling',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      items: [
        { name: 'Turborepo', role: 'High-performance build cache & pipelines' },
        { name: 'PNPM Workspaces', role: 'Strict symlink package isolation' },
        { name: 'Vite 6', role: 'Instant HMR development server' },
        { name: 'Playwright', role: 'Automated cross-browser E2E testing' },
      ],
    },
    {
      title: 'Hardware & Integrations',
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      items: [
        { name: 'ESC/POS Printer', role: 'Direct 80mm thermal receipt generation' },
        { name: 'Web Push (VAPID)', role: 'Background lock-screen notifications' },
        { name: 'Razorpay SDK', role: 'Secure online payment checkout' },
        { name: 'HTML5 QR Scanner', role: 'Sub-second camera code resolution' },
      ],
    },
  ];

  return (
    <section className="py-24 border-t border-white/[0.08] relative bg-neutral-950/40">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
            <span>Modern Engineering Foundation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Built on transparent, production-proven technologies.
          </h2>
          <p className="mt-4 text-neutral-400 text-base">
            Every layer of our software ecosystem is engineered with modern standards for longevity, maintainability,
            and peak runtime performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="spotlight-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/[0.08]">
                  {cat.icon}
                  <h3 className="font-semibold text-white text-sm">{cat.title}</h3>
                </div>

                <div className="space-y-3.5">
                  {cat.items.map((item, iIdx) => (
                    <div key={iIdx} className="space-y-0.5">
                      <div className="text-xs font-mono text-neutral-200 font-medium">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-snug">
                        {item.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>Production Stack</span>
                <span className="text-emerald-400">&bull; Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

