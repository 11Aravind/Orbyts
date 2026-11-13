import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function SecurityPreviewSection() {
  return (
    <section id="security" className="py-20 sm:py-28 border-t border-white/[0.08] relative overflow-hidden">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context, Methodology, Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Digital Security Services</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.15]">
              Software security before the breach happens.
            </h2>

            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl">
              We conduct targeted web security assessments, code architecture audits, and vulnerability
              hardening to give founders and engineering leaders uncompromised peace of mind.
            </p>

            {/* Feature Checklist Matching Original Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Full OWASP Top 10 Audits</div>
                  <div className="text-xs text-neutral-400">Deep manual inspection eliminating automated false alarms.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Zero False-Positive Guarantee</div>
                  <div className="text-xs text-neutral-400">Every vulnerability verified with reproducible exploit PoCs.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Developer-Ready Code Fixes</div>
                  <div className="text-xs text-neutral-400">Exact code patches and configuration snippets included.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Signed Mutual NDA</div>
                  <div className="text-xs text-neutral-400">Strict confidentiality guaranteed prior to any technical disclosure.</div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Detail Page + Scope Request */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/security"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-black bg-white hover:bg-neutral-200 transition-colors shadow-sm"
              >
                <span>View Full Security Scope &amp; Detail Page</span>
                <span className="text-xs">&rarr;</span>
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-neutral-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.02] transition-colors"
              >
                <span>Request Assessment</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Minimal Interactive Terminal Audit Inspector Widget */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl overflow-hidden">
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-neutral-900/60 font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 text-neutral-300 font-mono text-[11px]">orbyt-security-audit.sh</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">ACTIVE SCAN</span>
              </div>

              {/* Terminal Output Stream */}
              <div className="p-5 font-mono text-xs leading-6 space-y-2 text-neutral-300">
                <div className="text-neutral-500">$ orbyt audit --target api.production.app</div>
                <div className="text-neutral-400 text-[11px]">[INIT] Loading OWASP ASVS v4.0 verification framework...</div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-neutral-400">SSL/TLS Configuration</span>
                  <span className="text-emerald-400 font-medium">A+ Grade (TLS 1.3)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">HTTP Hardening Headers</span>
                  <span className="text-emerald-400 font-medium">CSP / HSTS Enforced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">API Auth &amp; Rate Limits</span>
                  <span className="text-emerald-400 font-medium">No Gaps Detected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">RBAC Token Verification</span>
                  <span className="text-emerald-400 font-medium">Isolated Boundaries</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Injection / XSS Defense</span>
                  <span className="text-emerald-400 font-medium">Sanitized &amp; Validated</span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Assessment Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium text-[11px]">
                    Audit Ready
                  </span>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="px-5 py-3 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Methodology: OWASP Top 10 + NIST</span>
                <Link
                  href="/security"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <span>Explore detail</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
