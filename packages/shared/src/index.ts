/**
 * @orbyt/shared
 * Common shared constants, types, and utility functions across the Orbyt ecosystem.
 */

export const ORBYT_PRODUCTS = {
  INBYTE: {
    id: 'inbyte',
    name: 'Orbyt InByte (Dine)',
    tagline: 'Real-Time QR Food Ordering & Restaurant Management',
    status: 'production',
    href: '/products/inbyte',
  },
  COMMERCE: {
    id: 'commerce',
    name: 'Orbyt Commerce',
    tagline: 'High-Velocity SaaS Transactions & Checkout Engines',
    status: 'staging',
    href: '/products/commerce',
  },
  STOCK: {
    id: 'stock',
    name: 'Orbyt Stock',
    tagline: 'Real-Time Inventory & Supply Chain Intelligence',
    status: 'concept',
    href: '/products/stock',
  },
  FLOW: {
    id: 'flow',
    name: 'Orbyt Flow',
    tagline: 'Workstream Orchestration & AI Team Pipelines',
    status: 'concept',
    href: '/products/flow',
  },
} as const;

export type ProductId = keyof typeof ORBYT_PRODUCTS;

/**
 * Format currency amounts with standard currency symbol and decimal formatting
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Safely format ISO date strings for UI displays
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

