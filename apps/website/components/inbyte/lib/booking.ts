/**
 * Demo booking logic, kept separate from the UI.
 *
 * To connect a real backend, replace the body of `submitDemoRequest` with a
 * POST to your API (and add calendar and notification handling there).
 * The UI reads `delivered` to decide what to tell the visitor, so it never
 * claims a booking is confirmed unless the backend says so.
 */
export interface DemoRequest {
  dateKey: string
  time: string
  businessName: string
  contactName: string
  email: string
  phone: string
  businessType: string
  message: string
}

export interface DemoRequestResult {
  reference: string
  /** true only when a real backend accepted the request */
  delivered: boolean
  /** true only when a person or calendar has confirmed the slot */
  confirmed: boolean
}

export type FieldErrors = Partial<Record<keyof DemoRequest, string>>

export function validateDetails(v: DemoRequest): FieldErrors {
  const e: FieldErrors = {}
  if (!v.businessName.trim()) e.businessName = 'Enter your business or store name.'
  if (!v.contactName.trim()) e.contactName = 'Enter the contact person name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email address.'
  if (v.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a phone number with at least 10 digits.'
  if (!v.businessType) e.businessType = 'Choose your business type.'
  return e
}

export async function submitDemoRequest(_request: DemoRequest): Promise<DemoRequestResult> {
  // TODO: replace with a real API call, for example:
  // const res = await fetch('/api/demo-requests', { method: 'POST', body: JSON.stringify(_request) })
  await new Promise((r) => setTimeout(r, 700))
  const reference = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  return { reference, delivered: false, confirmed: false }
}
