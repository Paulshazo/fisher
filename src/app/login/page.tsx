'use client'
import { useState, useTransition } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await login(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <>
      <div className="topbar">
        <div className="brand"><div className="dot"></div>INBOUND</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 56px)', padding:'2rem' }}>
        <div className="setup-card" style={{ margin: 0 }}>
          <div className="setup-header">
            <h2>Logga in</h2>
            <p>Truckmottagning — Fisher Inbound</p>
          </div>
          <form onSubmit={onSubmit} className="setup-body">
            <div className="field">
              <label>E-post</label>
              <input type="text" name="email" autoComplete="username" required />
            </div>
            <div className="field">
              <label>Lösenord</label>
              <input type="password" name="password" autoComplete="current-password" required />
            </div>
            {error && <div style={{ color:'var(--accent)', fontSize:12 }}>{error}</div>}
            <button type="submit" className="btn bp" disabled={pending} style={{ width:'100%', justifyContent:'center' }}>
              {pending ? 'Loggar in…' : 'Logga in →'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
