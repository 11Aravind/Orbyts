import React from 'react';
import {
  QrCode,
  MonitorCheck,
  Receipt,
  LayoutGrid,
  MenuSquare,
  ShieldCheck,
  BellRing,
  BarChart3,
  Wifi,
  Languages,
} from 'lucide-react';

export default function InByteFeatures() {
  const features = [
    {
      icon: <QrCode className="w-6 h-6 text-emerald-400" />,
      category: 'Customer Experience',
      title: 'Table-Bound QR Digital Menu',
      desc: 'Guests scan the table QR to access the live digital menu without downloading any application. Includes categorized browsing, instant dish search, vegetarian/non-vegetarian symbols, and custom kitchen notes.',
      badge: 'Zero App Installs',
    },
    {
      icon: <MonitorCheck className="w-6 h-6 text-cyan-400" />,
      category: 'Kitchen Operations',
      title: 'Real-Time Kitchen Display (KDS)',
      desc: 'Replaces noisy kitchen printers with an interactive chef screen. Real-time WebSocket dispatching alerts chefs with an audio chime when orders arrive. Tracks orders across Pending, Cooking, Ready, and Served.',
      badge: 'WebSocket Sub-Second',
    },
    {
      icon: <Receipt className="w-6 h-6 text-emerald-400" />,
      category: 'Point of Sale',
      title: 'Cashier POS & Thermal Receipt Printing',
      desc: 'Built-in cashier station to manage walk-in orders, add items to running tables, and settle checks. Compatible with standard ESC/POS USB, Bluetooth, and network thermal printers for instant Kitchen Order Tickets (KOT).',
      badge: 'ESC/POS Compliant',
    },
    {
      icon: <LayoutGrid className="w-6 h-6 text-purple-400" />,
      category: 'Dining Floor Control',
      title: 'Live Table Map & QR Generator',
      desc: 'Visual floor plan displaying real-time occupancy status (Available, Occupied, Billing, Reserved). Generate and export unique branded QR codes for all tables with one click.',
      badge: 'Dynamic Generation',
    },
    {
      icon: <MenuSquare className="w-6 h-6 text-amber-400" />,
      category: 'Catalog Management',
      title: 'Instant Dish & Stock Control',
      desc: 'Update dish pricing, descriptions, and dietary tags instantly. If an ingredient runs out during rush hour, toggle dish availability off across all customer menus with zero delay.',
      badge: 'Real-Time Sync',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
      category: 'Staff Management',
      title: 'Waiter PIN Authentication & RBAC',
      desc: 'Assign 4-digit passcodes to service staff. Waiters log in to take manual table orders, receive alerts, and track table service. Role-based access protects sensitive restaurant financial settings.',
      badge: 'Role Isolation',
    },
    {
      icon: <BellRing className="w-6 h-6 text-pink-400" />,
      category: 'Guest Hospitality',
      title: 'In-Table Service Calling',
      desc: 'Guests can press "Call Waiter", "Request Water", or "Request Check" right from their table web view. Alerts display immediately on the POS and staff screens.',
      badge: 'Instant Alert',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      category: 'Executive Insights',
      title: 'Real-Time Revenue Analytics',
      desc: 'Monitor gross merchandise value (GMV), total order volume, average ticket size, top-selling dishes, and peak dining hours from a unified executive dashboard.',
      badge: 'Live Telemetry',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 border-b border-white/[0.08] relative">
      <div className="max-w-[1448px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
            Core Modules
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Every feature verified from production code.
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg">
            No hypothetical features. InByte comes fully equipped with the tools required to run high-speed dining operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="spotlight-card p-6 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-400">
                    {feat.badge}
                  </span>
                </div>

                <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  {feat.category}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>Integrated Module</span>
                <span className="text-emerald-400">&bull;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

