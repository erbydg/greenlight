'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase-client'

interface Crumb { label: string; href?: string }

export default function Nav({ breadcrumbs, actions }: { breadcrumbs?: Crumb[]; actions?: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="gl-nav">
      <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', color:'var(--text)' }}>
        <div style={{ width:28, height:28, background:'var(--ink)', borderRadius:6, display:'grid', placeItems:'center', position:'relative', overflow:'hidden', flexShrink:0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position:'relative', zIndex:1 }}>
            <path d="M6 1L9 6H3L6 1Z" fill="white" opacity="0.9"/>
            <rect x="3.5" y="7.5" width="5" height="3" rx="0.8" fill="white" opacity="0.4"/>
          </svg>
          <span className="logo-blink" style={{ position:'absolute', width:7, height:7, background:'var(--green)', borderRadius:'50%', bottom:5, right:5, boxShadow:'0 0 5px var(--green)' }}/>
        </div>
        <span className="font-heading" style={{ fontSize:'1rem', fontWeight:600, letterSpacing:'-0.01em' }}>Greenlight</span>
      </Link>

      <div style={{ display:'flex', alignItems:'center', gap:2 }}>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} style={{
            padding:'5px 12px', borderRadius:6, fontSize:'0.78rem', fontWeight:500,
            textDecoration:'none', transition:'all 0.12s',
            color: pathname === link.href ? 'var(--text)' : 'var(--text-muted)',
            background: pathname === link.href ? 'var(--bg)' : 'transparent',
          }}>
            {link.label}
          </Link>
        ))}
      </div>

      {breadcrumbs && (
        <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.78rem', color:'var(--text-muted)' }}>
          {breadcrumbs.map((c, i) => (
            <span key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
              {i > 0 && <span style={{ color:'var(--text-light)' }}>/</span>}
              {c.href
                ? <Link href={c.href} style={{ color:'var(--text-muted)', textDecoration:'none' }}>{c.label}</Link>
                : <span style={{ color:'var(--text)', fontWeight:500 }}>{c.label}</span>}
            </span>
          ))}
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {actions}
        <button onClick={handleLogout} className="gl-btn gl-btn-ghost" style={{ fontSize:'0.75rem', padding:'5px 12px' }}>
          Sign out
        </button>
      </div>
    </nav>
  )
}
