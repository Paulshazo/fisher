'use client'
import { useState, useTransition } from 'react'
import { createLeverans } from '@/app/actions'
import { todayISO } from '@/lib/dates'
import type { Leverans, Status } from '@/lib/types'

const blank = {
  datum: '', levdatum: '', status: 'In Transit' as Status,
  transport: '', regnr: '', lev: '', po: '', artikel: '', antal: '', dock: '', komm: '',
}

export default function Registrering({ org, onCreated }: { org: string; onCreated: (r: Leverans) => void }) {
  const [form, setForm] = useState({ ...blank, datum: todayISO(), levdatum: todayISO() })
  const [pending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const set = <K extends keyof typeof blank>(k: K, v: string) => setForm(f => ({ ...f, [k]: v }))

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  function submit() {
    if (!form.transport && !form.regnr) { showToast('Enter carrier or registered by', false); return }
    startTransition(async () => {
      const res = await createLeverans({ ...form, org })
      if (res.error) { showToast('Error: ' + res.error, false); return }
      if (res.data) { onCreated(res.data); setForm({ ...blank, datum: todayISO(), levdatum: todayISO() }); showToast('Shipment registered!', true) }
    })
  }

  return (
    <div className="screen active">
      <div className="ph"><div><div className="pt">Register Shipment</div><div className="ps">New incoming shipment</div></div></div>
      <div className="fcard">
        <div className="fch">
          <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="rgba(247,245,240,.6)" strokeWidth={1.5}><rect x="3" y="2" width="10" height="12" rx="1"/><line x1="6" y1="6" x2="10" y2="6"/><line x1="6" y1="9" x2="10" y2="9"/></svg>
          <span className="fct">Shipment Information</span>
        </div>
        <div className="fb">
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
                <option>DACHSER</option><option>HEPPNER</option><option>DSV</option><option>ANNAT</option>
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
            <button className="btn bp" disabled={pending} onClick={submit}>{pending ? 'Saving…' : 'Register Shipment →'}</button>
          </div>
        </div>
      </div>
      {toast && <div className="toast show" style={{ borderLeftColor: toast.ok ? '#1a7a3f' : '#e8500a' }}>{toast.msg}</div>}
    </div>
  )
}
