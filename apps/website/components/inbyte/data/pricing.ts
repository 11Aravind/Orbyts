/**
 * Pricing plans.
 *
 * All values below are SAMPLE PLACEHOLDERS, not final pricing.
 * Replace this array with data loaded from the Super Admin API later:
 *   export async function fetchPlans(): Promise<Plan[]> { ... }
 * The Pricing component only depends on the `Plan` shape.
 */
export interface Plan {
  id: string
  name: string
  description: string
  /** null means "Contact for Pricing" */
  priceMonthly: number | null
  priceYearly: number | null
  currency: string
  features: string[]
  recommended: boolean
  cta: 'subscribe' | 'contact'
  /** true while the price is a sample value */
  isPlaceholder: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For a single café or small restaurant getting started with QR ordering.',
    priceMonthly: 999,
    priceYearly: 9990,
    currency: '₹',
    features: [
      'QR code ordering',
      'Digital menu with photos',
      'Up to 10 tables',
      'Order management dashboard',
      'Pay at restaurant option',
    ],
    recommended: false,
    cta: 'subscribe',
    isPlaceholder: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For busy restaurants that want payments, tracking and staff alerts.',
    priceMonthly: 2499,
    priceYearly: 24990,
    currency: '₹',
    features: [
      'Everything in Starter',
      'Unlimited tables and QR codes',
      'Online payments',
      'Live order tracking for customers',
      'Instant staff notifications',
      'Ingredients and allergen details',
    ],
    recommended: true,
    cta: 'subscribe',
    isPlaceholder: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For hotels, food courts and multi-outlet businesses.',
    priceMonthly: null,
    priceYearly: null,
    currency: '₹',
    features: [
      'Everything in Growth',
      'Multiple outlets and locations',
      'Custom onboarding',
      'Priority support',
    ],
    recommended: false,
    cta: 'contact',
    isPlaceholder: false,
  },
]
