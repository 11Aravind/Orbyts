'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, Calendar, CheckCircle2, ChefHat, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import { SITE } from './data/site';
import { useBooking } from './booking/BookingContext';
import { MenuScreen, PhoneFrame } from './mockups/Screens';

export default function InByteHero() {
  const { openBooking } = useBooking();
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="container max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-6">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/#products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#00baf2] font-semibold">innbites</span>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">
              <Zap size={14} /> QR ordering for restaurants and cafés
            </span>
            <h1 id="hero-title">
              Turn Every Table Into a <span className="grad">Smart Ordering</span> Experience.
            </h1>
            <p className="lede">
              Let customers scan, explore your menu, customize their orders, and pay directly from their phones. Simplify
              restaurant operations with one intelligent ordering platform.
            </p>
            <div className="cta-row">
              <button type="button" onClick={openBooking} className="btn-pill-demo">
                <Calendar className="w-4 h-4 stroke-[2.2]" />
                <span>Book a demo</span>
              </button>
              <a href={SITE.trialUrl} target="_blank" rel="noopener noreferrer" className="btn-pill-trial">
                <span>Start free trial</span>
                <span className="btn-pill-arrow">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.6]" />
                </span>
              </a>
            </div>
            <ul className="trust">
              <li>
                <Smartphone size={16} /> No app to install
              </li>
              <li>
                <ShieldCheck size={16} /> No customer login
              </li>
              <li>
                <ChefHat size={16} /> Instant staff alerts
              </li>
            </ul>
          </div>

          <div className="hero-visual" aria-hidden="false">
            <div className="hero-glow" aria-hidden="true" />
            <PhoneFrame label="innbites digital menu preview">
              <MenuScreen />
            </PhoneFrame>

            <div className="float float-notify" role="img" aria-label="New order notification, Table 4">
              <span className="float-icon">
                <Bell size={16} />
              </span>
              <div>
                <b>New order · Table 4</b>
                <small>3 items · just now</small>
              </div>
            </div>

            <div className="float float-cart" role="img" aria-label="Cart preview, total 607 rupees">
              <small>Your cart</small>
              <b>2 items · ₹607</b>
              <span className="float-btn">Checkout</span>
            </div>

            <div className="float float-status" role="img" aria-label="Order status: preparing">
              <small>Order #1024</small>
              <div className="mini-track">
                <i className="done" />
                <i className="now" />
                <i />
                <i />
              </div>
              <span className="status-line">
                <CheckCircle2 size={14} /> Preparing your food
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
