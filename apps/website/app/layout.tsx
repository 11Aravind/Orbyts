import type { Metadata } from 'next';
import React from 'react';
import '../styles/globals.css';
import ClientLayout from '../components/layout/ClientLayout';

export const metadata: Metadata = {
  title: 'ORBYT — Build. Secure. Evolve.',
  description:
    'Discover practical software products, digital security services, and custom technology solutions with ORBYT.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('orbyt-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-white dark:bg-black text-neutral-900 dark:text-white min-h-screen antialiased selection:bg-cyan-500/30 selection:text-black dark:selection:text-white transition-colors duration-200">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
