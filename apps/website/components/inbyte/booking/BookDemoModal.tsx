'use client';

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useBooking } from './BookingContext'
import { DateStep } from './DateStep'
import { TimeStep } from './TimeStep'
import { DetailsStep } from './DetailsStep'
import { ReviewStep } from './ReviewStep'
import { ConfirmStep } from './ConfirmStep'
import {
  submitDemoRequest,
  validateDetails,
  type DemoRequest,
  type DemoRequestResult,
  type FieldErrors,
} from '../lib/booking'

const EMPTY: DemoRequest = {
  dateKey: '',
  time: '',
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  businessType: '',
  message: '',
}

const STEP_LABELS = ['Date', 'Time', 'Details', 'Review']

export function BookDemoModal() {
  const { isOpen, closeBooking } = useBooking()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<DemoRequest>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<DemoRequestResult | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    returnFocus.current = document.activeElement as HTMLElement | null
    setStep(0)
    setValues(EMPTY)
    setErrors({})
    setResult(null)
    setBusy(false)
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      returnFocus.current?.focus?.()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBooking()
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeBooking])

  if (!isOpen) return null

  const patch = (p: Partial<DemoRequest>) => {
    setValues((v: DemoRequest) => ({ ...v, ...p }))
    const keys = Object.keys(p) as (keyof DemoRequest)[]
    setErrors((e: FieldErrors) => {
      const next = { ...e }
      keys.forEach((k) => delete next[k])
      return next
    })
  }

  const canNext =
    (step === 0 && !!values.dateKey) || (step === 1 && !!values.time) || step === 2 || step === 3

  const next = async () => {
    if (step === 2) {
      const errs = validateDetails(values)
      setErrors(errs)
      if (Object.keys(errs).length) return
    }
    if (step === 3) {
      setBusy(true)
      const r = await submitDemoRequest(values)
      setResult(r)
      setBusy(false)
      return
    }
    setStep(step + 1)
  }

  const done = !!result

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeBooking()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button type="button" className="modal-close icon-btn" aria-label="Close" onClick={closeBooking}>
          <X size={20} />
        </button>
        {done ? (
          <ConfirmStep values={values} result={result} onClose={closeBooking} />
        ) : (
          <>
            <header className="modal-head">
              <h3 id="booking-title">Book a demo</h3>
              <ol className="stepper" aria-label="Progress">
                {STEP_LABELS.map((l, i) => (
                  <li key={l} className={i === step ? 'is-active' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
                    <span>{i + 1}</span>
                    {l}
                  </li>
                ))}
              </ol>
            </header>
            <div className="modal-body">
              {step === 0 && <DateStep selected={values.dateKey} onSelect={(d) => patch({ dateKey: d, time: '' })} />}
              {step === 1 && <TimeStep dateKey={values.dateKey} selected={values.time} onSelect={(t) => patch({ time: t })} />}
              {step === 2 && <DetailsStep values={values} errors={errors} onChange={patch} />}
              {step === 3 && <ReviewStep values={values} />}
            </div>
            <footer className="modal-foot">
              {step > 0 ? (
                <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={busy}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="btn btn-primary" onClick={next} disabled={!canNext || busy}>
                {step === 3 ? (busy ? 'Submitting…' : 'Submit demo request') : 'Continue'}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
