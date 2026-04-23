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
