'use client'
import { useMemo, useState } from 'react'
import type { Leverans } from '@/lib/types'
import Badge from './Badge'
import { fmtDate, getWeekRange, todayISO } from '@/lib/dates'
import RowActions from './RowActions'

export default function Dashboard({
  data, setData,
}: { data: Leverans[]; setData: React.Dispatch<React.SetStateAction<Leverans[]>> }) {
  const [selDate, setSelDate] = useState<string>(todayISO())

  const dayAll  = data.filter(e => (e.levdatum || e.datum) === selDate)
  const active  = data.filter(e => e.status !== 'Received')

  const metrics = useMemo(() => {
    const d = data.filter(e => (e.levdatum || e.datum) === selDate)
    const tot   = d.reduce((s,e) => s + (parseInt(e.antal||'0')||0), 0)
    const recv  = d.filter(e => e.status==='Received').reduce((s,e) => s + (parseInt(e.antal||'0')||0), 0)
    const trans = d.filter(e => e.status!=='Received').reduce((s,e) => s + (parseInt(e.antal||'0')||0), 0)
    const totL  = d.reduce((s,e) => s + (parseInt(e.dock||'0')||0), 0)
    const recvL = d.filter(e => e.status==='Received').reduce((s,e) => s + (parseInt(e.dock||'0')||0), 0)
    return { tot, recv, trans, totL, recvL }
  }, [data, selDate])

  const wr = getWeekRange(selDate)
  const weekDays: string[] = []
  for (let i=0; i<7; i++) { const d = new Date(wr.mon); d.setDate(wr.mon.getDate()+i); weekDays.push(d.toISOString().slice(0,10)) }

  const selLong  = new Date(selDate+'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const selShort = new Date(selDate+'T12:00:00').toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })

  return (
    <div className="screen active">
      <div className="ph">
        <div><div className="pt">Dashboard</div><div className="ps">{selLong}</div></div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)}
            style={{ fontSize:12, padding:'6px 10px', border:'1px solid var(--border2)', borderRadius:'var(--radius)', background:'var(--paper)', color:'var(--ink)', fontFamily:'var(--font-m)', width:'auto' }} />
          <button className="btn bd btn-sm" onClick={() => setSelDate(todayISO())}>Today</button>
        </div>
      </div>

      <div className="mg">
        <div className="metric"><div className="ml">Total Pallets</div><div className="mv b">{metrics.tot}</div><div className="ma b"></div></div>
        <div className="metric"><div className="ml">Received</div><div className="mv g">{metrics.recv}</div><div className="ma g"></div></div>
        <div className="metric"><div className="ml">In Transit</div><div className="mv o">{metrics.trans}</div><div className="ma o"></div></div>
        <div className="metric"><div className="ml">Total Lines</div><div className="mv b">{metrics.totL}</div><div className="ma b"></div></div>
        <div className="metric"><div className="ml">Received Lines</div><div className="mv g">{metrics.recvL}</div><div className="ma g"></div></div>
      </div>

      <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="tc">
          <div className="tch">
            <span className="tct">Planned {selShort}</span>
            <span style={{ fontSize:11, color:'var(--ink3)' }}>{dayAll.length} shipments</span>
          </div>
          <div className="ts">
            {dayAll.length === 0 ? <p className="empty">No deliveries planned</p> : (
              <table><thead><tr><th>Carrier</th><th>Supplier</th><th>Pallets</th><th>Lines</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{dayAll.map(e => (
                <tr key={e.id}><td>{e.transport||'—'}</td><td>{e.lev||'—'}</td><td>{e.antal||'—'}</td><td>{e.dock||'—'}</td>
                <td><Badge status={e.status}/></td><td><RowActions row={e} compact setData={setData}/></td></tr>
              ))}</tbody></table>
            )}
          </div>
        </div>

        <div className="tc">
          <div className="tch">
            <span className="tct">Weekly Overview</span>
            <span style={{ fontSize:11, color:'var(--ink3)' }}>{fmtDate(wr.monStr)} – {fmtDate(wr.sunStr)}</span>
          </div>
          <div className="ts">
            <table><thead><tr><th>Day</th><th style={{textAlign:'center'}}>Shipments</th><th style={{textAlign:'center'}}>Pallets</th><th style={{textAlign:'center'}}>Lines</th><th style={{textAlign:'center'}}>Received</th></tr></thead>
            <tbody>{weekDays.map(ds => {
              const entries = data.filter(e => (e.levdatum||e.datum) === ds)
              const pal = entries.reduce((s,e)=>s+(parseInt(e.antal||'0')||0),0)
              const lin = entries.reduce((s,e)=>s+(parseInt(e.dock||'0')||0),0)
              const rec = entries.filter(e=>e.status==='Received').length
              const isSel=ds===selDate, isToday=ds===todayISO()
              const d = new Date(ds+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})
              return (
                <tr key={ds} style={{ background:isSel?'rgba(26,79,255,.07)':undefined, cursor:'pointer' }} onClick={()=>setSelDate(ds)}>
                  <td style={{ color:isToday?'var(--accent)':(isSel?'var(--blue)':'var(--ink)'), fontWeight:isSel?500:400 }}>{d}</td>
                  <td style={{textAlign:'center'}}>{entries.length||'—'}</td>
                  <td style={{textAlign:'center'}}>{pal||'—'}</td>
                  <td style={{textAlign:'center'}}>{lin||'—'}</td>
                  <td style={{textAlign:'center'}}>{rec||'—'}</td>
                </tr>
              )
            })}</tbody></table>
          </div>
        </div>
      </div>

      <div className="tc">
        <div className="tch">
          <span className="tct">Active Shipments (not received)</span>
          <span style={{ fontSize:11, color:'var(--ink3)' }}>{active.length} records</span>
        </div>
        <div className="ts">
          {active.length === 0 ? <p className="empty">No active shipments</p> : (
            <table><thead><tr><th>Delivery Date</th><th>Carrier</th><th>Supplier</th><th>Fisher Ref</th><th>Pallets</th><th>Lines</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{active.map(e => (
              <tr key={e.id}><td>{fmtDate(e.levdatum||e.datum)}</td><td>{e.transport||'—'}</td><td>{e.lev||'—'}</td>
              <td>{e.po||'—'}</td><td>{e.antal||'—'}</td><td>{e.dock||'—'}</td><td><Badge status={e.status}/></td>
              <td><RowActions row={e} compact setData={setData}/></td></tr>
            ))}</tbody></table>
          )}
        </div>
      </div>
    </div>
  )
}
