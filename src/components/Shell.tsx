'use client'
import { useEffect, useState } from 'react'
import type { Leverans } from '@/lib/types'
import Dashboard from './Dashboard'
import Registrering from './Registrering'
import InboundLog from './InboundLog'
import { exportCSV } from '@/lib/csv'

type Tab = 'dashboard' | 'registrering' | 'log'

export default function Shell({ initialData }: { initialData: Leverans[] }) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [clock, setClock] = useState('')
  const [data, setData] = useState<Leverans[]>(initialData)

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const dayStr = d.toLocaleDateString('sv-SE', { weekday:'short', day:'numeric', month:'short' })
      const timeStr = d.toLocaleTimeString('sv-SE', { hour:'2-digit', minute:'2-digit' })
      setClock(`${dayStr}  ${timeStr}`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="topbar">
        <div className="brand"><div className="dot"></div>INBOUND</div>
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <div className="db-status"><div className="db-dot ok"></div><span>ansluten</span></div>
          <div className="clock">{clock}</div>
        </div>
      </div>
      <div className="layout">
        <aside className="sidebar">
          <button className={`nav-item ${tab==='dashboard'?'active':''}`} onClick={() => setTab('dashboard')}>
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
            Dashboard
          </button>
          <button className={`nav-item ${tab==='registrering'?'active':''}`} onClick={() => setTab('registrering')}>
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="2" width="10" height="12" rx="1"/><line x1="6" y1="6" x2="10" y2="6"/><line x1="6" y1="9" x2="10" y2="9"/></svg>
            Registrering
          </button>
          <button className={`nav-item ${tab==='log'?'active':''}`} onClick={() => setTab('log')}>
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="9" y2="12"/></svg>
            Inbound Log
          </button>
          <div className="sdiv"></div>
          <button className="nav-item" onClick={() => exportCSV(data)}>
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 10v3h10v-3M8 2v8M5 7l3 3 3-3"/></svg>
            Exportera CSV
          </button>
        </aside>
        <main className="main">
          {tab === 'dashboard'    && <Dashboard data={data} setData={setData} />}
          {tab === 'registrering' && <Registrering onCreated={row => setData(prev => [row, ...prev])} />}
          {tab === 'log'          && <InboundLog data={data} setData={setData} />}
        </main>
      </div>
    </>
  )
}
