'use client';

import { BUSINESS_TYPES } from '../data/content'
import type { DemoRequest, FieldErrors } from '../lib/booking'

interface Props {
  values: DemoRequest
  errors: FieldErrors
  onChange: (patch: Partial<DemoRequest>) => void
}

interface FieldProps {
  id: string
  label: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}

function Field({ id, label, error, optional, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="opt"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p className="field-error" id={`${id}-err`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function DetailsStep({ values, errors, onChange }: Props) {
  const a = (id: keyof DemoRequest) => ({
    'aria-invalid': errors[id] ? true : undefined,
    'aria-describedby': errors[id] ? `bd-${String(id)}-err` : undefined,
  })
  return (
    <div className="form-grid">
      <Field id="bd-businessName" label="Business / Store name" error={errors.businessName}>
        <input id="bd-businessName" autoComplete="organization" value={values.businessName} onChange={(e) => onChange({ businessName: e.target.value })} {...a('businessName')} />
      </Field>
      <Field id="bd-contactName" label="Contact person name" error={errors.contactName}>
        <input id="bd-contactName" autoComplete="name" value={values.contactName} onChange={(e) => onChange({ contactName: e.target.value })} {...a('contactName')} />
      </Field>
      <Field id="bd-email" label="Email address" error={errors.email}>
        <input id="bd-email" type="email" autoComplete="email" value={values.email} onChange={(e) => onChange({ email: e.target.value })} {...a('email')} />
      </Field>
      <Field id="bd-phone" label="Phone number" error={errors.phone}>
        <input id="bd-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(e) => onChange({ phone: e.target.value })} {...a('phone')} />
      </Field>
      <Field id="bd-businessType" label="Business type" error={errors.businessType}>
        <select id="bd-businessType" value={values.businessType} onChange={(e) => onChange({ businessType: e.target.value })} {...a('businessType')}>
          <option value="">Select a type</option>
          {BUSINESS_TYPES.map((t: string) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <div className="field full">
        <label htmlFor="bd-message">
          Additional message<span className="opt"> (optional)</span>
        </label>
        <textarea id="bd-message" rows={3} value={values.message} onChange={(e) => onChange({ message: e.target.value })} />
      </div>
    </div>
  )
}
