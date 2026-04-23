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

  const dayAll = data.filter(e => (e.levdatum || e.datum) === selDate)
  const active = data.filter(e => e.status !== 'Lossat')

  const metrics = useMemo(() => {
    const dayEntries = data.filter(e => (e.levdatum || e.datum) === selDate)
    const totPallar  = dayEntries.reduce((s,e) => s + (parseInt(e.antal || '0') || 0), 0)
    const mottPallar = dayEntries.filter(e => e.status==='Lossat').reduce((s,e) => s + (parseInt(e.antal || '0') || 0), 0)
    const paVagPallar = dayEntries.filter(e => e.status!=='Lossat').reduce((s,e) => s + (parseInt(e.antal || '0') || 0), 0)
    const totRader   = dayEntries.reduce((s,e) => s + (parseInt(e.dock || '0') || 0), 0)
    const mottRader  = dayEntries.filter(e => e.status==='Lossat').reduce((s,e) => s + (parseInt(e.dock || '0') || 0), 0)
    return { totPallar, mottPallar, paVagPallar, totRader, mottRader }
  }, [data, selDate])

  const wr = getWeekRange(selDate)
  const weekDays: string[] = []
  for (let i=0; i<7; i++) {
    const d = new Date(wr.mon); d.setDate(wr.mon.getDate()+i)
    weekDays.push(d.toISOString().slice(0,10))
  }

  const selDateLong = new Date(selDate+'T12:00:00').toLocaleDateString('sv-SE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const selDateShort = new Date(selDate+'T12:00:00').toLocaleDateString('sv-SE', { weekday:'short', day:'numeric', month:'short' })

  return (
    <div className="screen active">
      <div className="ph">
        <div><div className="pt">Dashboard</div><div className="ps">{selDateLong}</div></div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} style={{ fontSize:12, padding:'6px 10px', border:'1px solid var(--border2)', borderRadius:'var(--radius)', background:'var(--paper)', color:'var(--ink)', fontFamily:'var(--font-m)', width:'auto' }} />
          <button className="btn bd btn-sm" onClick={() => setSelDate(todayISO())}>Idag</button>
        </div>
      </div>

      <div className="mg">
        <div className="metric"><div className="ml">Totala pallar</div><div className="mv b">{metrics.totPallar}</div><div className="ma b"></div></div>
        <div className="metric"><div className="ml">Mottagna pallar</div><div className="mv g">{metrics.mottPallar}</div><div className="ma g"></div></div>
        <div className="metric"><div className="ml">Pallar på väg</div><div className="mv o">{metrics.paVagPallar}</div><div className="ma o"></div></div>
        <div className="metric"><div className="ml">Totala rader</div><div className="mv b">{metrics.totRader}</div><div className="ma b"></div></div>
        <div className="metric"><div className="ml">Mottagna rader</div><div className="mv g">{metrics.mottRader}</div><div className="ma g"></div></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="tc">
          <div className="tch">
            <span className="tct">Planerat {selDateShort}</span>
            <span style={{ fontSize:11, color:'var(--ink3)' }}>{dayAll.length} sändningar</span>
          </div>
          <div className="ts">
            {dayAll.length === 0 ? <p className="empty">Inga leveranser planerade</p> : (
              <table><thead><tr><th>Transportör</th><th>Leverantör</th><th>Pallar</th><th>Rader</th><th>Status</th><th>Åtgärd</th></tr></thead>
              <tbody>{dayAll.map(e => (
                <tr key={e.id}><td>{e.transport||'—'}</td><td>{e.lev||'—'}</td><td>{e.antal||'—'}</td><td>{e.dock||'—'}</td><td><Badge status={e.status}/></td>
                <td><RowActions row={e} compact setData={setData} /></td></tr>
              ))}</tbody></table>
            )}
          </div>
        </div>

        <div className="tc">
          <div className="tch">
            <span className="tct">Veckans leveranser</span>
            <span style={{ fontSize:11, color:'var(--ink3)' }}>{fmtDate(wr.monStr)} – {fmtDate(wr.sunStr)}</span>
          </div>
          <div className="ts">
            <table><thead><tr><th>Dag</th><th style={{ textAlign:'center' }}>Sändningar</th><th style={{ textAlign:'center' }}>Pallar</th><th style={{ textAlign:'center' }}>Rader</th><th style={{ textAlign:'center' }}>Mottagna</th></tr></thead>
            <tbody>{weekDays.map(ds => {
              const entries = data.filter(e => (e.levdatum || e.datum) === ds)
              const pal = entries.reduce((s,e) => s + (parseInt(e.antal||'0')||0), 0)
              const rad = entries.reduce((s,e) => s + (parseInt(e.dock||'0')||0), 0)
              const mot = entries.filter(e => e.status==='Lossat').length
              const isSel = ds === selDate, isToday = ds === todayISO()
              const d = new Date(ds+'T12:00:00').toLocaleDateString('sv-SE', { weekday:'short', day:'numeric', month:'short' })
              return (
                <tr key={ds} style={{ background: isSel?'rgba(26,79,255,.07)':undefined, cursor:'pointer' }} onClick={() => setSelDate(ds)}>
                  <td style={{ color: isToday?'var(--accent)':(isSel?'var(--blue)':'var(--ink)'), fontWeight: isSel?500:400 }}>{d}</td>
                  <td style={{ textAlign:'center' }}>{entries.length || '—'}</td>
                  <td style={{ textAlign:'center' }}>{pal || '—'}</td>
                  <td style={{ textAlign:'center' }}>{rad || '—'}</td>
                  <td style={{ textAlign:'center' }}>{mot || '—'}</td>
                </tr>
              )
            })}</tbody></table>
          </div>
        </div>
      </div>

      <div className="tc">
        <div className="tch">
          <span className="tct">Aktiva leveranser (ej mottagna)</span>
          <span style={{ fontSize:11, color:'var(--ink3)' }}>{active.length} poster</span>
        </div>
        <div className="ts">
          {active.length === 0 ? <p className="empty">Inga aktiva leveranser</p> : (
            <table><thead><tr><th>Leverans Datum</th><th>Transportör</th><th>Leverantör</th><th>Fisher Ref</th><th>Pallar</th><th>Rader</th><th>Status</th><th>Åtgärd</th></tr></thead>
            <tbody>{active.map(e => (
              <tr key={e.id}><td>{fmtDate(e.levdatum || e.datum)}</td><td>{e.transport||'—'}</td><td>{e.lev||'—'}</td><td>{e.po||'—'}</td><td>{e.antal||'—'}</td><td>{e.dock||'—'}</td><td><Badge status={e.status}/></td>
              <td><RowActions row={e} compact setData={setData} /></td></tr>
            ))}</tbody></table>
          )}
        </div>
      </div>
    </div>
  )
}
