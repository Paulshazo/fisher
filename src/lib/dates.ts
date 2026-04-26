export const todayISO = () => new Date().toISOString().slice(0, 10)

export function fmtDate(s?: string | null) {
  if (!s) return '—'
  const d = new Date(s + 'T12:00:00')
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export function getWeekRange(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00')
  const day = (d.getDay() + 6) % 7
  const mon = new Date(d); mon.setDate(d.getDate() - day)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  return {
    mon,
    monStr: mon.toISOString().slice(0, 10),
    sunStr: sun.toISOString().slice(0, 10),
  }
}

/** Returns ISO week key like "2026-W17" for a given date string */
export function isoWeekKey(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  const day = (d.getDay() + 6) % 7
  const thu = new Date(d)
  thu.setDate(d.getDate() - day + 3)
  const yearStart = new Date(thu.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((thu.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${thu.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

/** Returns human-readable week label like "W17 · 20 Apr – 26 Apr" */
export function isoWeekLabel(weekKey: string): string {
  const [yearStr, wPart] = weekKey.split('-W')
  const year = parseInt(yearStr)
  const weekNum = parseInt(wPart)
  const jan4 = new Date(year, 0, 4)
  const jan4Day = (jan4.getDay() + 6) % 7
  const mon = new Date(jan4)
  mon.setDate(jan4.getDate() - jan4Day + (weekNum - 1) * 7)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `W${weekNum} · ${fmt(mon)} – ${fmt(sun)}`
}

/** Returns month key like "2026-04" */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

/** Returns human-readable month label like "April 2026" */
export function monthLabel(key: string): string {
  const d = new Date(key + '-15T12:00:00')
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}
