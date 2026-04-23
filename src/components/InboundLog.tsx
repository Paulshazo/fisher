'use client'
import { useMemo, useState } from 'react'
import type { Leverans } from '@/lib/types'
import Badge from './Badge'
import RowActions from './RowActions'
import { fmtDate } from '@/lib/dates'
import { exportCSV } from '@/lib/csv'

export default function InboundLog({
  data, setData,
}: { data: Leverans[]; setData: React.Dispatch<React.SetStateAction<Leverans[]>> }) {
  const [q, setQ]   = useState('')
  const [fs, setFs] = useState('')
  const [fl, setFl] = useState('')

  const rows = useMemo(() => data.filter(e => {
    const m = !q || [e.transport, e.regnr, e.lev, e.po, e.artikel, e.komm, e.inav, e.from_org]
      .join(' ').toLowerCase().includes(q.toLowerCase())
    return m && (!fs || e.status === fs) && (!fl || e.lev === fl)
  }), [data, q, fs, fl])

  return (
    <div className="screen active">
      <div className="ph"><div><div className="pt">Inbound Log</div><div className="ps">{rows.length} records</div></div></div>
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
        <button className="btn btn-sm" style={{ marginLeft:'auto' }} onClick={() => exportCSV(rows)}>↓ CSV</button>
      </div>
      <div className="tc"><div className="ts">
        {rows.length === 0 ? <p className="empty">No records match the filter</p> : (
          <table><thead><tr>
            <th>Dispatch Date</th><th>Delivery Date</th><th>Carrier</th><th>Registered By</th>
            <th>Supplier</th><th>Fisher Ref</th><th>Supplier Ref</th>
            <th>Pallets</th><th>Lines</th><th>Status</th><th>Received By</th><th>From</th><th>Comment</th><th>Action</th>
          </tr></thead>
          <tbody>{rows.map(e => (
            <tr key={e.id}>
              <td>{fmtDate(e.datum)}</td><td>{fmtDate(e.levdatum)}</td><td>{e.transport||'—'}</td><td>{e.regnr||'—'}</td>
              <td>{e.lev||'—'}</td><td>{e.po||'—'}</td><td>{e.artikel||'—'}</td>
              <td>{e.antal||'—'}</td><td>{e.dock||'—'}</td><td><Badge status={e.status}/></td>
              <td>{e.inav||'—'}</td>
              <td>{e.from_org ? <span style={{ fontSize:10, background:'rgba(26,79,255,.1)', color:'var(--blue)', padding:'2px 7px', borderRadius:2, fontFamily:'var(--font-m)' }}>Fisher {e.from_org}</span> : '—'}</td>
              <td style={{ maxWidth:140, whiteSpace:'normal' }}>{e.komm||'—'}</td>
              <td style={{ display:'flex', gap:5 }}><RowActions row={e} setData={setData}/></td>
            </tr>
          ))}</tbody></table>
        )}
      </div></div>
    </div>
  )
}
