export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  status: 'production' | 'staging' | 'concept';
  statusLabel: string;
  description: string;
  longDescription: string;
  logo: string;
  previewImage?: string;
  features: string[];
  techStack: string[];
  demoUrl?: string;
  detailsUrl: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'inbyte',
    name: 'Orbyt InByte (Dine)',
    tagline: 'Real-Time QR Restaurant Ordering & Management Platform',
    category: 'Billing & Hospitality Software',
    status: 'production',
    statusLabel: 'Production Ready',
    description:
      'Complete QR menu and ordering platform with live kitchen KDS kanban, dual-mode table/counter billing, staff push notifications, and 80mm thermal receipt printing.',
    longDescription:
      'InByte is a tested, feature-complete restaurant management application. Built on React 19, Supabase, and Tailwind CSS, it offers customers frictionless QR ordering without downloads, gives waiters instant lock-screen audio notifications, and arms managers with complete POS billing and dish control.',
    logo: '/images/orbyt-logo.png',
    previewImage: '/images/dine-preview.jpg',
    features: [
      'Customer QR Scanning (Table-specific & Common Counter)',
      'Real-Time Kitchen Kanban Display (KDS)',
      'Dual Operating Modes: Table Service & Self-Service',
      'Waiter Web Push Notifications & Audio Chimes',
      'Admin POS Terminal & 80mm ESC/POS Thermal Receipt Printing',
      'End-to-End Razorpay & Pay-at-Counter Checkout',
    ],
    techStack: ['React 19', 'Vite 6', 'Supabase', 'Tailwind CSS', 'Razorpay', 'Playwright'],
    demoUrl: '#demo',
    detailsUrl: '/products/inbyte',
  },
  {
    id: 'commerce',
    name: 'Orbyt Commerce',
    tagline: 'High-Velocity SaaS Transaction & Billing Engine',
    category: 'Billing & SaaS Platform',
    status: 'staging',
    statusLabel: 'Active Staging',
    description:
      'Turnkey checkout flows, recurring billing management, multi-currency support, and automated invoicing for software companies and digital merchants.',
    longDescription:
      'Orbyt Commerce provides subscription lifecycle management, payment webhook listeners, automatic tax calculation (GST/VAT), and customer billing portals designed to integrate with custom applications.',
    logo: '/images/orbyt-logo.png',
    features: [
      'Multi-Tier Subscription & One-Time Billing',
      'Automated Invoicing & GST Tax Computation',
      'Secure Webhook Ingestion & Idempotency Safeguards',
      'Customer Self-Serve Subscription Portal',
    ],
    techStack: ['Next.js 15', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    detailsUrl: '/products/commerce',
  },
  {
    id: 'stock',
    name: 'Orbyt Stock',
    tagline: 'Real-Time Inventory & Supply Chain Intelligence',
    category: 'Business Management Software',
    status: 'concept',
    statusLabel: 'Active Concept',
    description:
      'Multi-warehouse inventory management, low-stock threshold triggers, recipe ingredient deductions, and vendor reorder automation.',
    longDescription:
      'Designed for food and retail operations, Orbyt Stock ties directly into point-of-sale systems to deduct raw materials in real time, alerting purchasing managers before items run out.',
    logo: '/images/orbyt-logo.png',
    features: [
      'Multi-Warehouse Stock Tracking',
      'Automatic Ingredient Recipe Deductions',
      'Low-Stock Trigger Notifications',
      'Supplier Purchase Order Automation',
    ],
    techStack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    detailsUrl: '/products/stock',
  },
  {
    id: 'flow',
    name: 'Orbyt Flow',
    tagline: 'Business Workflow & Team Process Automation',
    category: 'Custom Software Solution',
    status: 'concept',
    statusLabel: 'Active Concept',
    description:
      'Visual process orchestrator connecting internal operations, custom APIs, webhooks, and team alerts into unified, auditable pipelines.',
    longDescription:
      'Orbyt Flow eliminates repetitive manual work by binding together customer requests, staff tasks, and backend API triggers into automated, observable workflows.',
    logo: '/images/orbyt-logo.png',
    features: [
      'Visual Pipeline Configuration',
      'Custom Webhook & Event Handlers',
      'Team Notification Dispatches (Push, Email)',
      'Audit Logging & Pipeline Observability',
    ],
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'WebSockets'],
    detailsUrl: '/products/flow',
  },
];

