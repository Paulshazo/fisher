'use client'
import { useMemo, useState } from 'react'
import type { Leverans } from '@/lib/types'
import Badge from './Badge'
import RowActions from './RowActions'
import { fmtDate, isoWeekKey, isoWeekLabel, monthKey, monthLabel } from '@/lib/dates'
import ExportModal from './ExportModal'

export default function InboundLog({
  data, setData,
}: { data: Leverans[]; setData: React.Dispatch<React.SetStateAction<Leverans[]>> }) {
  const [q, setQ]   = useState('')
  const [fs, setFs] = useState('')
  const [fl, setFl] = useState('')
  const [fw, setFw] = useState('')   // week filter: "2026-W17"
  const [fm, setFm] = useState('')   // month filter: "2026-04"
  const [showExport, setShowExport] = useState(false)

  /* Build sorted unique week & month lists from actual data */
  const { weekOptions, monthOptions } = useMemo(() => {
    const weeks = new Set<string>()
    const months = new Set<string>()
    data.forEach(e => {
      const d = e.levdatum || e.datum
      if (d) { weeks.add(isoWeekKey(d)); months.add(monthKey(d)) }
    })
    return {
      weekOptions:  Array.from(weeks).sort().reverse(),
      monthOptions: Array.from(months).sort().reverse(),
    }
  }, [data])

  const rows = useMemo(() => data.filter(e => {
    const d = e.levdatum || e.datum
    const m = !q || [e.transport, e.regnr, e.lev, e.po, e.artikel, e.komm, e.inav, e.from_org]
      .join(' ').toLowerCase().includes(q.toLowerCase())
    const wMatch = !fw || (d ? isoWeekKey(d) === fw : false)
    const mMatch = !fm || (d ? monthKey(d) === fm : false)
    return m && (!fs || e.status === fs) && (!fl || e.lev === fl) && wMatch && mMatch
  }), [data, q, fs, fl, fw, fm])

  const isFiltered = !!(q || fs || fl || fw || fm)

  return (
    <div className="screen active">
      <div className="ph">
        <div>
          <div className="pt">Inbound Log</div>
          <div className="ps">{rows.length} records</div>
        </div>
      </div>

      <div className="fr">
        <span className="fl">Filter:</span>
        <input type="text" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />
        <select value={fs} onChange={e => setFs(e.target.value)}>
          <option value="">All statuses</option>
          <option>In Transit</option><option>Received</option><option>Delayed</option>
        </select>
        <select value={fl} onChange={e => setFl(e.target.value)}>
          <option value="">All suppliers</option>
          <option>Fisher France</option><option>Fisher UK</option><option>Fisher Germany</option>
          <option>LED</option><option>CORNING</option><option>EPPENDORF</option><option>OTHER</option>
        </select>
        <select value={fw} onChange={e => setFw(e.target.value)} style={{ maxWidth:170 }}>
          <option value="">All weeks</option>
          {weekOptions.map(wk => (
            <option key={wk} value={wk}>{isoWeekLabel(wk)}</option>
          ))}
        </select>
        <select value={fm} onChange={e => setFm(e.target.value)} style={{ maxWidth:145 }}>
          <option value="">All months</option>
          {monthOptions.map(mk => (
            <option key={mk} value={mk}>{monthLabel(mk)}</option>
          ))}
        </select>
        {isFiltered && (
          <button
            className="btn btn-sm"
            style={{ color:'var(--ink3)', borderColor:'var(--border)', fontSize:10, padding:'4px 9px' }}
            onClick={() => { setQ(''); setFs(''); setFl(''); setFw(''); setFm('') }}
          >✕ Clear</button>
        )}
        <button
          className="btn btn-sm bd"
          style={{ marginLeft: 'auto' }}
          onClick={() => setShowExport(true)}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10v3h10v-3M8 2v8M5 7l3 3 3-3"/>
          </svg>
          Export
        </button>
      </div>

      {/* Desktop table */}
      <div className="tc log-table">
        <div className="ts">
          {rows.length === 0 ? <p className="empty">No records match the filter</p> : (
            <table className="log-tbl">
              <colgroup>
                <col style={{width:'7%'}}/>  {/* Dispatch Date */}
                <col style={{width:'7%'}}/>  {/* Delivery Date */}
                <col style={{width:'5.5%'}}/>{/* Carrier */}
                <col className="col-regby" style={{width:'5.5%'}}/>{/* Registered By */}
                <col style={{width:'8%'}}/>  {/* Supplier */}
                <col style={{width:'10%'}}/> {/* Fisher Ref */}
                <col style={{width:'11%'}}/> {/* Supplier Ref */}
                <col style={{width:'4.5%'}}/>{/* Pallets */}
                <col style={{width:'4.5%'}}/>{/* Lines */}
                <col style={{width:'7%'}}/>  {/* Status */}
                <col style={{width:'5.5%'}}/>{/* Received By */}
                <col className="col-from" style={{width:'5%'}}/>{/* From */}
                <col style={{width:'10%'}}/> {/* Comment */}
                <col style={{width:'9%'}}/>  {/* Action */}
              </colgroup>
              <thead><tr>
                <th>Dispatch Date</th><th>Delivery Date</th><th>Carrier</th>
                <th className="col-regby">Registered By</th>
                <th>Supplier</th><th>Fisher Ref</th><th>Supplier Ref</th>
                <th>Pallets</th><th>Lines</th><th>Status</th><th>Received By</th>
                <th className="col-from">From</th><th>Comment</th><th>Action</th>
              </tr></thead>
              <tbody>{rows.map(e => (
                <tr key={e.id}>
                  <td title={e.datum||''}>{fmtDate(e.datum)}</td>
                  <td title={e.levdatum||''}>{fmtDate(e.levdatum)}</td>
                  <td title={e.transport||''}>{e.transport||'—'}</td>
                  <td className="col-regby" title={e.regnr||''}>{e.regnr||'—'}</td>
                  <td title={e.lev||''}>{e.lev||'—'}</td>
                  <td title={e.po||''}>{e.po||'—'}</td>
                  <td title={e.artikel||''}>{e.artikel||'—'}</td>
                  <td>{e.antal||'—'}</td>
                  <td>{e.dock||'—'}</td>
                  <td><Badge status={e.status}/></td>
                  <td title={e.inav||''}>{e.inav||'—'}</td>
                  <td className="col-from">
                    {e.from_org ? <span style={{ fontSize:10, background:'rgba(26,79,255,.1)', color:'var(--blue)', padding:'2px 7px', borderRadius:2, fontFamily:'var(--font-m)' }}>Fisher {e.from_org}</span> : '—'}
                  </td>
                  <td className="td-comment" title={e.komm||''}>{e.komm||'—'}</td>
                  <td className="td-action"><RowActions row={e} setData={setData}/></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="log-cards">
        {rows.length === 0 ? (
          <div className="tc"><p className="empty">No records match the filter</p></div>
        ) : rows.map(e => (
          <div key={e.id} className="log-card">
            <div className="lc-head">
              <div className="lc-dates">
                <span className="lc-dispatch">{fmtDate(e.datum)}</span>
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.35, flexShrink: 0 }}>
                  <path d="M2 8h12M8 4l4 4-4 4"/>
                </svg>
                <span className="lc-delivery">{fmtDate(e.levdatum)}</span>
              </div>
              <Badge status={e.status}/>
            </div>

            <div className="lc-main">
              <div className="lc-supplier">{e.lev||'—'}</div>
              <div className="lc-meta">
                {e.transport && <span>{e.transport}</span>}
                {e.transport && e.regnr && <span className="lc-dot">·</span>}
                {e.regnr && <span>{e.regnr}</span>}
                {e.from_org && <><span className="lc-dot">·</span><span style={{ color:'var(--blue)' }}>Fisher {e.from_org}</span></>}
              </div>
            </div>

            <div className="lc-refs">
              <div className="lc-ref">
                <span className="lc-ref-l">Fisher Ref</span>
                <span className="lc-ref-v">{e.po||'—'}</span>
              </div>
              <div className="lc-ref">
                <span className="lc-ref-l">Supplier Ref</span>
                <span className="lc-ref-v">{e.artikel||'—'}</span>
              </div>
            </div>

            <div className="lc-stats">
              <div className="lc-stat">
                <span className="lc-stat-v">{e.antal||'—'}</span>
                <span className="lc-stat-l">Pallets</span>
              </div>
              <div className="lc-stat">
                <span className="lc-stat-v">{e.dock||'—'}</span>
                <span className="lc-stat-l">Lines</span>
              </div>
              {e.inav && (
                <div className="lc-stat">
                  <span className="lc-stat-v">{e.inav}</span>
                  <span className="lc-stat-l">Received By</span>
                </div>
              )}
            </div>

            {e.komm && <div className="lc-comment">{e.komm}</div>}

            <div className="lc-actions">
              <RowActions row={e} setData={setData}/>
            </div>
          </div>
        ))}
      </div>

      {showExport && (
        <ExportModal
          rows={rows}
          allRows={data}
          isFiltered={isFiltered}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
