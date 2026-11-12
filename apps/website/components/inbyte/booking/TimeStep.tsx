'use client';

import { useEffect, useState } from 'react'
import { BOOKING_CONFIG, fetchSlotsForDate, formatTime, fromDateKey, type TimeSlot } from '../data/demoSlots'

interface Props {
  dateKey: string
  selected: string
  onSelect: (time: string) => void
}

export function TimeStep({ dateKey, selected, onSelect }: Props) {
  const [slots, setSlots] = useState<TimeSlot[] | null>(null)

  useEffect(() => {
    let live = true
    setSlots(null)
    fetchSlotsForDate(dateKey).then((s: TimeSlot[]) => live && setSlots(s))
    return () => {
      live = false
    }
  }, [dateKey])

  const dateLabel = fromDateKey(dateKey).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div>
      <p className="step-hint">
        {dateLabel} · {BOOKING_CONFIG.timezoneLabel}
      </p>
      {!slots ? (
        <p className="step-hint">Loading available times…</p>
      ) : (
        <div className="slots" role="group" aria-label="Available times">
          {slots.map((s) => (
            <button
              key={s.time}
              type="button"
              className={'slot' + (s.time === selected ? ' is-selected' : '')}
              disabled={!s.available}
              aria-pressed={s.time === selected}
              onClick={() => onSelect(s.time)}
            >
              {formatTime(s.time)}
              {!s.available && <small>Unavailable</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
