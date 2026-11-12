export const BUSINESS_TYPES = [
  'Restaurant',
  'Café',
  'Bakery',
  'Hotel or Resort',
  'Food Court',
  'Cloud Kitchen',
  'Fast Food Outlet',
  'Food Truck',
  'Other',
]

export const PROBLEM_SOLUTIONS = [
  {
    problem: 'Customers wait for a menu and for someone to take their order.',
    solution: 'Instant QR-based digital menus open the moment a guest sits down.',
  },
  {
    problem: 'Every order is taken by hand during the rush.',
    solution: 'Customers place orders directly from their own phones.',
  },
  {
    problem: 'Orders get mixed up between guests and staff.',
    solution: 'Clear item customization puts every request in writing.',
  },
  {
    problem: 'Special requests like "no onion" are easy to miss.',
    solution: 'Staff get an instant notification with the full order and notes.',
  },
  {
    problem: 'Guests keep asking, "Is my food ready yet?"',
    solution: 'Live order status tracking shows accepted, preparing, ready and completed.',
  },
]

export type PreviewKind =
  | 'qr'
  | 'menu'
  | 'allergen'
  | 'prefs'
  | 'cart'
  | 'payments'
  | 'notify'
  | 'tracking'
  | 'manage'
  | 'multiqr'

export const FEATURES: { title: string; description: string; preview: PreviewKind }[] = [
  {
    title: 'QR Code Ordering',
    description:
      'Customers scan a table QR code and access the menu instantly without downloading an app or creating an account.',
    preview: 'qr',
  },
  {
    title: 'Interactive Digital Menu',
    description: 'Display food images, descriptions, prices, categories and availability.',
    preview: 'menu',
  },
  {
    title: 'Ingredients & Allergen Information',
    description: 'Show ingredients and allergen details so customers can make informed food choices.',
    preview: 'allergen',
  },
  {
    title: 'Custom Food Preferences',
    description: 'Customers can request less mayonnaise, no onion, extra cheese or other preparation preferences.',
    preview: 'prefs',
  },
  {
    title: 'Smart Cart & Checkout',
    description: 'Customers can add multiple items, review their order and proceed to checkout.',
    preview: 'cart',
  },
  {
    title: 'Flexible Payments',
    description: 'Support online payments and pay-at-restaurant options.',
    preview: 'payments',
  },
  {
    title: 'Instant Staff Notifications',
    description: 'Notify restaurant staff when a customer places a new order.',
    preview: 'notify',
  },
  {
    title: 'Live Order Tracking',
    description: 'Allow customers to follow order progress: accepted, preparing, ready and completed.',
    preview: 'tracking',
  },
  {
    title: 'Restaurant Order Management',
    description: 'Give staff an organized interface to manage incoming orders and update their statuses.',
    preview: 'manage',
  },
  {
    title: 'Multiple QR Codes',
    description: 'Support different tables and ordering locations within the same business.',
    preview: 'multiqr',
  },
]

export const STEPS: { title: string; description: string; preview: PreviewKind }[] = [
  { title: 'Scan the QR Code', description: 'Customers scan the QR code placed on their table.', preview: 'qr' },
  {
    title: 'Explore & Customize',
    description: 'Browse the menu, check ingredients, review allergens and add special instructions.',
    preview: 'prefs',
  },
  {
    title: 'Place Your Order',
    description: 'Add items to the cart and complete payment or choose pay-at-restaurant.',
    preview: 'payments',
  },
  {
    title: 'Prepare & Serve',
    description:
      'Restaurant staff receive the order, prepare the food and update its status. Customers can track progress.',
    preview: 'tracking',
  },
]

export type UseCaseIcon =
  | 'utensils'
  | 'coffee'
  | 'croissant'
  | 'hotel'
  | 'store'
  | 'cloud'
  | 'sandwich'
  | 'truck'

export const USE_CASES: { title: string; description: string; icon: UseCaseIcon }[] = [
  { title: 'Restaurants', description: 'Dine-in ordering from every table without waiting for a waiter.', icon: 'utensils' },
  { title: 'Cafés', description: 'Quick orders for coffee and snacks, with customizations in writing.', icon: 'coffee' },
  { title: 'Bakeries', description: 'Show fresh bakes with ingredients and allergens up front.', icon: 'croissant' },
  { title: 'Hotels & Resorts', description: 'Dining areas, poolside and in-room menus from separate QR codes.', icon: 'hotel' },
  { title: 'Food Courts', description: 'One scan point, many counters, and less queueing.', icon: 'store' },
  { title: 'Cloud Kitchens', description: 'A clear order queue with statuses your team can update.', icon: 'cloud' },
  { title: 'Fast Food Outlets', description: 'Shorter lines with ordering and payment on the guest phone.', icon: 'sandwich' },
  { title: 'Food Trucks', description: 'A QR code on the counter turns queues into orders.', icon: 'truck' },
]

export const TESTIMONIALS = [
  {
    name: 'Sample Customer',
    business: 'Sample Café',
    rating: 5,
    review:
      'Placeholder review. Guests scan, order and we get the ticket straight away. Replace this with a real customer quote.',
  },
  {
    name: 'Sample Owner',
    business: 'Sample Restaurant',
    rating: 5,
    review:
      'Placeholder review. Special requests like no onion now arrive exactly as written. Replace with a real review.',
  },
  {
    name: 'Sample Manager',
    business: 'Sample Bakery',
    rating: 4,
    review:
      'Placeholder review. Showing allergens on the menu saves our staff from answering the same question all day.',
  },
]

export const FAQS = [
  {
    q: 'What is Innbites?',
    a: 'Innbites is QR-based restaurant ordering and management software. Customers scan a table QR code, browse your menu, customize their order and pay from their phone, while your staff receive and manage orders in one place.',
  },
  {
    q: 'Do customers need to install an application?',
    a: 'No. The menu opens in the phone browser after scanning the QR code, so there is nothing to download.',
  },
  {
    q: 'Do customers need to register or log in?',
    a: 'No. Customers can start ordering straight after scanning, without creating an account.',
  },
  {
    q: 'Can customers customize food orders?',
    a: 'Yes. Customers can add preferences such as less mayonnaise, no onion or extra cheese, and the request goes to your staff with the order.',
  },
  {
    q: 'Can customers view ingredients and allergens?',
    a: 'Yes. Each menu item can show its ingredients and allergen details so customers can make informed choices.',
  },
  {
    q: 'Does Innbites support online payments?',
    a: 'Yes. You can offer online payments, pay-at-restaurant, or both.',
  },
  {
    q: 'How do restaurant staff receive orders?',
    a: 'Staff are notified instantly when a customer places an order, and they manage it from an organized order interface where they can update each status.',
  },
  {
    q: 'Can customers track their order status?',
    a: 'Yes. Customers can follow progress through accepted, preparing, ready and completed.',
  },
  {
    q: 'Can I use Innbites for multiple tables?',
    a: 'Yes. Create a separate QR code for each table or ordering location, all within the same business.',
  },
  {
    q: 'How can I start using Innbites?',
    a: 'Try the live demo or start a free trial any time, or book a demo and we will walk you through setting up your own menu.',
  },
]
