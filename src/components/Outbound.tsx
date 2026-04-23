'use client'
import { useMemo, useState, useTransition } from 'react'
import { createLeverans } from '@/app/actions'
import { todayISO, fmtDate } from '@/lib/dates'
import { exportCSV } from '@/lib/csv'
import type { Leverans, Status } from '@/lib/types'
import { ORGS, ORG_LABEL } from '@/lib/types'
import Badge from './Badge'
import RowActions from './RowActions'

const blank = {
  datum: '', levdatum: '', status: 'In Transit' as Status,
  transport: '', regnr: '', lev: '', po: '', artikel: '', antal: '', dock: '', komm: '',
}

export default function Outbound({
  org, allData, setData,
}: { org: string; allData: Leverans[]; setData: React.Dispatch<React.SetStateAction<Leverans[]>> }) {
  const [form, setForm]     = useState({ ...blank, datum: todayISO(), levdatum: todayISO() })
  const [toFisher, setTo]   = useState<string>(ORGS.filter(o => o !== org)[0] ?? 'UK')
  const [pending, startTransition] = useTransition()
  const [toast, setToast]   = useState<{ msg: string; ok: boolean } | null>(null)

  const set = <K extends keyof typeof blank>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))

  const outboundLog = useMemo(() =>
    allData.filter(e => e.from_org === org),
    [allData, org]
  )

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  function submit() {
    if (!form.transport && !form.regnr) { showToast('Enter carrier or registered by', false); return }
    if (toFisher === org) { showToast('Destination cannot be the same as source', false); return }
    startTransition(async () => {
      const res = await createLeverans({ ...form, org: toFisher, from_org: org })
      if (res.error) { showToast('Error: ' + res.error, false); return }
      if (res.data) {
        setData(prev => [res.data!, ...prev])
        setForm({ ...blank, datum: todayISO(), levdatum: todayISO() })
        showToast(`Shipment sent to ${ORG_LABEL[toFisher]}!`, true)
      }
    })
  }

  return (
    <div className="screen active">
      <div className="ph"><div><div className="pt">Outbound</div><div className="ps">Send shipment to another Fisher</div></div></div>

      {/* Send form */}
      <div className="fcard" style={{ marginBottom:'1.5rem' }}>
        <div className="fch">
          <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="rgba(247,245,240,.6)" strokeWidth={1.5}><path d="M2 8h10M8 4l4 4-4 4"/></svg>
          <span className="fct">Send Shipment</span>
        </div>
        <div className="fb">
          {/* To Fisher — prominent field */}
          <div style={{ background:'rgba(26,79,255,.06)', border:'1px solid rgba(26,79,255,.15)', borderRadius:'var(--radius-lg)', padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'var(--blue)', fontFamily:'var(--font-m)', letterSpacing:'.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>To Fisher</span>
            <select value={toFisher} onChange={e => setTo(e.target.value)}
              style={{ fontFamily:'var(--font-d)', fontWeight:700, fontSize:14, flex:1, minWidth:160, color:'var(--ink)', border:'1px solid rgba(26,79,255,.3)', background:'#fff' }}>
              {ORGS.filter(o => o !== org).map(o => (
                <option key={o} value={o}>{ORG_LABEL[o]}</option>
              ))}
            </select>
            <span style={{ fontSize:11, color:'var(--ink3)', fontFamily:'var(--font-m)' }}>from <strong style={{ color:'var(--ink)' }}>{ORG_LABEL[org]}</strong></span>
          </div>

          <div className="fg fg3">
            <div className="field"><label>Dispatch Date</label><input type="date" value={form.datum} onChange={e => set('datum', e.target.value)} /></div>
            <div className="field"><label>Delivery Date</label><input type="date" value={form.levdatum} onChange={e => set('levdatum', e.target.value)} /></div>
            <div className="field"><label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="In Transit">In Transit</option>
                <option value="Received">Received</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>
          <div className="fg">
            <div className="field"><label>Carrier</label>
              <select value={form.transport} onChange={e => set('transport', e.target.value)}>
                <option value="">Select carrier...</option>
                <option>DACHSER</option><option>HEPPNER</option><option>DSV</option><option>OTHER</option>
              </select>
            </div>
            <div className="field"><label>Registered By</label><input type="text" placeholder="Your name" value={form.regnr} onChange={e => set('regnr', e.target.value)} /></div>
            <div className="field"><label>Supplier</label>
              <select value={form.lev} onChange={e => set('lev', e.target.value)}>
                <option value="">Select supplier...</option>
                <option>Fisher France</option><option>Fisher UK</option><option>Fisher Germany</option>
                <option>LED</option><option>CORNING</option><option>EPPENDORF</option><option>OTHER</option>
              </select>
            </div>
            <div className="field"><label>Fisher Reference</label><input type="text" placeholder="FR-12345" value={form.po} onChange={e => set('po', e.target.value)} /></div>
            <div className="field"><label>Supplier Reference</label><input type="text" placeholder="Supplier ref..." value={form.artikel} onChange={e => set('artikel', e.target.value)} /></div>
            <div className="field"><label>Pallet Count</label><input type="number" min={0} placeholder="0" value={form.antal} onChange={e => set('antal', e.target.value)} /></div>
            <div className="field"><label>Line Count</label><input type="number" min={0} placeholder="0" value={form.dock} onChange={e => set('dock', e.target.value)} /></div>
            <div className="field full"><label>Comment</label><textarea placeholder="Optional note..." value={form.komm} onChange={e => set('komm', e.target.value)} /></div>
          </div>
          <div className="ar">
            <button className="btn" onClick={() => setForm({ ...blank, datum: todayISO(), levdatum: todayISO() })}>Clear</button>
            <button className="btn bp" disabled={pending} onClick={submit}>{pending ? 'Sending…' : `Send to ${ORG_LABEL[toFisher]} →`}</button>
          </div>
        </div>
      </div>

      {/* Outbound history */}
      <div className="tc">
        <div className="tch">
          <span className="tct">Outbound History — sent from {ORG_LABEL[org]}</span>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:11, color:'var(--ink3)' }}>{outboundLog.length} records</span>
            {outboundLog.length > 0 && <button className="btn btn-sm" onClick={() => exportCSV(outboundLog)}>↓ CSV</button>}
          </div>
        </div>
        <div className="ts">
          {outboundLog.length === 0 ? <p className="empty">No outbound shipments sent yet</p> : (
            <table><thead><tr>
              <th>Dispatch Date</th><th>Delivery Date</th><th>To Fisher</th><th>Carrier</th>
              <th>Supplier</th><th>Fisher Ref</th><th>Pallets</th><th>Lines</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>{outboundLog.map(e => (
              <tr key={e.id}>
                <td>{fmtDate(e.datum)}</td><td>{fmtDate(e.levdatum)}</td>
                <td><span style={{ fontSize:10, background:'rgba(26,79,255,.1)', color:'var(--blue)', padding:'2px 7px', borderRadius:2 }}>Fisher {e.org}</span></td>
                <td>{e.transport||'—'}</td><td>{e.lev||'—'}</td><td>{e.po||'—'}</td>
                <td>{e.antal||'—'}</td><td>{e.dock||'—'}</td><td><Badge status={e.status}/></td>
                <td style={{ display:'flex', gap:5 }}><RowActions row={e} setData={setData}/></td>
              </tr>
            ))}</tbody></table>
          )}
        </div>
      </div>

      {toast && <div className="toast show" style={{ borderLeftColor: toast.ok ? '#1a7a3f' : '#e8500a' }}>{toast.msg}</div>}
    </div>
  )
}
