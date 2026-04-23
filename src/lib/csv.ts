import type { Leverans } from './types'

export function exportCSV(rows: Leverans[]) {
  const h = ['Avsändnings Datum','Leverans Datum','Transportör','Registrerat Av','Leverantör',
    'Fisher Reference','Supplier Reference','Antal Pallar','Antal Rader','Status','Mottagen Av','Kommentar']
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const body = rows.map(e =>
    [e.datum,e.levdatum,e.transport,e.regnr,e.lev,e.po,e.artikel,
      e.antal,e.dock,e.status,e.inav,e.komm].map(esc).join(',')
  )
  const csv = '\uFEFF' + [h.join(','), ...body].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = `inbound_log_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
}
