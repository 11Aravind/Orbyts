'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({
  onOpenPalette,
}: {
  onOpenPalette?: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-black/80 border-b border-neutral-200/80 dark:border-white/[0.08] transition-colors">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LEFT CONTAINER: Brand & Left-aligned Navigation Menu */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group text-neutral-900 dark:text-white">
            <Image
              src="/images/orbyt-logo.png"
              alt="ORBYT Logo"
              width={26}
              height={26}
              className="h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="font-bold text-[15px] tracking-wider uppercase text-neutral-900 dark:text-white">
              ORBYT
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-[13px] text-neutral-600 dark:text-neutral-400 font-normal">
            <Link href="/#products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Products
            </Link>
            <Link href="/security" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Security
            </Link>
            <Link href="/#development" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Development
            </Link>
            <Link href="/#testimonials" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Showcase
            </Link>
            <Link href="/#about" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              About
            </Link>
            <Link
              href="/#contact"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Enterprise</span>
              <span className="text-[11px]">&nearr;</span>
            </Link>
          </nav>
        </div>

        {/* RIGHT CONTAINER: Search Bar [Cmd+K] | Theme Toggle | Let's Connect | GitHub */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenPalette}
            type="button"
            className="flex items-center justify-between gap-4 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 transition-all w-32 sm:w-44 cursor-pointer"
          >
            <span className="text-neutral-500 font-sans truncate">Search...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300 font-sans border border-neutral-300 dark:border-neutral-700 shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher Button */}
          <ThemeToggle />

          <Link
            href="/#contact"
            className="px-3 py-1.5 rounded-lg border border-neutral-900 dark:border-neutral-800 bg-neutral-900 text-white dark:bg-neutral-900/60 hover:bg-neutral-800 dark:hover:bg-neutral-800 text-xs font-medium transition-all hidden sm:inline-flex"
          >
            Let&apos;s Connect
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-black/95 px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-white/10">
            <span className="text-xs font-mono text-neutral-500">APPEARANCE</span>
            <ThemeToggle />
          </div>
          <Link
            href="/#products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium"
          >
            Products
          </Link>
          <Link
            href="/security"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium"
          >
            Security
          </Link>
          <Link
            href="/#development"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium"
          >
            Development
          </Link>
          <Link
            href="/#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium"
          >
            Showcase / Process
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium"
          >
            About
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block mt-4 px-3 py-2 text-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold"
          >
            Start a Conversation &rarr;
          </Link>
        </div>
      )}
    </header>
  );
}
