'use client'
import { useState } from 'react'
import type { Leverans } from '@/lib/types'
import { exportExcel, exportCSV } from '@/lib/export'

interface Props {
  rows: Leverans[]
  allRows: Leverans[]
  isFiltered: boolean
  onClose: () => void
}

const STATUS_COLOR: Record<string, string> = {
  'In Transit': 'var(--blue)',
  'Received':   'var(--green)',
  'Delayed':    'var(--amber)',
}

export default function ExportModal({ rows, allRows, isFiltered, onClose }: Props) {
  const [scope, setScope] = useState<'filtered' | 'all'>(isFiltered ? 'filtered' : 'all')
  const target = scope === 'filtered' ? rows : allRows

  const byStatus = target.reduce<Record<string, number>>((acc, e) => {
    if (e.status) acc[e.status] = (acc[e.status] || 0) + 1
    return acc
  }, {})

  function handleExcel() { exportExcel(target).then(() => onClose()) }
  function handleCSV()   { exportCSV(target); onClose() }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="em-box">

        {/* Header */}
        <div className="em-hd">
          <div className="em-hd-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="em-title">Export Inbound Log</div>
            <div className="em-sub">Choose scope and download format</div>
          </div>
          <button className="em-close" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        </div>

        <div className="em-body">

          {/* Scope selector — only shown when a filter is active */}
          {isFiltered && (
            <div className="em-scope">
              <button
                className={`em-scope-opt${scope === 'filtered' ? ' active' : ''}`}
                onClick={() => setScope('filtered')}
              >
                <div className="em-scope-name">Filtered view</div>
                <div className="em-scope-count">{rows.length} records</div>
              </button>
              <button
                className={`em-scope-opt${scope === 'all' ? ' active' : ''}`}
                onClick={() => setScope('all')}
              >
                <div className="em-scope-name">All records</div>
                <div className="em-scope-count">{allRows.length} records</div>
              </button>
            </div>
          )}

          {/* Preview stats */}
          <div className="em-preview">
            <div className="em-prev-stat">
              <div className="em-prev-v">{target.length}</div>
              <div className="em-prev-l">Rows</div>
            </div>
            <div className="em-prev-stat">
              <div className="em-prev-v">13</div>
              <div className="em-prev-l">Columns</div>
            </div>
            {Object.entries(byStatus).map(([s, n]) => (
              <div key={s} className="em-prev-stat">
                <div className="em-prev-v" style={{ color: STATUS_COLOR[s] }}>{n}</div>
                <div className="em-prev-l">{s}</div>
              </div>
            ))}
          </div>

          {/* Columns preview */}
          <div className="em-cols">
            <div className="em-cols-label">Columns included</div>
            <div className="em-cols-list">
              {['Dispatch Date','Delivery Date','Carrier','Registered By','Supplier',
                'Fisher Ref','Supplier Ref','Pallets','Lines','Status',
                'Received By','From','Comment'].map(c => (
                <span key={c} className="em-col-tag">{c}</span>
              ))}
            </div>
          </div>

          {/* Format buttons */}
          <div className="em-formats">
            <button className="em-fmt" onClick={handleExcel}>
              <div className="em-fmt-badge excel">XLS</div>
              <div className="em-fmt-info">
                <div className="em-fmt-name">Excel Workbook</div>
                <div className="em-fmt-desc">.xlsx — Auto column widths, clean table layout</div>
              </div>
              <svg className="em-fmt-arr" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="7" x2="13" y2="7"/><polyline points="8 2 13 7 8 12"/>
              </svg>
            </button>
            <button className="em-fmt" onClick={handleCSV}>
              <div className="em-fmt-badge csv">CSV</div>
              <div className="em-fmt-info">
                <div className="em-fmt-name">CSV File</div>
                <div className="em-fmt-desc">.csv — Plain text, compatible with any tool</div>
              </div>
              <svg className="em-fmt-arr" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="7" x2="13" y2="7"/><polyline points="8 2 13 7 8 12"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
