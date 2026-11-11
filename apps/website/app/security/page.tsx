'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SecurityPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [assessmentType, setAssessmentType] = useState('Full Web Application & API Assessment');
  const [notes, setNotes] = useState('');

  const handleSecurityForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="flex-1">
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-neutral-400">Services</span>
            <span>/</span>
            <span className="text-emerald-400">Security Engineering</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Security Engineering &amp; Vulnerability Assessment</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-[450] tracking-[-0.03em] text-white leading-[1.1]">
              Build with confidence.
              <br />
              <span className="text-neutral-400 font-normal">Protect what matters.</span>
            </h1>

            <p className="mt-6 text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Practical security reviews, application penetration testing, and defensive hardening tailored for growing
              digital products and cloud-native architectures.
            </p>

            {/* Metric Highlights Bar */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] pt-8">
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">OWASP Top 10</div>
                <div className="text-xs text-neutral-400 mt-1">Full Coverage Testing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">Zero False-Positives</div>
                <div className="text-xs text-neutral-400 mt-1">Verified Exploits Only</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">Developer-Ready</div>
                <div className="text-xs text-neutral-400 mt-1">Actionable Code Patches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">Signed Mutual NDA</div>
                <div className="text-xs text-neutral-400 mt-1">Strict Confidentiality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: METHODOLOGY / PROCESS */}
      <section className="py-20 border-b border-white/[0.08]">
        <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Our Methodology</div>
            <h2 className="text-3xl sm:text-4xl font-[450] tracking-[-0.02em] text-white">
              How we assess and protect your systems.
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              A disciplined 4-stage framework that combines automated discovery with deep manual penetration testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-neutral-500 mb-4">PHASE 01</div>
                <h3 className="text-lg font-semibold text-white">Scope &amp; Threat Modeling</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Explicit definition of authorized endpoints, domains, repositories, and user roles. Threat modeling aligns
                  our testing directly with your business risk profile.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-mono text-emerald-400">
                Authorized boundaries established
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-neutral-500 mb-4">PHASE 02</div>
                <h3 className="text-lg font-semibold text-white">Vulnerability Discovery</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Passive and active reconnaissance covering input handling, token validation, access controls, injection
                  points, and HTTP configuration hygiene.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-mono text-emerald-400">
                Automated scan + Manual inspection
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-neutral-500 mb-4">PHASE 03</div>
                <h3 className="text-lg font-semibold text-white">Verification &amp; Proof-of-Concept</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Every detected anomaly is manually confirmed and assigned a CVSS v3.1 risk score. We eliminate scanner
                  noise and deliver reproducible steps.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-mono text-emerald-400">
                Zero false-positive guarantee
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-neutral-500 mb-4">PHASE 04</div>
                <h3 className="text-lg font-semibold text-white">Remediation &amp; Re-Test</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  Engineers receive clear code patches, configuration snippets, and a 1-on-1 debrief. Once applied, we
                  re-test to verify resolution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-mono text-emerald-400">
                Post-remediation validation included
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 6 CORE SERVICES IN DETAIL */}
      <section className="py-20 border-b border-white/[0.08]">
        <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Capabilities</div>
            <h2 className="text-3xl sm:text-4xl font-[450] tracking-[-0.02em] text-white">
              Targeted security assessments for every layer.
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              Choose standalone reviews or comprehensive multi-tier assessments designed around your roadmap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 font-mono text-sm font-semibold">
                  01
                </div>
                <h3 className="text-xl font-semibold text-white">Website Security Assessment</h3>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                  Audit external digital perimeter to uncover exposed admin routes, subdomain takeovers, DNS
                  misconfigurations, outdated third-party scripts, and public asset exposures.
                </p>
                <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> SSL/TLS Cipher Suites &amp; Certificate Hygiene
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Exposed Endpoints &amp; Information Leakage
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> DNS Hygiene &amp; Subdomain Takeover Vectors
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Deliverable:</span>
                <span className="text-white">Perimeter Exposure Report</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 font-mono text-sm font-semibold">
                  02
                </div>
                <h3 className="text-xl font-semibold text-white">Web Application Security</h3>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                  Deep inspection of client and server business logic, input sanitization, cross-site scripting (XSS), SQL
                  injection, server-side request forgery (SSRF), and state handling flaws.
                </p>
                <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> OWASP Top 10 Full Attack Matrix
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Business Logic &amp; Privilege Escalation
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> File Upload, SSRF &amp; Deserialization Flaws
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Deliverable:</span>
                <span className="text-white">Exploitation &amp; PoC Report</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 font-mono text-sm font-semibold">
                  03
                </div>
                <h3 className="text-xl font-semibold text-white">API Security Review</h3>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                  Audit REST and GraphQL endpoints for Broken Object-Level Authorization (BOLA), mass assignment vulnerabilities,
                  rate limiting bypasses, and accidental data leakage in JSON payloads.
                </p>
                <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> OWASP API Security Top 10
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> BOLA / IDOR Authorization Flaws
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Rate Limiting &amp; Replay Attack Resistance
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Deliverable:</span>
                <span className="text-white">API Threat &amp; Endpoint Audit</span>
              </div>
            </div>

            {/* Service 4 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 font-mono text-sm font-semibold">
                  04
                </div>
                <h3 className="text-xl font-semibold text-white">Security Hardening</h3>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                  Harden HTTP response headers, eliminate unnecessary headers that leak version fingerprints, enforce strict
                  CORS policies, and configure edge firewalls properly.
                </p>
                <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Strict CSP, HSTS &amp; Permissions-Policy
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> CORS Whitelist Configuration
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Cloudflare / Vercel Edge WAF Rules
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Deliverable:</span>
                <span className="text-white">Production Hardening Configs</span>
              </div>
            </div>

            {/* Service 5 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 font-mono text-sm font-semibold">
                  05
                </div>
                <h3 className="text-xl font-semibold text-white">Authentication &amp; Access</h3>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                  Review credential handling, password reset workflows, OAuth/SAML implementations, JWT cryptographic
                  signatures, session timeouts, and role-based permissions.
                </p>
                <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> JWT Token Lifecycles &amp; Revocation
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> MFA Implementation &amp; Recovery Codes
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Zero-Trust Role Isolation (RBAC)
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Deliverable:</span>
                <span className="text-white">Auth Architecture Review</span>
              </div>
            </div>

            {/* Service 6 */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 font-mono text-sm font-semibold">
                  06
                </div>
                <h3 className="text-xl font-semibold text-white">Findings &amp; Guidance</h3>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                  Receive prioritized reports written for software engineers, complete with exact code snippets,
                  framework-specific fixes, and executive risk summaries.
                </p>
                <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-neutral-300 font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Prioritized Vulnerability Backlog
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> Copy-Paste Developer Code Patches
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&bull;</span> 1-on-1 Engineering Debrief Call
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Deliverable:</span>
                <span className="text-white">Executive &amp; Technical Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: STANDARDS & COMPLIANCE */}
      <section className="py-20 border-b border-white/[0.08] bg-neutral-950/40">
        <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Industry Standards</div>
            <h2 className="text-3xl sm:text-4xl font-[450] tracking-[-0.02em] text-white">
              Aligned with recognized frameworks.
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              Our assessments ensure your systems meet modern compliance and customer security demands.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
              <div className="text-white font-semibold text-lg font-mono">OWASP ASVS</div>
              <div className="text-neutral-400 text-xs mt-2">Application Security Verification Standard</div>
            </div>
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
              <div className="text-white font-semibold text-lg font-mono">CWE / SANS Top 25</div>
              <div className="text-neutral-400 text-xs mt-2">Most Dangerous Software Weaknesses</div>
            </div>
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
              <div className="text-white font-semibold text-lg font-mono">NIST SP 800-115</div>
              <div className="text-neutral-400 text-xs mt-2">Information Security Testing Guidelines</div>
            </div>
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
              <div className="text-white font-semibold text-lg font-mono">SOC-2 Readiness</div>
              <div className="text-neutral-400 text-xs mt-2">Vendor Due-Diligence Audit Prep</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SCOPE REQUEST FORM */}
      <section id="assessment-scope" className="py-20">
        <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-8 sm:p-12">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="inline-block text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
                Rules of Engagement
              </span>
              <h2 className="text-3xl font-[450] tracking-[-0.02em] text-white">Start with a clearly defined scope.</h2>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                Security testing is performed only with explicit authorization and an agreed target boundary. Tell us about
                your application to discuss scope, timeline, and deliverables.
              </p>
            </div>

            <form onSubmit={handleSecurityForm} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2">FULL NAME *</label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2">WORK EMAIL *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2">TARGET DOMAIN / APP URL *</label>
                  <input
                    required
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://api.yourbrand.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2">ASSESSMENT TYPE *</label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#121215] border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-sm"
                  >
                    <option>Full Web Application &amp; API Assessment</option>
                    <option>API Security Review</option>
                    <option>Website Security Baseline</option>
                    <option>Security Hardening &amp; Cloud Config</option>
                    <option>Pre-Launch / SOC-2 Vendor Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">KEY CONCERNS OR TIMELINE</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the technology stack, upcoming launch date, or specific compliance objectives..."
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-neutral-500 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Protected by Mutual Non-Disclosure Agreement (NDA)</span>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-medium text-sm transition-colors whitespace-nowrap shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting Scope...' : 'Request Security Scope'}
                </button>
              </div>

              {submitted && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm">
                  ✓ Thank you. We have received your scope request and will review within 24 hours under NDA.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
