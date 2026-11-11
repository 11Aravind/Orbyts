'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CommandPalette from '../navigation/CommandPalette';
import { ThemeProvider } from '../../context/ThemeContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  // Global mouse-tracking spotlight on all .spotlight-card elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.spotlight-card');
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen relative bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 antialiased selection:bg-cyan-500 selection:text-white dark:selection:text-black transition-colors duration-200">
        {/* Ambient Top Subtle Background Grid present across all pages */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-40 dark:opacity-30 z-0" />

        <Navbar onOpenPalette={() => setPaletteOpen(true)} />
        <main className="relative z-10">{children}</main>
        <Footer />
        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </ThemeProvider>
  );
}
