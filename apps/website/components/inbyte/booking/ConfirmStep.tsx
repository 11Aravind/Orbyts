'use client';

import { CheckCircle2, Info } from 'lucide-react'
import { BOOKING_CONFIG, formatTime, fromDateKey } from '../data/demoSlots'
import type { DemoRequest, DemoRequestResult } from '../lib/booking'

interface Props {
  values: DemoRequest
  result: DemoRequestResult
  onClose: () => void
}

export function ConfirmStep({ values, result, onClose }: Props) {
  const date = fromDateKey(values.dateKey).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return (
    <div className="confirm">
      <CheckCircle2 size={56} className="confirm-icon" aria-hidden="true" />
      <h3 id="booking-title">Demo request received</h3>
      <p>
        Requested slot: <strong>{date}</strong> at <strong>{formatTime(values.time)}</strong>{' '}
        ({BOOKING_CONFIG.timezoneLabel}).
      </p>
      <p className="ref">Reference: {result.reference}</p>
      {!result.delivered && (
        <p className="notice">
          <Info size={18} aria-hidden="true" />
          <span>
            Preview mode: this website is not connected to a booking service yet, so nothing was sent and this slot is
            not confirmed. Once the booking backend is connected, your team will confirm by email.
          </span>
        </p>
      )}
      {result.delivered && !result.confirmed && (
        <p className="notice">
          <Info size={18} aria-hidden="true" />
          <span>Our team will review your request and confirm the time by email.</span>
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onClose}>
        Done
      </button>
    </div>
  )
}
