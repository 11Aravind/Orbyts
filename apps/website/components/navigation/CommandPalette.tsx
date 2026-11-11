'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ShieldCheck, Code, HelpCircle, MessageSquare, ExternalLink } from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  category: 'Navigation' | 'Products' | 'Services' | 'Actions';
}

const ITEMS: PaletteItem[] = [
  {
    id: 'products',
    title: 'The Product Universe',
    subtitle: 'Dine (InByte), Commerce, Stock, Flow',
    href: '/#products',
    icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
    category: 'Products',
  },
  {
    id: 'inbyte',
    title: 'Orbyt InByte (Dine)',
    subtitle: 'Real-time QR food ordering & restaurant management',
    href: '/products/inbyte',
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    category: 'Products',
  },
  {
    id: 'security',
    title: 'Digital Security Services',
    subtitle: 'Application audits, cloud hardening & reviews',
    href: '/security',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    category: 'Services',
  },
  {
    id: 'development',
    title: 'Custom Engineering & Development',
    subtitle: 'Tailored platforms, modern web apps & APIs',
    href: '/#development',
    icon: <Code className="w-4 h-4 text-purple-400" />,
    category: 'Services',
  },
  {
    id: 'about',
    title: 'About ORBYT',
    subtitle: 'Our philosophy, standards & mission',
    href: '/#about',
    icon: <ExternalLink className="w-4 h-4 text-neutral-400" />,
    category: 'Navigation',
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Common questions and answers',
    href: '/#faq',
    icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
    category: 'Navigation',
  },
  {
    id: 'contact',
    title: 'Start a Conversation',
    subtitle: 'Book a consultation or request scoping',
    href: '/#contact',
    icon: <MessageSquare className="w-4 h-4 text-white" />,
    category: 'Actions',
  },
];

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-neutral-950 border border-white/20 shadow-2xl overflow-hidden font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search navigation, products, services, or actions..."
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm font-sans focus:outline-none"
          />
          <kbd
            onClick={onClose}
            className="px-2 py-0.5 rounded bg-white/10 text-neutral-400 hover:text-white cursor-pointer text-[10px]"
          >
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm font-sans">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  idx === selectedIndex
                    ? 'bg-white/[0.08] text-white'
                    : 'text-neutral-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 font-sans">
                  {item.icon}
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-neutral-500">{item.subtitle}</div>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase">
                  {item.category}
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-[11px] text-neutral-500">
          <span>Use &uarr; &darr; to navigate, Enter to select</span>
          <span className="font-mono">ORBYT Command</span>
        </div>
      </div>
    </div>
  );
}

