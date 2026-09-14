'use client'
export const runtime = 'edge'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import LocaleToggle from '@/components/LocaleToggle'

export default function SignupPage() {
  const router = useRouter()
  const { d } = useLocale()
  const [agencyName, setAgencyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createSupabaseClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email, password,
      options: { data: { agency_name: agencyName } }
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      const res = await fetch('/api/agency/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyName, userId: data.user.id })
      })
      if (!res.ok) { setError(d.auth.signup.agencyFailed); setLoading(false); return }
    }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative' }}>
      <div style={{ position:'absolute', top:20, right:20 }}><LocaleToggle /></div>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:9, textDecoration:'none', color:'var(--text)', marginBottom:24 }}>
            <div style={{ width:32, height:32, background:'var(--ink)', borderRadius:8, display:'grid', placeItems:'center', position:'relative', overflow:'hidden' }}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L9 6H3L6 1Z" fill="white" opacity="0.9"/>
                <rect x="3.5" y="7.5" width="5" height="3" rx="0.8" fill="white" opacity="0.4"/>
              </svg>
              <span className="logo-blink" style={{ position:'absolute', width:8, height:8, background:'var(--green)', borderRadius:'50%', bottom:5, right:5, boxShadow:'0 0 6px var(--green)' }}/>
            </div>
            <span className="font-heading" style={{ fontSize:'1.1rem', fontWeight:600 }}>Greenlight</span>
          </Link>
          <h1 className="font-heading" style={{ fontSize:'1.5rem', fontWeight:600, letterSpacing:'-0.02em', marginBottom:6 }}>{d.auth.signup.title}</h1>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{d.auth.signup.sub}</p>
        </div>
        <div className="gl-card" style={{ padding:28 }}>
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 }}>{d.auth.signup.agencyName}</div>
              <input required className="gl-input" value={agencyName} onChange={e=>setAgencyName(e.target.value)} placeholder={d.auth.signup.agencyNamePlaceholder}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 }}>{d.auth.signup.email}</div>
              <input required type="email" className="gl-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@agency.com"/>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 }}>{d.auth.signup.password}</div>
              <input required type="password" minLength={8} className="gl-input" value={password} onChange={e=>setPassword(e.target.value)} placeholder={d.auth.signup.passwordPlaceholder}/>
            </div>
            {error && (
              <div style={{ background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:6, padding:'10px 12px', fontSize:'0.8rem', color:'var(--red)', marginBottom:14 }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="gl-btn gl-btn-green" style={{ width:'100%', justifyContent:'center', padding:12, fontSize:'0.88rem', opacity:loading?0.7:1 }}>
              {loading ? d.auth.signup.creating : d.auth.signup.create}
            </button>
          </form>
        </div>
        <div style={{ textAlign:'center', marginTop:16, fontSize:'0.8rem', color:'var(--text-muted)' }}>
          {d.auth.signup.haveAccount}{' '}
          <Link href="/login" style={{ color:'var(--green)', fontWeight:500, textDecoration:'none' }}>{d.auth.signup.signIn}</Link>
        </div>
      </div>
    </div>
  )
}
