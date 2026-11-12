'use client';

import { BOOKING_CONFIG, formatTime, fromDateKey } from '../data/demoSlots'
import type { DemoRequest } from '../lib/booking'

export function ReviewStep({ values }: { values: DemoRequest }) {
  const date = fromDateKey(values.dateKey).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const rows: [string, string][] = [
    ['Date', date],
    ['Time', `${formatTime(values.time)} (${BOOKING_CONFIG.timezoneLabel})`],
    ['Business', values.businessName],
    ['Contact person', values.contactName],
    ['Email', values.email],
    ['Phone', values.phone],
    ['Business type', values.businessType],
  ]
  if (values.message.trim()) rows.push(['Message', values.message.trim()])
  return (
    <div>
      <p className="step-hint">Check your details, then submit your demo request.</p>
      <dl className="review">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
