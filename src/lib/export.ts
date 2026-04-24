import ExcelJS from 'exceljs'
import type { Leverans } from './types'

const COLUMNS: { header: string; key: keyof Leverans | '_from'; width: number }[] = [
  { header: 'Dispatch Date',   key: 'datum',     width: 14 },
  { header: 'Delivery Date',   key: 'levdatum',  width: 14 },
  { header: 'Carrier',         key: 'transport', width: 12 },
  { header: 'Registered By',   key: 'regnr',     width: 14 },
  { header: 'Supplier',        key: 'lev',       width: 18 },
  { header: 'Fisher Ref',      key: 'po',        width: 22 },
  { header: 'Supplier Ref',    key: 'artikel',   width: 26 },
  { header: 'Pallets',         key: 'antal',     width:  8 },
  { header: 'Lines',           key: 'dock',      width:  8 },
  { header: 'Status',          key: 'status',    width: 12 },
  { header: 'Received By',     key: 'inav',      width: 14 },
  { header: 'From',            key: '_from',     width: 12 },
  { header: 'Comment',         key: 'komm',      width: 38 },
]

const STATUS_FILL: Record<string, string> = {
  'In Transit': 'FFDCE8FF',
  'Received':   'FFD4F0E0',
  'Delayed':    'FFFDE8CC',
}
const STATUS_FONT: Record<string, string> = {
  'In Transit': 'FF1A4FFF',
  'Received':   'FF1A7A3F',
  'Delayed':    'FFB85A00',
}

function cellVal(e: Leverans, key: keyof Leverans | '_from'): string | number {
  if (key === '_from') return e.from_org ? `Fisher ${e.from_org}` : ''
  const v = e[key as keyof Leverans]
  return v == null ? '' : String(v)
}

export async function exportExcel(rows: Leverans[]) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Fisher Inbound'
  wb.created = new Date()

  const ws = wb.addWorksheet('Inbound Log', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  ws.columns = COLUMNS.map(c => ({ header: c.header, key: c.key, width: c.width }))

  /* ── Header row styling ── */
  const hdr = ws.getRow(1)
  hdr.height = 24
  hdr.eachCell(cell => {
    cell.font   = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D0D0C' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FFE8500A' } },
      right:  { style: 'thin',   color: { argb: 'FF2A2A28' } },
    }
  })

  /* ── Data rows ── */
  rows.forEach((e, i) => {
    const rowData = COLUMNS.reduce<Record<string, string | number>>((acc, c) => {
      acc[c.key] = cellVal(e, c.key)
      return acc
    }, {})

    const row = ws.addRow(rowData)
    row.height = 20

    const isAlt = i % 2 === 1
    const altFill: ExcelJS.Fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: isAlt ? 'FFF0EDE6' : 'FFFFFFFF' },
    }

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font      = { name: 'Calibri', size: 10 }
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false }
      cell.fill      = altFill
      cell.border    = {
        top:    { style: 'hair', color: { argb: 'FFE2DFD6' } },
        bottom: { style: 'hair', color: { argb: 'FFE2DFD6' } },
        right:  { style: 'thin', color: { argb: 'FFE2DFD6' } },
      }

      /* Status column (col 10) — colored badge */
      if (colNumber === 10 && e.status) {
        const bgArgb = STATUS_FILL[e.status]
        const fgArgb = STATUS_FONT[e.status]
        if (bgArgb) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } }
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: fgArgb } }
        }
      }

      /* Pallets + Lines — center-align numbers */
      if (colNumber === 8 || colNumber === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.font = { name: 'Calibri', size: 10, bold: true }
      }

      /* Comment — wrap text */
      if (colNumber === 13) {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
      }
    })
  })

  /* ── Totals row ── */
  const totalRow = ws.addRow({})
  totalRow.height = 20
  totalRow.getCell(1).value = `Total: ${rows.length} shipments`
  totalRow.getCell(1).font = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FF7A7A76' } }
  totalRow.eachCell({ includeEmpty: false }, cell => {
    cell.border = { top: { style: 'medium', color: { argb: 'FFE2DFD6' } } }
  })

  /* ── Download ── */
  const buffer = await wb.xlsx.writeBuffer()
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = `inbound_log_${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(rows: Leverans[]) {
  const headers = COLUMNS.map(c => c.header)
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const body = rows.map(e => COLUMNS.map(c => esc(cellVal(e, c.key))).join(','))
  const csv  = '\uFEFF' + [headers.join(','), ...body].join('\n')
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = `inbound_log_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}
