'use client';

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isDateAvailable, toDateKey } from '../data/demoSlots'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  selected: string
  onSelect: (dateKey: string) => void
}

export function DateStep({ selected, onSelect }: Props) {
  const today = useMemo(() => new Date(), [])
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const first = view
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const offset = (first.getDay() + 6) % 7 // Monday start
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1)),
  ]

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const canGoBack = first > thisMonth
  const label = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="cal">
      <div className="cal-head">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous month"
          disabled={!canGoBack}
          onClick={() => setView(new Date(first.getFullYear(), first.getMonth() - 1, 1))}
        >
          <ChevronLeft size={18} />
        </button>
        <strong aria-live="polite">{label}</strong>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next month"
          onClick={() => setView(new Date(first.getFullYear(), first.getMonth() + 1, 1))}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="cal-grid" role="grid" aria-label={label}>
        {WEEKDAYS.map((d) => (
          <span key={d} className="cal-dow" role="columnheader">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`e${i}`} />
          const key = toDateKey(date)
          const available = isDateAvailable(date, today)
          const isSel = key === selected
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              className={'cal-day' + (isSel ? ' is-selected' : '') + (key === toDateKey(today) ? ' is-today' : '')}
              disabled={!available}
              aria-selected={isSel}
              aria-label={date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) + (available ? '' : ', unavailable')}
              onClick={() => onSelect(key)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      <p className="cal-note">Past dates and Sundays are unavailable. Sample availability for preview.</p>
    </div>
  )
}
