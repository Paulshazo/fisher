'use client'
import { useState, useTransition } from 'react'
import type { Leverans, Status } from '@/lib/types'
import { updateLeverans, deleteLeverans } from '@/app/actions'

type Props = {
  row: Leverans
  setData: React.Dispatch<React.SetStateAction<Leverans[]>>
  compact?: boolean
}

export default function RowActions({ row, setData, compact }: Props) {
  const [openLossat, setOpenLossat] = useState(false)
  const [openStatus, setOpenStatus] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [pending, startTransition] = useTransition()
  const [inav, setInav] = useState('')
  const [newStatus, setNewStatus] = useState<Status>(row.status)
  const [newInav, setNewInav] = useState('')

  const update = (patch: Partial<Leverans>) => startTransition(async () => {
    const res = await updateLeverans(row.id, patch)
    if (res.data) setData(prev => prev.map(r => r.id === row.id ? res.data! : r))
  })

  const del = () => startTransition(async () => {
    await deleteLeverans(row.id)
    setData(prev => prev.filter(r => r.id !== row.id))
    setOpenDelete(false)
  })

  return (
    <>
      {row.status !== 'Lossat' && (
        <button className="btn bs btn-sm" onClick={() => setOpenLossat(true)}>✓ Lossat</button>
      )}
      {!compact && (
        <>
          <button className="btn btn-sm" onClick={() => { setNewStatus(row.status); setOpenStatus(true) }} title="Ändra status" style={{ padding:'5px 9px' }}>✎</button>
          <button className="btn btn-sm" onClick={() => setOpenDelete(true)} title="Radera" style={{ padding:'5px 9px', color:'#a32d2d', borderColor:'rgba(163,45,45,.3)' }}>✕</button>
        </>
      )}

      {openLossat && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setOpenLossat(false)}>
          <div className="modal-box">
            <div className="modal-title">Bekräfta mottagning</div>
            <div className="modal-sub">{[row.transport, row.lev, row.po].filter(Boolean).join(' · ') || 'Leverans #' + row.id}</div>
            <div className="field">
              <label>Mottagen Av</label>
              <input type="text" value={inav} onChange={e => setInav(e.target.value)} placeholder="Skriv ditt namn..." autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setOpenLossat(false)}>Avbryt</button>
              <button className="btn bs btn-sm" disabled={pending || !inav.trim()} onClick={() => { update({ status:'Lossat', inav: inav.trim() }); setOpenLossat(false); setInav('') }}>✓ Bekräfta</button>
            </div>
          </div>
        </div>
      )}

      {openStatus && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setOpenStatus(false)}>
          <div className="modal-box">
            <div className="modal-title">Ändra status</div>
            <div className="modal-sub">{[row.transport, row.lev, row.po].filter(Boolean).join(' · ') || 'Leverans'}{'\nNuvarande: ' + row.status}</div>
            <div className="field" style={{ marginBottom:'1rem' }}>
              <label>Ny status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as Status)}>
                <option value="På väg">På väg</option>
                <option value="Försenat">Försenat</option>
                <option value="Lossat">Lossat</option>
              </select>
            </div>
            {newStatus === 'Lossat' && (
              <div className="field" style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:'.5rem' }}>
                <label>Mottagen Av</label>
                <input type="text" value={newInav} onChange={e => setNewInav(e.target.value)} placeholder="Skriv ditt namn..." />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setOpenStatus(false)}>Avbryt</button>
              <button className="btn bp btn-sm" disabled={pending || (newStatus==='Lossat' && !newInav.trim())}
                onClick={() => { update(newStatus==='Lossat' ? { status:newStatus, inav:newInav.trim() } : { status:newStatus, inav:'', utcheckning:'' }); setOpenStatus(false); setNewInav('') }}>Spara</button>
            </div>
          </div>
        </div>
      )}

      {openDelete && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setOpenDelete(false)}>
          <div className="modal-box">
            <div className="modal-title" style={{ color:'var(--accent)' }}>Radera sändning?</div>
            <div className="modal-sub">{[row.lev, row.po].filter(Boolean).join(' — ') || 'Leverans #' + row.id}</div>
            <div style={{ background:'var(--amber-bg)', borderRadius:'var(--radius)', padding:'.75rem 1rem', fontSize:12, color:'var(--amber)', marginBottom:'.25rem' }}>
              ⚠ Denna åtgärd kan inte ångras.
            </div>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setOpenDelete(false)}>Avbryt</button>
              <button className="btn btn-sm" disabled={pending} style={{ background:'#a32d2d', color:'#fff', borderColor:'#a32d2d' }} onClick={del}>Ja, radera</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
