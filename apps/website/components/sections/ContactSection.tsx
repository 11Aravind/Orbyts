'use client';

import React, { useState } from 'react';
import { MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ContactSection() {
  const [selectedInterest, setSelectedInterest] = useState('Products');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [timeline, setTimeline] = useState('Immediately / Next 2 weeks');
  const [projectDetails, setProjectDetails] = useState('');

  const interests = ['Products', 'Security Review', 'Custom Dev', 'Enterprise'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <section id="contact" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="spotlight-card p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Start a Conversation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">Make your next move.</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
              Tell us what you are working towards. We&apos;ll help you explore the right product or custom engineering
              approach.
            </p>
          </div>

          <form id="contactForm" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2.5">WHAT CAN WE HELP WITH?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {interests.map((interest) => {
                  const isSelected = selectedInterest === interest;
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => setSelectedInterest(interest)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-500/40 shadow-sm'
                          : 'border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-white/20'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">FULL NAME *</label>
                <input
                  required
                  type="text"
                  placeholder="Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-white/[0.03] border border-neutral-300 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">WORK EMAIL *</label>
                <input
                  required
                  type="email"
                  placeholder="sarah@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-white/[0.03] border border-neutral-300 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">COMPANY / PROJECT NAME</label>
                <input
                  type="text"
                  placeholder="Acme Dynamics"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-white/[0.03] border border-neutral-300 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">ESTIMATED TIMELINE</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none focus:border-cyan-400 text-sm"
                >
                  <option>Immediately / Next 2 weeks</option>
                  <option>Next 1-2 months</option>
                  <option>Just exploring options</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">TELL US ABOUT YOUR PROJECT</label>
              <textarea
                rows={4}
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                placeholder="What challenges are you looking to solve? What stack are you using? Feel free to share details..."
                className="w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-white/[0.03] border border-neutral-300 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-neutral-500 font-mono">
                We sign mutual NDAs before technical deep dives.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>{submitting ? 'Sending...' : 'Submit Inquiry'}</span>
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {submitted && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>Thank you! Your enquiry has been received. Our team will reach out within 24 hours.</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
