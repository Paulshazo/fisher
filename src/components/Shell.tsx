'use client'
import { useEffect, useMemo, useState } from 'react'
import type { Leverans } from '@/lib/types'
import { ORGS, ORG_LABEL } from '@/lib/types'
import Dashboard from './Dashboard'
import Registrering from './Registrering'
import InboundLog from './InboundLog'
import Outbound from './Outbound'
import { exportExcel } from '@/lib/export'

type Tab = 'dashboard' | 'registration' | 'inbound' | 'outbound'

const ORG_KEY = 'fisher_org'

export default function Shell({ initialData }: { initialData: Leverans[] }) {
  const [tab, setTab]   = useState<Tab>('dashboard')
  const [clock, setClock] = useState('')
  const [data, setData] = useState<Leverans[]>(initialData)
  const [org, setOrgState] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(ORG_KEY) || 'SE'
    return 'SE'
  })

  function setOrg(o: string) {
    setOrgState(o)
    if (typeof window !== 'undefined') localStorage.setItem(ORG_KEY, o)
  }

  useEffect(() => {
    const saved = localStorage.getItem(ORG_KEY)
    if (saved) setOrgState(saved)
  }, [])

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock(
        d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }) +
        '  ' +
        d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
      )
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const orgData = useMemo(() =>
    data.filter(e => !e.org || e.org === org),
    [data, org]
  )

  const tabs: { id: Tab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard', label: 'Dashboard', shortLabel: 'Dash',
      icon: <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
    },
    {
      id: 'registration', label: 'Registration', shortLabel: 'Register',
      icon: <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="2" width="10" height="12" rx="1"/><line x1="6" y1="6" x2="10" y2="6"/><line x1="6" y1="9" x2="10" y2="9"/></svg>
    },
    {
      id: 'inbound', label: 'Inbound Log', shortLabel: 'Inbound',
      icon: <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="9" y2="12"/></svg>
    },
    {
      id: 'outbound', label: 'Outbound', shortLabel: 'Outbound',
      icon: <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M2 8h10M8 4l4 4-4 4"/></svg>
    },
  ]

  return (
    <>
      <div className="topbar">
        <div className="brand"><div className="dot"></div>INBOUND</div>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          {/* Org selector — shown on mobile in topbar */}
          <div className="topbar-org">
            <select value={org} onChange={e => setOrg(e.target.value)}>
              {ORGS.map(o => <option key={o} value={o}>{ORG_LABEL[o]}</option>)}
            </select>
          </div>
          <div className="db-status"><div className="db-dot ok"></div><span>connected</span></div>
          <div className="clock">{clock}</div>
        </div>
      </div>

      <div className="layout">
        <aside className="sidebar">
          {/* Org selector — desktop only */}
          <div className="sidebar-org">
            <span className="org-label">Organisation</span>
            <div className="org-select-wrap">
              <select className="org-select" value={org} onChange={e => setOrg(e.target.value)}>
                {ORGS.map(o => <option key={o} value={o}>{ORG_LABEL[o]}</option>)}
              </select>
            </div>
          </div>

          <div style={{ height:8 }} />

          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              {t.icon}
              <span className="nav-label">{t.label}</span>
              <span style={{ display:'none' }} className="nav-short">{t.shortLabel}</span>
            </button>
          ))}

          <div className="sdiv" />

          <button className="nav-item" onClick={() => exportExcel(orgData)}>
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 10v3h10v-3M8 2v8M5 7l3 3 3-3"/></svg>
            <span className="nav-label">Export Excel</span>
          </button>
        </aside>

        <main className="main">
          {tab === 'dashboard'   && <Dashboard    data={orgData}  setData={setData} />}
          {tab === 'registration'&& <Registrering org={org} onCreated={row => setData(prev => [row, ...prev])} />}
          {tab === 'inbound'     && <InboundLog   data={orgData}  setData={setData} />}
          {tab === 'outbound'    && <Outbound     org={org} allData={data} setData={setData} />}
        </main>
      </div>
    </>
  )
}
