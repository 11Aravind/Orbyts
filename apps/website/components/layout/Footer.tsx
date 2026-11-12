import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-black relative z-10 pt-16 pb-12 transition-colors">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-neutral-200 dark:border-white/[0.08]">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/orbyt-logo.png"
                alt="ORBYT Logo"
                width={28}
                height={28}
                className="h-7 w-auto object-contain dark:invert-0 invert"
              />
              <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white">ORBYT</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              Software products, digital security, and thoughtful technology solutions for modern businesses ready to
              move forward.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All systems operational</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-white">Products</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/products/inbyte" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Orbyt Dine (InByte)
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Orbyt Commerce
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Orbyt Stock
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Orbyt Flow
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-white">Services</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/security" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Security Assessment
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Application Hardening
                </Link>
              </li>
              <li>
                <Link href="/#development" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Custom Web Apps
                </Link>
              </li>
              <li>
                <Link href="/#development" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Cloud &amp; API Services
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-white">Company</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/#about" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  About ORBYT
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Showcase
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div>&copy; 2026 ORBYT. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Build. Secure. Evolve.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
