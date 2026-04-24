import * as XLSX from 'xlsx'
import type { Leverans } from './types'

const HEADERS = [
  'Dispatch Date', 'Delivery Date', 'Carrier', 'Registered By',
  'Supplier', 'Fisher Ref', 'Supplier Ref', 'Pallets', 'Lines',
  'Status', 'Received By', 'From', 'Comment',
]

const COL_WIDTHS = [14, 14, 12, 14, 16, 22, 24, 8, 8, 12, 14, 12, 35]

function toRow(e: Leverans): (string | number | null)[] {
  return [
    e.datum ?? null,
    e.levdatum ?? null,
    e.transport ?? '',
    e.regnr ?? '',
    e.lev ?? '',
    e.po ?? '',
    e.artikel ?? '',
    e.antal ?? '',
    e.dock ?? '',
    e.status ?? '',
    e.inav ?? '',
    e.from_org ? `Fisher ${e.from_org}` : '',
    e.komm ?? '',
  ]
}

export function exportExcel(rows: Leverans[]) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows.map(toRow)])
  ws['!cols'] = COL_WIDTHS.map(wch => ({ wch }))
  XLSX.utils.book_append_sheet(wb, ws, 'Inbound Log')
  XLSX.writeFile(wb, `inbound_log_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function exportCSV(rows: Leverans[]) {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const body = rows.map(e =>
    [e.datum, e.levdatum, e.transport, e.regnr, e.lev, e.po, e.artikel,
      e.antal, e.dock, e.status, e.inav,
      e.from_org ? `Fisher ${e.from_org}` : '', e.komm].map(esc).join(',')
  )
  const csv = '\uFEFF' + [HEADERS.join(','), ...body].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = `inbound_log_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}
