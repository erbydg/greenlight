'use client'
import Link from 'next/link'

interface Crumb { label: string; href?: string }

export default function Nav({ breadcrumbs, actions }: { breadcrumbs?: Crumb[]; actions?: React.ReactNode }) {
  return (
    <nav className="gl-nav">
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', color:'var(--text)' }}>
        <div style={{ width:28, height:28, background:'var(--ink)', borderRadius:6, display:'grid', placeItems:'center', position:'relative', overflow:'hidden', flexShrink:0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position:'relative', zIndex:1 }}>
            <path d="M6 1L9 6H3L6 1Z" fill="white" opacity="0.9"/>
            <rect x="3.5" y="7.5" width="5" height="3" rx="0.8" fill="white" opacity="0.4"/>
          </svg>
          <span className="logo-blink" style={{ position:'absolute', width:7, height:7, background:'var(--green)', borderRadius:'50%', bottom:5, right:5, boxShadow:'0 0 5px var(--green)' }}/>
        </div>
        <span className="font-heading" style={{ fontSize:'1rem', fontWeight:600, letterSpacing:'-0.01em' }}>Greenlight</span>
      </Link>

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

      <div style={{ display:'flex', alignItems:'center', gap:10 }}>{actions}</div>
    </nav>
  )
}
