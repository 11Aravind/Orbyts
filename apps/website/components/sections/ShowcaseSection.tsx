import React from 'react';

export default function ShowcaseSection() {
  const col1 = [
    {
      initials: 'AR',
      name: 'Arjun Rao',
      handle: '@arjunrao_fnb',
      avatarGradient: 'from-[#FF1E56]/20 to-[#0196FF]/30 text-white',
      content: (
        <>
          <p>
            🤯 We rolled out <strong>@innbite</strong> across 14 restaurant locations in under two weeks. Customers
            scan the table QR, order instantly, and our table turnover jumped by 32%.
          </p>
          <p className="text-neutral-500 text-xs">That&apos;s without touching any clunky POS hardware. Nuts.</p>
        </>
      ),
    },
    {
      initials: 'SJ',
      name: 'Sarah Jenkins',
      handle: '@sarahj_eng',
      avatarGradient: 'from-cyan-500/20 to-blue-500/20 text-cyan-300',
      content: (
        <p>
          Working with @orbyt completely transformed our engineering velocity. They took our platform concept from
          architectural design to production without cutting a single corner on security.
        </p>
      ),
    },
    {
      initials: 'ER',
      name: 'Elena Rostova',
      handle: '@erostova_tech',
      avatarGradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-300',
      content: (
        <p>
          Cut our deployment and testing cycle in half while bulletproofing our customer data infrastructure. Best tech
          partnership our startup has made.
        </p>
      ),
    },
  ];

  const col2 = [
    {
      initials: 'DM',
      name: 'David Miller',
      handle: '@davidm_cto',
      avatarGradient: 'from-purple-500/20 to-indigo-500/20 text-purple-300',
      content: (
        <p>
          The level of architectural discipline ORBYT brings is unmatched. Our enterprise SOC-2 and cloud security
          review passed on the very first submission.
        </p>
      ),
    },
    {
      initials: 'SG',
      name: 'Shrey Gupta',
      handle: '@shreygups',
      avatarGradient: 'from-amber-500/20 to-orange-500/20 text-amber-300',
      content: (
        <p>
          wait i kinda love Innbite. Zero friction for dining guests, scans in half a second, and orders hit the kitchen
          instantly.
        </p>
      ),
    },
    {
      initials: 'PA',
      name: 'Pontus Abrahamsson',
      handle: '@pontusab',
      avatarGradient: 'from-pink-500/20 to-rose-500/20 text-rose-300',
      content: (
        <p>
          12+ years of engineering experience really shows in how ORBYT structures client deliverables. Clean, scalable,
          zero technical debt 🔥
        </p>
      ),
    },
  ];

  const col3 = [
    {
      initials: 'KP',
      name: 'Kavita Patel',
      handle: '@kavitap_vp',
      avatarGradient: 'from-blue-500/20 to-indigo-500/20 text-blue-300',
      content: (
        <p>
          ORBYT feels less like an external agency and more like our core founding engineering team. Fast, dependable,
          and always thoughtfully built.
        </p>
      ),
    },
    {
      initials: 'AL',
      name: 'Andrew Lisowski',
      handle: '@HipsterSmoothie',
      avatarGradient: 'from-emerald-500/20 to-cyan-500/20 text-emerald-300',
      content: (
        <p>
          Just setting up @orbyt&apos;s architecture in our front-end and microservices cut our cloud bill in half and
          saved us months of wasted rework.
        </p>
      ),
    },
  ];

  const renderCard = (tweet: (typeof col1)[0], idx: number) => (
    <div
      key={idx}
      className="flex flex-col gap-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e]/80 p-5 transition-all duration-200 hover:border-white/20 hover:bg-neutral-900/40"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-tr ${tweet.avatarGradient} border border-white/10 flex items-center justify-center font-semibold text-xs`}
          >
            {tweet.initials}
          </div>
          <div className="flex flex-col">
            <div className="font-medium text-white text-sm">{tweet.name}</div>
            <div className="text-neutral-500 text-xs">{tweet.handle}</div>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-500 opacity-60">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <div className="flex flex-col gap-2.5 text-neutral-300 text-sm leading-relaxed">{tweet.content}</div>
    </div>
  );

  return (
    <section id="testimonials" className="py-16 sm:py-24 border-t border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 flex max-w-[640px] flex-col items-center justify-center text-center">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Showcase</div>
          <h2 className="text-[28px] sm:text-[34px] font-[450] tracking-[-0.02em] leading-tight text-white">
            What builders say about ORBYT
          </h2>
          <p className="mt-4 text-neutral-400 text-sm sm:text-base text-balance font-normal">
            See how founders, operators, and engineering leads build, secure, and scale with our products and team.
          </p>
        </div>

        {/* 3-Column Responsive Masonry Grid matching original */}
        <div className="mb-6 grid grid-cols-1 gap-6 min-[780px]:grid-cols-3">
          <div className="grid gap-6 auto-rows-max">{col1.map(renderCard)}</div>
          <div className="grid gap-6 auto-rows-max">{col2.map(renderCard)}</div>
          <div className="grid gap-6 auto-rows-max">{col3.map(renderCard)}</div>
        </div>
      </div>
    </section>
  );
}
