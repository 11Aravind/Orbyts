import React from 'react';

export default function HowWeWorkSection() {
  const stages = [
    {
      num: '01',
      title: 'Discover',
      desc: 'Deep dive into your core objectives, users, technical constraints, and desired outcomes.',
    },
    {
      num: '02',
      title: 'Plan',
      desc: 'Shape the user experience wireframes, database schemas, and architectural approach.',
    },
    {
      num: '03',
      title: 'Build',
      desc: 'Agile development sprints with frequent demos, clean maintainable code, and comprehensive unit tests.',
    },
    {
      num: '04',
      title: 'Secure',
      desc: 'Conduct rigorous vulnerability reviews, access verification, and security hardening before exposure.',
    },
    {
      num: '05',
      title: 'Launch',
      desc: 'Smooth deployment to production environments with real-time telemetry and monitoring.',
    },
    {
      num: '06',
      title: 'Support',
      desc: 'Continuous care, performance tuning, proactive security updates, and evolution as your business grows.',
    },
  ];

  return (
    <section id="how-we-work" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How we work together.
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            A structured, collaborative rhythm that takes projects from concept to working software smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage, idx) => (
            <div key={idx} className="spotlight-card p-6 relative">
              <div className="text-2xl font-mono font-bold text-cyan-400/60 mb-2">{stage.num}</div>
              <h3 className="text-lg font-bold text-white">{stage.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
