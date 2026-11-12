/**
 * Demo booking availability (SAMPLE DATA).
 *
 * Replace `fetchSlotsForDate` and `isDateAvailable` with calls to your real
 * calendar or booking API. The booking UI only uses the exports below.
 */
export interface TimeSlot {
  /** 24h "HH:mm" */
  time: string
  available: boolean
}

export const BOOKING_CONFIG = {
  timezoneLabel: 'India Standard Time (IST)',
  /** 0 = Sunday ... 6 = Saturday */
  unavailableWeekdays: [0],
  /** Specific "YYYY-MM-DD" dates with no demos, such as holidays */
  unavailableDates: [] as string[],
  /** How many days ahead visitors can book */
  bookingWindowDays: 60,
  slotTimes: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
}

export function toDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isDateAvailable(date: Date, today: Date = new Date()): boolean {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const last = new Date(start)
  last.setDate(last.getDate() + BOOKING_CONFIG.bookingWindowDays)
  if (date < start || date > last) return false
  if (BOOKING_CONFIG.unavailableWeekdays.includes(date.getDay())) return false
  if (BOOKING_CONFIG.unavailableDates.includes(toDateKey(date))) return false
  return true
}

/** Deterministic sample rule so the same date always shows the same slots. */
function sampleBusy(dateKey: string, time: string): boolean {
  let h = 0
  const s = dateKey + time
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 4 === 0
}

export async function fetchSlotsForDate(dateKey: string, now: Date = new Date()): Promise<TimeSlot[]> {
  const isToday = dateKey === toDateKey(now)
  return BOOKING_CONFIG.slotTimes.map((time) => {
    const [hh, mm] = time.split(':').map(Number)
    const passed = isToday && (hh < now.getHours() || (hh === now.getHours() && mm <= now.getMinutes()))
    return { time, available: !passed && !sampleBusy(dateKey, time) }
  })
}

export function formatTime(time: string): string {
  const [hh, mm] = time.split(':').map(Number)
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`
}
