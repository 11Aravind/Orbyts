import type { Metadata } from 'next';
import React from 'react';
import '../styles/globals.css';
import ClientLayout from '../components/layout/ClientLayout';

export const metadata: Metadata = {
  title: 'ORBYT — Build. Secure. Evolve.',
  description:
    'Discover practical software products, digital security services, and custom technology solutions with ORBYT.',
  icons: {
    icon: '/images/orbyt-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-black text-white min-h-screen antialiased selection:bg-cyan-500/30 selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
