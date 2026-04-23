import type { Status } from '@/lib/types'

export default function Badge({ status }: { status: Status }) {
  const map: Record<Status, { cls: string; label: string }> = {
    'På väg':  { cls: 'badge-pavag',   label: 'På väg' },
    'Lossat':  { cls: 'badge-lossat',  label: 'Lossat' },
    'Försenat':{ cls: 'badge-forsenat',label: 'Försenat' },
  }
  const m = map[status] ?? map['På väg']
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}
