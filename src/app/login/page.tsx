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
    <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', flexDirection:'column' }}>

      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', height:56, borderBottom:'1px solid rgba(247,245,240,.08)' }}>
        <div className="brand"><div className="dot"></div>INBOUND</div>
        <span style={{ fontSize:11, color:'rgba(247,245,240,.25)', fontFamily:'var(--font-m)', letterSpacing:'.06em' }}>FISHER SCIENTIFIC</span>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex' }}>

        {/* Left — branding panel */}
        <div style={{ width:420, padding:'4rem 3rem', borderRight:'1px solid rgba(247,245,240,.07)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11, color:'rgba(247,245,240,.3)', letterSpacing:'.12em', textTransform:'uppercase', fontFamily:'var(--font-m)', marginBottom:'1.5rem' }}>Truckmottagning</div>
            <div style={{ fontFamily:'var(--font-d)', fontSize:42, fontWeight:800, color:'var(--paper)', lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:'1rem' }}>
              Inbound<br/>
              <span style={{ color:'var(--accent)' }}>Logistics</span>
            </div>
            <div style={{ fontSize:12, color:'rgba(247,245,240,.4)', fontFamily:'var(--font-m)', lineHeight:1.8, maxWidth:280 }}>
              Hantera inkommande leveranser, transportörer och lagerkvitton i realtid.
            </div>
          </div>

          {/* Stats decoration */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'Transportörer', val:'DACHSER · HEPPNER · DSV' },
              { label:'Leverantörer', val:'Fisher France · Fisher UK · Germany' },
              { label:'Status', val:'På väg · Lossat · Försenat' },
            ].map(s => (
              <div key={s.label} style={{ display:'flex', flexDirection:'column', gap:3, padding:'10px 0', borderTop:'1px solid rgba(247,245,240,.06)' }}>
                <span style={{ fontSize:9, color:'rgba(247,245,240,.25)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:'var(--font-m)' }}>{s.label}</span>
                <span style={{ fontSize:11, color:'rgba(247,245,240,.45)', fontFamily:'var(--font-m)' }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login form */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div style={{ width:'100%', maxWidth:360 }}>

            <div style={{ marginBottom:'2.5rem' }}>
              <div style={{ fontFamily:'var(--font-d)', fontSize:24, fontWeight:800, color:'var(--paper)', letterSpacing:'-0.02em', marginBottom:6 }}>Logga in</div>
              <div style={{ fontSize:12, color:'rgba(247,245,240,.35)', fontFamily:'var(--font-m)' }}>Ange dina uppgifter för att fortsätta</div>
            </div>

            <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(247,245,240,.35)', fontFamily:'var(--font-m)' }}>E-post</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  placeholder="namn@foretag.se"
                  style={{
                    padding:'10px 13px',
                    border:'1px solid rgba(247,245,240,.12)',
                    borderRadius:'var(--radius)',
                    fontSize:13,
                    fontFamily:'var(--font-m)',
                    background:'rgba(247,245,240,.05)',
                    color:'var(--paper)',
                    outline:'none',
                    width:'100%',
                    transition:'border-color .15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(247,245,240,.12)'}
                />
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(247,245,240,.35)', fontFamily:'var(--font-m)' }}>Lösenord</label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  style={{
                    padding:'10px 13px',
                    border:'1px solid rgba(247,245,240,.12)',
                    borderRadius:'var(--radius)',
                    fontSize:13,
                    fontFamily:'var(--font-m)',
                    background:'rgba(247,245,240,.05)',
                    color:'var(--paper)',
                    outline:'none',
                    width:'100%',
                    transition:'border-color .15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(247,245,240,.12)'}
                />
              </div>

              {error && (
                <div style={{ background:'rgba(232,80,10,.12)', border:'1px solid rgba(232,80,10,.3)', borderRadius:'var(--radius)', padding:'9px 12px', fontSize:12, color:'#ff8a60', fontFamily:'var(--font-m)', lineHeight:1.5 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                style={{
                  marginTop:4,
                  padding:'11px 16px',
                  background: pending ? 'rgba(232,80,10,.5)' : 'var(--accent)',
                  color:'#fff',
                  border:'none',
                  borderRadius:'var(--radius)',
                  fontSize:13,
                  fontFamily:'var(--font-m)',
                  cursor: pending ? 'not-allowed' : 'pointer',
                  letterSpacing:'.02em',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:8,
                  transition:'background .15s',
                  width:'100%',
                }}
              >
                {pending ? (
                  <>
                    <span style={{ width:12, height:12, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }}></span>
                    Loggar in…
                  </>
                ) : 'Logga in →'}
              </button>

            </form>

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
