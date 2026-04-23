import type { Status } from '@/lib/types'

export default function Badge({ status }: { status: Status }) {
  const map: Record<Status, { cls: string }> = {
    'In Transit': { cls: 'badge-pavag' },
    'Received':   { cls: 'badge-lossat' },
    'Delayed':    { cls: 'badge-forsenat' },
  }
  const m = map[status] ?? map['In Transit']
  return <span className={`badge ${m.cls}`}>{status}</span>
}
