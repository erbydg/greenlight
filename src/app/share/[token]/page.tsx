'use client'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DocContent from '@/components/DocContent'
import { Skel } from '@/components/Skeleton'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { downloadPDF, stripMarkdown } from '@/lib/documents'

interface SharedDoc { docType: string; label: string; clientName: string; agencyName: string | null; content: string }

export default function SharePage() {
  const params = useParams()
  const { d } = useLocale()
  const [doc, setDoc] = useState<SharedDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/share/${params.token}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { setDoc(data); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [params.token])

  const copyToClipboard = async () => {
    if (!doc) return
    await navigator.clipboard.writeText(stripMarkdown(doc.content))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <nav className="gl-nav">
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', color:'var(--text)' }}>
          <div style={{ width:28, height:28, background:'var(--ink)', borderRadius:6, display:'grid', placeItems:'center', position:'relative', overflow:'hidden', flexShrink:0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position:'relative', zIndex:1 }}>
              <path d="M6 1L9 6H3L6 1Z" fill="white" opacity="0.9"/>
              <rect x="3.5" y="7.5" width="5" height="3" rx="0.8" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <span className="font-heading" style={{ fontSize:'1rem', fontWeight:600, letterSpacing:'-0.01em' }}>Greenlight</span>
        </Link>
        {doc && <span className="gl-badge gl-badge-low"><span className="gl-badge-dot"/>{d.share.viewOnly}</span>}
      </nav>

      <main style={{ maxWidth:820, margin:'0 auto', padding:'40px 40px 80px', width:'100%', flex:1 }}>
        {loading && (
          <div className="gl-card">
            <div style={{ padding:'20px 28px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
              <Skel width={180} height={20} style={{ marginBottom:8 }}/>
              <Skel width={260} height={11}/>
            </div>
            <div style={{ padding:'28px' }}>
              {[100,92,96,60,88,80,70].map((w,i) => <Skel key={i} width={`${w}%`} height={12} style={{ marginBottom:14 }}/>)}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'14px 28px', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
              <Skel width={90} height={32} radius={6}/>
              <Skel width={120} height={32} radius={6}/>
            </div>
          </div>
        )}

        {notFound && !loading && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'40vh', color:'var(--red)', fontSize:'0.85rem', textAlign:'center' }}>{d.share.notFound}</div>
        )}

        {doc && !loading && (
          <div className="gl-card">
            <div style={{ padding:'20px 28px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
              <h1 className="font-heading" style={{ fontSize:'1.3rem', fontWeight:600, letterSpacing:'-0.02em', marginBottom:4 }}>{doc.label}</h1>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                {doc.clientName}{doc.agencyName ? ` · ${d.share.sharedVia(doc.agencyName)}` : ''}
              </div>
            </div>
            <div style={{ padding:'28px 28px 12px' }}>
              <DocContent content={doc.content}/>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'14px 28px', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
              <button onClick={copyToClipboard} className="gl-btn gl-btn-ghost" style={{ fontSize:'0.78rem', padding:'8px 18px' }}>
                {copied
                  ? d.dealDetail.copied
                  : <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      {d.dealDetail.copy}
                    </>
                }
              </button>
              <button onClick={()=>downloadPDF(doc.label, doc.content, `${doc.clientName}-${doc.docType}.pdf`)} className="gl-btn gl-btn-primary" style={{ fontSize:'0.78rem', padding:'8px 18px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {d.dealDetail.downloadPdf}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer style={{ textAlign:'center', padding:'20px', fontSize:'0.72rem', color:'var(--text-light)' }}>{d.share.poweredBy}</footer>
    </div>
  )
}
