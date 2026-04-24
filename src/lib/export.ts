import ExcelJS from 'exceljs'
import type { Leverans } from './types'

/* ── Column definitions ─────────────────────────────────────────── */
const COLS = [
  { header: 'Dispatch Date',  key: 'datum',     width: 14 },
  { header: 'Delivery Date',  key: 'levdatum',  width: 14 },
  { header: 'Carrier',        key: 'transport', width: 11 },
  { header: 'Reg. By',        key: 'regnr',     width: 10 },
  { header: 'Supplier',       key: 'lev',       width: 18 },
  { header: 'Fisher Ref',     key: 'po',        width: 24 },
  { header: 'Supplier Ref',   key: 'artikel',   width: 28 },
  { header: 'Pallets',        key: 'antal',     width:  9 },
  { header: 'Lines',          key: 'dock',      width:  9 },
  { header: 'Status',         key: 'status',    width: 13 },
  { header: 'Received By',    key: 'inav',      width: 13 },
  { header: 'From',           key: '_from',     width: 12 },
  { header: 'Comment',        key: 'komm',      width: 40 },
] as const

const NUM_COLS = COLS.length
const LAST_COL_LETTER = String.fromCharCode(64 + NUM_COLS) // 'M'

/* ── Colours ─────────────────────────────────────────────────────── */
const C = {
  ink:      'FF0D0D0C',
  ink2:     'FF3A3A37',
  paper:    'FFFFFFFF',
  paper2:   'FFF7F5F0',
  paper3:   'FFEDEAE3',
  accent:   'FFE8500A',
  border:   'FFE2DFD6',
  border2:  'FFCBC7BC',
  hdrText:  'FFFFFFFF',
  titleBg:  'FF0D0D0C',
  metaBg:   'FF1C1C1A',
  // Status
  blueBg:   'FFDCE8FF', blueFg:  'FF1A4FFF',
  greenBg:  'FFD4F0E0', greenFg: 'FF1A7A3F',
  amberBg:  'FFFDE8CC', amberFg: 'FFB85A00',
  // Supplier tints
  sup: {
    'Fisher France':  'FFEFF4FF',
    'Fisher UK':      'FFF5F0FF',
    'Fisher Germany': 'FFFFFBEB',
    'LED':            'FFF0FEF4',
    'CORNING':        'FFFFF7ED',
    'EPPENDORF':      'FFF0FDFA',
  } as Record<string, string>,
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function fill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}
function thinBorder(color = C.border): Partial<ExcelJS.Borders> {
  return {
    top:    { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    left:   { style: 'thin', color: { argb: color } },
    right:  { style: 'thin', color: { argb: color } },
  }
}
function cellVal(e: Leverans, key: string): string | number {
  if (key === '_from') return e.from_org ? `Fisher ${e.from_org}` : ''
  const v = e[key as keyof Leverans]
  return v == null ? '' : String(v)
}
function fmtDateStr(s: string | null | undefined): string {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

/* ── Main export ─────────────────────────────────────────────────── */
export async function exportExcel(rows: Leverans[]) {
  const wb = new ExcelJS.Workbook()
  wb.creator  = 'Fisher Inbound'
  wb.created  = new Date()
  wb.modified = new Date()

  const ws = wb.addWorksheet('Inbound Log', {
    views: [{ state: 'frozen', ySplit: 4, showGridLines: false }],
    pageSetup: {
      orientation:   'landscape',
      fitToPage:     true,
      fitToWidth:    1,
      fitToHeight:   0,
      paperSize:     9, // A4
      margins:       { left:0.5, right:0.5, top:0.75, bottom:0.75, header:0.3, footer:0.3 },
      printTitlesRow: '1:4',
    },
    headerFooter: {
      oddFooter: `&L&8Fisher Inbound — Confidential&C&8Page &P of &N&R&8Exported ${new Date().toLocaleDateString('en-GB')}`,
    },
  })

  ws.columns = COLS.map(c => ({ key: c.key, width: c.width }))

  /* ── Row 1 — Big title ── */
  const r1 = ws.addRow([])
  r1.height = 36
  ws.mergeCells(`A1:${LAST_COL_LETTER}1`)
  const title = ws.getCell('A1')
  title.value     = '  INBOUND LOG'
  title.font      = { name: 'Calibri', bold: true, size: 18, color: { argb: C.hdrText } }
  title.fill      = fill(C.titleBg)
  title.alignment = { vertical: 'middle', horizontal: 'left' }
  title.border    = { bottom: { style: 'medium', color: { argb: C.accent } } }

  /* Accent dot — put in last cell before merge overwrites */
  const dotCell = ws.getCell(`${LAST_COL_LETTER}1`)
  dotCell.value = '●'
  dotCell.font  = { name: 'Calibri', bold: true, size: 14, color: { argb: C.accent } }
  dotCell.fill  = fill(C.titleBg)
  dotCell.alignment = { vertical: 'middle', horizontal: 'right' }

  /* ── Row 2 — Metadata bar ── */
  const r2 = ws.addRow([])
  r2.height = 20
  ws.mergeCells(`A2:D2`)
  ws.mergeCells(`E2:I2`)
  ws.mergeCells(`J2:${LAST_COL_LETTER}2`)

  const exportDate = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
  const metaStyle = (cell: ExcelJS.Cell, val: string, align: ExcelJS.Alignment['horizontal'] = 'left') => {
    cell.value     = val
    cell.fill      = fill(C.metaBg)
    cell.font      = { name: 'Calibri', size: 9, color: { argb: 'FF9A9A96' } }
    cell.alignment = { vertical: 'middle', horizontal: align }
  }
  metaStyle(ws.getCell('A2'), `  Export: ${exportDate}`)
  metaStyle(ws.getCell('E2'), `${rows.length} shipments`, 'center')
  metaStyle(ws.getCell('J2'), 'Fisher Inbound System  ', 'right')

  /* ── Row 3 — Spacer ── */
  const r3 = ws.addRow([])
  r3.height = 6
  ws.mergeCells(`A3:${LAST_COL_LETTER}3`)
  ws.getCell('A3').fill = fill(C.paper3)

  /* ── Row 4 — Column headers ── */
  const hdrRow = ws.addRow(COLS.map(c => c.header))
  hdrRow.height = 22
  hdrRow.eachCell({ includeEmpty: true }, cell => {
    cell.font      = { name: 'Calibri', bold: true, size: 10, color: { argb: C.hdrText } }
    cell.fill      = fill(C.ink)
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    cell.border    = {
      bottom: { style: 'medium', color: { argb: C.accent } },
      right:  { style: 'thin',   color: { argb: 'FF2A2A28' } },
    }
  })

  /* Center-align number headers */
  ;[8, 9].forEach(col => {
    const c = hdrRow.getCell(col)
    c.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: NUM_COLS } }

  /* ── Data rows (start at Excel row 5) ── */
  const statusCounts: Record<string, number> = {}
  const supplierCounts: Record<string, number> = {}

  rows.forEach((e, i) => {
    const values = COLS.map(c => {
      const raw = cellVal(e, c.key)
      if ((c.key === 'datum' || c.key === 'levdatum') && raw) return fmtDateStr(raw as string)
      return raw
    })

    const row = ws.addRow(values)
    row.height = 18

    const isAlt   = i % 2 === 1
    const supColor = C.sup[e.lev ?? ''] ?? (isAlt ? C.paper2 : C.paper)
    const rowBg   = isAlt ? C.paper2 : C.paper

    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.font      = { name: 'Calibri', size: 10 }
      cell.fill      = fill(rowBg)
      cell.alignment = { vertical: 'middle', horizontal: 'left' }
      cell.border    = thinBorder()

      /* Supplier cell — tinted by supplier */
      if (col === 5 && e.lev && C.sup[e.lev]) {
        cell.fill = fill(supColor)
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.ink2 } }
      }

      /* Fisher Ref / Supplier Ref — monospace feel */
      if (col === 6 || col === 7) {
        cell.font = { name: 'Courier New', size: 9, color: { argb: C.ink2 } }
      }

      /* Pallets / Lines — center, bold */
      if (col === 8 || col === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.font = { name: 'Calibri', size: 10, bold: true }
      }

      /* Status — badge colours */
      if (col === 10 && e.status) {
        const bgMap: Record<string, string> = { 'In Transit': C.blueBg,  'Received': C.greenBg,  'Delayed': C.amberBg }
        const fgMap: Record<string, string> = { 'In Transit': C.blueFg,  'Received': C.greenFg,  'Delayed': C.amberFg }
        if (bgMap[e.status]) {
          cell.fill = fill(bgMap[e.status])
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: fgMap[e.status] } }
        }
      }

      /* Comment — wrap + top-align */
      if (col === 13) {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
        cell.font = { name: 'Calibri', size: 9, color: { argb: 'FF5A5A56' } }
      }
    })

    if (e.status) statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
    if (e.lev)    supplierCounts[e.lev]  = (supplierCounts[e.lev]  || 0) + 1
  })

  /* ── Summary block ── */
  const addGap = () => {
    const g = ws.addRow([])
    g.height = 8
    ws.mergeCells(`A${g.number}:${LAST_COL_LETTER}${g.number}`)
    ws.getCell(`A${g.number}`).fill = fill(C.paper3)
  }

  addGap()

  const addSectionTitle = (label: string) => {
    const r = ws.addRow([label])
    r.height = 18
    ws.mergeCells(`A${r.number}:${LAST_COL_LETTER}${r.number}`)
    const c = ws.getCell(`A${r.number}`)
    c.font      = { name: 'Calibri', bold: true, size: 10, color: { argb: C.hdrText } }
    c.fill      = fill(C.ink2)
    c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  }

  const addSummaryRow = (label: string, value: string | number, color?: string) => {
    const r = ws.addRow([label, value])
    r.height = 16
    const lc = ws.getCell(`A${r.number}`)
    const vc = ws.getCell(`B${r.number}`)
    lc.font      = { name: 'Calibri', size: 10, color: { argb: C.ink2 } }
    lc.fill      = fill(C.paper2)
    lc.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 }
    lc.border    = thinBorder(C.border)
    vc.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: color ?? C.ink } }
    vc.fill      = fill(C.paper2)
    vc.alignment = { vertical: 'middle', horizontal: 'center' }
    vc.border    = thinBorder(C.border)
  }

  addSectionTitle('  SUMMARY')
  addSummaryRow('Total Shipments', rows.length)
  addSummaryRow('Total Pallets',   rows.reduce((s, e) => s + (Number(e.antal) || 0), 0))
  addSummaryRow('Total Lines',     rows.reduce((s, e) => s + (Number(e.dock)  || 0), 0))

  addGap()
  addSectionTitle('  STATUS BREAKDOWN')
  if (statusCounts['In Transit']) addSummaryRow('In Transit', statusCounts['In Transit'], C.blueFg)
  if (statusCounts['Received'])   addSummaryRow('Received',   statusCounts['Received'],   C.greenFg)
  if (statusCounts['Delayed'])    addSummaryRow('Delayed',    statusCounts['Delayed'],    C.amberFg)

  addGap()
  addSectionTitle('  SUPPLIER BREAKDOWN')
  Object.entries(supplierCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([sup, n]) => addSummaryRow(sup, n))

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

/* ── CSV fallback ─────────────────────────────────────────────────── */
export function exportCSV(rows: Leverans[]) {
  const headers = COLS.map(c => c.header)
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const body = rows.map(e => COLS.map(c => esc(cellVal(e, c.key))).join(','))
  const csv  = '\uFEFF' + [headers.join(','), ...body].join('\n')
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = `inbound_log_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}
