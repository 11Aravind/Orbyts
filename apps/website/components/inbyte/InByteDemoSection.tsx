'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, ArrowRight, ShieldCheck, ChefHat } from 'lucide-react';

export default function InByteDemoSection() {
  const [restaurantName, setRestaurantName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tablesCount, setTablesCount] = useState('10 - 25 Tables');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <section id="demo" className="py-20 lg:py-28 border-b border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="spotlight-card p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Interactive Scoping</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Schedule a live InByte walkthrough.
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              See the customer QR flow, the live Kitchen Display System (KDS), and the cashier POS in action with our engineering team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">RESTAURANT / VENUE NAME *</label>
                <input
                  required
                  type="text"
                  placeholder="The Copper Kettle"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">CONTACT PERSON NAME *</label>
                <input
                  required
                  type="text"
                  placeholder="Marcus Vance"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">WORK EMAIL *</label>
                <input
                  required
                  type="email"
                  placeholder="marcus@copperkettle.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">PHONE / WHATSAPP *</label>
                <input
                  required
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">TABLES COUNT / LOCATIONS</label>
                <select
                  value={tablesCount}
                  onChange={(e) => setTablesCount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#121215] border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-sm"
                >
                  <option>Under 10 Tables (Single Counter / Cafe)</option>
                  <option>10 - 25 Tables (Standard Bistro)</option>
                  <option>25 - 50 Tables (Large Dining Room)</option>
                  <option>50+ Tables (High-Capacity / Multi-Floor)</option>
                  <option>Multi-Location Restaurant Group</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">PREFERRED DEMO DATE</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#121215] border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-2">CURRENT POS &amp; OPERATIONAL GOALS</label>
              <textarea
                rows={3}
                placeholder="What POS or order system are you currently running? Any specific printer or floor plan requirements?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-500 font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero hardware obligations. Live interactive sandbox demo.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/10 cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? 'Scheduling Demo...' : 'Book InByte Demo'}</span>
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {submitted && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>
                  Thank you! Your demo request has been received. Our hospitality solutions lead will contact you within 24 hours.
                </span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

