export const SITE = {
  name: 'innbites',
  tagline: 'QR-based restaurant ordering and management software',
  /** Both the free trial and the live demo open this exact URL. */
  trialUrl: 'https://inn-bites.vercel.app/?table=1',
  demoUrl: 'https://inn-bites.vercel.app/?table=1',
  /** Placeholder contact details. Replace before launch. */
  contact: {
    email: 'hello@innbites.example',
    phone: '+91 00000 00000',
    address: 'Your business address, City, State, India',
    hours: 'Mon to Sat, 10:00 AM to 6:00 PM IST',
  },
} as const

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Live Demo', href: '#live-demo' },
  { label: 'Support', href: '#support' },
]
