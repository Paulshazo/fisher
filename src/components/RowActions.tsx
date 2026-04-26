'use client'
import { useState, useTransition } from 'react'
import type { Leverans, Status } from '@/lib/types'
import { updateLeverans, deleteLeverans } from '@/app/actions'
import { todayISO } from '@/lib/dates'

type Props = {
  row: Leverans
  setData: React.Dispatch<React.SetStateAction<Leverans[]>>
  compact?: boolean
}

export default function RowActions({ row, setData, compact }: Props) {
  const [openReceive, setOpenReceive] = useState(false)
  const [openDelay,   setOpenDelay]   = useState(false)
  const [openStatus, setOpenStatus]   = useState(false)
  const [openDelete, setOpenDelete]   = useState(false)
  const [pending, startTransition]    = useTransition()
  const [inav, setInav]               = useState('')
  const [delayedBy, setDelayedBy]     = useState('')
  const [newLevdatum, setNewLevdatum] = useState('')
  const [newStatus, setNewStatus]     = useState<Status>(row.status)
  const [newInav, setNewInav]         = useState('')

  const update = (patch: Partial<Leverans>) => startTransition(async () => {
    const res = await updateLeverans(row.id, patch)
    if (res.data) setData(prev => prev.map(r => r.id === row.id ? res.data! : r))
  })

  const del = () => startTransition(async () => {
    await deleteLeverans(row.id)
    setData(prev => prev.filter(r => r.id !== row.id))
    setOpenDelete(false)
  })

  const info = [row.transport, row.lev, row.po].filter(Boolean).join(' · ') || 'Shipment #' + row.id

  return (
    <>
      {row.status !== 'Received' && (
        <button className="btn bs btn-sm" onClick={() => setOpenReceive(true)}>✓ Receive</button>
      )}
      {row.status !== 'Received' && (
        <button
          className="btn btn-sm"
          onClick={() => { setDelayedBy(''); setNewLevdatum(''); setOpenDelay(true) }}
          title="Mark as Delayed — move to new date"
          style={{ color:'var(--amber)', borderColor:'rgba(184,90,0,.35)', background:'var(--amber-bg)' }}
        >⏱ Delayed</button>
      )}
      {!compact && (
        <>
          <button className="btn btn-sm" onClick={() => { setNewStatus(row.status); setOpenStatus(true) }} title="Change status" style={{ padding:'5px 9px' }}>✎</button>
          <button className="btn btn-sm" onClick={() => setOpenDelete(true)} title="Delete" style={{ padding:'5px 9px', color:'#a32d2d', borderColor:'rgba(163,45,45,.3)' }}>✕</button>
        </>
      )}

      {openReceive && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setOpenReceive(false)}>
          <div className="modal-box">
            <div className="modal-title">Confirm Receipt</div>
            <div className="modal-sub">{info}</div>
            <div className="field">
              <label>Received By</label>
              <input type="text" value={inav} onChange={e => setInav(e.target.value)} placeholder="Your name..." autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setOpenReceive(false)}>Cancel</button>
              <button className="btn bs btn-sm" disabled={pending || !inav.trim()}
                onClick={() => { update({ status:'Received', inav: inav.trim() }); setOpenReceive(false); setInav('') }}>
                ✓ Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {openDelay && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setOpenDelay(false)}>
          <div className="modal-box">
            <div className="modal-title" style={{ color:'var(--amber)' }}>⏱ Mark as Delayed</div>
            <div className="modal-sub">{info}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'.875rem', marginBottom:'.5rem' }}>
              <div className="field">
                <label>Moved By — name of person</label>
                <input
                  type="text"
                  value={delayedBy}
                  onChange={e => setDelayedBy(e.target.value)}
                  placeholder="Your name..."
                  autoFocus
                />
              </div>
              <div className="field">
                <label>New Delivery Date</label>
                <input
                  type="date"
                  value={newLevdatum}
                  min={todayISO()}
                  onChange={e => setNewLevdatum(e.target.value)}
                />
              </div>
            </div>
            <div style={{ background:'var(--amber-bg)', borderRadius:'var(--radius)', padding:'.65rem 1rem', fontSize:11, color:'var(--amber)', marginTop:'.5rem' }}>
              ⚠ Shipment will be moved to the new date and marked as Delayed.
            </div>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setOpenDelay(false)}>Cancel</button>
              <button
                className="btn btn-sm"
                disabled={pending || !delayedBy.trim() || !newLevdatum}
                style={{ background:'var(--amber)', color:'#fff', borderColor:'var(--amber)' }}
                onClick={() => {
                  update({ status: 'Delayed', levdatum: newLevdatum, inav: delayedBy.trim() })
                  setOpenDelay(false)
                }}
              >
                ⏱ Confirm Delay
              </button>
            </div>
          </div>
        </div>
      )}

      {openStatus && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setOpenStatus(false)}>
          <div className="modal-box">
            <div className="modal-title">Change Status</div>
            <div className="modal-sub">{info}</div>
            <div className="field" style={{ marginBottom:'1rem' }}>
              <label>New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as Status)}>
                <option value="In Transit">In Transit</option>
                <option value="Delayed">Delayed</option>
                <option value="Received">Received</option>
              </select>
            </div>
            {newStatus === 'Received' && (
              <div className="field" style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:'.5rem' }}>
                <label>Received By</label>
                <input type="text" value={newInav} onChange={e => setNewInav(e.target.value)} placeholder="Your name..." />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setOpenStatus(false)}>Cancel</button>
              <button className="btn bp btn-sm" disabled={pending || (newStatus==='Received' && !newInav.trim())}
                onClick={() => {
                  update(newStatus==='Received' ? { status:newStatus, inav:newInav.trim() } : { status:newStatus, inav:'', utcheckning:'' })
                  setOpenStatus(false); setNewInav('')
                }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {openDelete && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setOpenDelete(false)}>
          <div className="modal-box">
            <div className="modal-title" style={{ color:'var(--accent)' }}>Delete Shipment?</div>
            <div className="modal-sub">{[row.lev, row.po].filter(Boolean).join(' — ') || 'Shipment #' + row.id}</div>
            <div style={{ background:'var(--amber-bg)', borderRadius:'var(--radius)', padding:'.75rem 1rem', fontSize:12, color:'var(--amber)', marginBottom:'.25rem' }}>
              ⚠ This action cannot be undone.
            </div>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setOpenDelete(false)}>Cancel</button>
              <button className="btn btn-sm" disabled={pending} style={{ background:'#a32d2d', color:'#fff', borderColor:'#a32d2d' }} onClick={del}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
