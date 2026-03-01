'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { formatEuro } from '@/lib/profitability'
import type { Deal, RiskLevel } from '@/types/deal'

function ScoreRing({ score }: { score: number | null }) {
  const s = score ?? 0
  const r = 36, circ = 2 * Math.PI * r
  const offset = circ - (s / 100) * circ
  const color = s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="gl-score-ring" style={{ width:88, height:88, flexShrink:0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="7"/>
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <div className="gl-score-inner">
        <span className="font-heading" style={{ fontSize:'1.6rem', fontWeight:600, lineHeight:1 }}>{s}</span>
        <span style={{ fontSize:'0.6rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>/ 100</span>
      </div>
    </div>
  )
}

function DocContent({ content }: { content: string }) {
  const html = content
    .replace(/^### (.+)$/gm, '<h2>$1</h2>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .split('\n\n').map(p => p.startsWith('<') ? p : `<p>${p}</p>`).join('')
  return <div className="gl-doc" dangerouslySetInnerHTML={{ __html: html }}/>
}

async function downloadPDF(title: string, content: string, filename: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const clean = content.replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1').replace(/^#{1,6}\s+/gm,'').trim()
  const margin = 20, maxWidth = doc.internal.pageSize.getWidth() - margin * 2
  doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.text(title, margin, 20)
  doc.setFontSize(10); doc.setFont('helvetica','normal')
  const lines = doc.splitTextToSize(clean, maxWidth)
  let y = 35
  lines.forEach((line: string) => { if(y>270){doc.addPage();y=20}; doc.text(line,margin,y); y+=5 })
  doc.save(filename)
}

const TABS = [
  { key:'risk',     label:'Risk Analysis',  num:1, field:'ai_risk_summary'   as const, note:'Internal use only · Do not share with client' },
  { key:'scope',    label:'Scope Lock',     num:2, field:'ai_scope_lock_doc' as const, note:'Client-facing · Send before kickoff · Get written acknowledgement' },
  { key:'handover', label:'Handover Brief', num:3, field:'ai_handover_brief' as const, note:'Internal · Share with Project Manager and delivery lead' },
  { key:'kickoff',  label:'30-Day Kickoff', num:4, field:'ai_kickoff_plan'   as const, note:'Internal + shareable with client after kickoff call' },
]

export default function DealDetailPage() {
  const params = useParams()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('risk')
  const [error, setError] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/deals/${params.id}`)
      .then(r => r.json())
      .then(d => { setDeal(d); setLoading(false) })
      .catch(() => { setError('Deal not found'); setLoading(false) })
  }, [params.id])

  const updateStatus = async (status: string) => {
    setStatusLoading(true)
    const res = await fetch(`/api/deals/${params.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status })
    })
    if (res.ok) setDeal(await res.json())
    setStatusLoading(false)
  }

  const generate = async () => {
    setGenerating(true); setError(null)
    try {
      const res = await fetch('/api/ai/generate', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dealId: params.id })
      })
      if (!res.ok) throw new Error()
      const { deal: updated } = await res.json()
      setDeal(updated)
      setActiveTab('risk')
    } catch {
      setError('AI generation failed. Check your Gemini API key.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <>
      <Nav breadcrumbs={[{label:'Dashboard',href:'/'},{label:'Loading…'}]}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)', fontSize:'0.85rem' }}>Loading deal…</div>
    </>
  )

  if (!deal) return (
    <>
      <Nav breadcrumbs={[{label:'Dashboard',href:'/'},{label:'Not found'}]}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--red)', fontSize:'0.85rem' }}>{error || 'Deal not found'}</div>
    </>
  )

  const risk = (deal.scope_risk_level ?? 'LOW').toLowerCase()
  const marginPct = deal.margin_percent ?? 0
  const marginColor = marginPct >= 30 ? 'var(--green)' : marginPct >= 20 ? 'var(--amber)' : 'var(--red)'
  const hasDocuments = !!(deal.ai_risk_summary || deal.ai_scope_lock_doc)
  const activeTabDef = TABS.find(t => t.key === activeTab)!
  const activeContent = deal[activeTabDef.field]
  const totalProfit = (deal.total_projected_profit ?? 0) + (deal.setup_fee ?? 0)

  return (
    <>
      <Nav
        breadcrumbs={[{ label:'Dashboard', href:'/' }, { label: deal.client_name }]}
        actions={
          <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
            <span className={`gl-badge gl-badge-${risk}`}><span className="gl-badge-dot"/>{deal.scope_risk_level} RISK</span>
            <span className={`gl-status gl-status-${deal.status.toLowerCase()}`}>{deal.status}</span>
            {deal.status === 'DRAFT' && (
              <>
                <button onClick={()=>updateStatus('APPROVED')} disabled={statusLoading} className="gl-btn gl-btn-green">Approve</button>
                <button onClick={()=>updateStatus('REJECTED')} disabled={statusLoading} className="gl-btn gl-btn-danger">Reject</button>
              </>
            )}
          </div>
        }
      />

      <main style={{ maxWidth:1020, margin:'0 auto', padding:'40px' }}>
        <div style={{ marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--border)' }}>
          <h1 className="font-heading" style={{ fontSize:'1.6rem', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1 }}>{deal.client_name}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6, fontSize:'0.78rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
            <span>{deal.industry}</span><span style={{ color:'var(--text-light)' }}>·</span>
            <span>{deal.contract_duration}-month contract</span><span style={{ color:'var(--text-light)' }}>·</span>
            <span>{formatEuro(deal.monthly_retainer)}/mo</span>
            {(deal.setup_fee ?? 0) > 0 && <><span style={{ color:'var(--text-light)' }}>·</span><span>+{formatEuro(deal.setup_fee)} setup</span></>}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, marginBottom:16 }}>
          <div>
            <div className="gl-card" style={{ marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:20, alignItems:'center', padding:'22px 24px' }}>
                <ScoreRing score={deal.margin_score}/>
                <div>
                  {[
                    ['Margin', `${marginPct.toFixed(1)}%`, marginColor],
                    ['Scope Risk', deal.scope_risk_level ?? '—', risk==='high'?'var(--red)':risk==='medium'?'var(--amber)':'var(--green)'],
                    ['Retainer', `${formatEuro(deal.monthly_retainer)}/mo`, ''],
                    ['Duration', `${deal.contract_duration} months`, ''],
                  ].map(([k,v,c]) => (
                    <div key={String(k)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid var(--border)', fontSize:'0.8rem' }}>
                      <span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{String(k)}</span>
                      <span style={{ fontWeight:600, color:String(c)||'var(--text)' }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
              {[
                { label:'Internal Cost', value:formatEuro(deal.total_monthly_cost??0), sub:'per month', green:false },
                { label:'Gross Margin',  value:formatEuro(deal.gross_margin??0),       sub:'per month', green:true  },
                { label:'Total Profit',  value:formatEuro(totalProfit),                sub:`${deal.contract_duration}m + setup fee`, green:false },
              ].map(f => (
                <div key={f.label} style={{ background:'var(--surface)', padding:'16px 18px' }}>
                  <div style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>{f.label}</div>
                  <div className="font-heading" style={{ fontSize:'1.25rem', fontWeight:600, letterSpacing:'-0.02em', color:f.green?'var(--green)':'var(--text)' }}>{f.value}</div>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-light)', marginTop:2 }}>{f.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="gl-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Risk Flags</span>
                <span className={`gl-badge gl-badge-${risk}`}><span className="gl-badge-dot"/>{deal.scope_risk_level}</span>
              </div>
              {marginPct < 30
                ? <div style={{ display:'flex', gap:12, padding:'12px 16px' }}>
                    <div style={{ width:20, height:20, borderRadius:4, background:'var(--amber-bg)', color:'var(--amber)', border:'1px solid var(--amber-border)', display:'grid', placeItems:'center', fontSize:'0.65rem', fontWeight:700, flexShrink:0, marginTop:1 }}>!</div>
                    <div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-light)', fontWeight:500, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.03em' }}>MARGIN-001</div>
                      <div style={{ fontSize:'0.8rem', lineHeight:1.45 }}>Margin {marginPct.toFixed(1)}% — below 30%. Any scope creep will hurt.</div>
                    </div>
                  </div>
                : <div style={{ padding:'20px 16px', textAlign:'center', fontSize:'0.8rem', color:'var(--green)' }}>✓ No critical margin flags</div>
              }
            </div>

            <div className="gl-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Team Allocation</span>
              </div>
              <div style={{ padding:16 }}>
                {deal.team_roles.map((r, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                    <div>
                      <div style={{ fontWeight:500 }}>{r.role}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:1 }}>{r.monthlyHours}h/mo @ €{r.hourlyCost}/h</div>
                    </div>
                    <div className="font-heading" style={{ fontSize:'0.95rem', fontWeight:600 }}>{formatEuro(r.hourlyCost*r.monthlyHours)}</div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, marginTop:4, borderTop:'1px solid var(--border)', fontSize:'0.82rem', fontWeight:600 }}>
                  <span>Total / month</span><span>{formatEuro(deal.total_monthly_cost??0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gl-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>AI Documents</span>
              {hasDocuments && !generating && (
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'var(--green)', fontWeight:500 }}>
                  <span className="logo-blink" style={{ width:6, height:6, background:'var(--green)', borderRadius:'50%', display:'inline-block', boxShadow:'0 0 5px var(--green)' }}/>
                  4 documents ready
                </div>
              )}
            </div>
            {hasDocuments && !generating
              ? <button onClick={generate} className="gl-btn gl-btn-ghost" style={{ fontSize:'0.72rem', padding:'5px 12px' }}>↺ Regenerate</button>
              : !generating && <button onClick={generate} className="gl-btn gl-btn-primary">✦ Generate documents</button>
            }
          </div>

          {generating && (
            <div style={{ padding:'56px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <div className="gl-loader">{[0,1,2,3,4].map(i=><div key={i} className="gl-lb" style={{ animationDelay:`${i*0.1}s`, background:'var(--green)' }}/>)}</div>
              <div style={{ fontWeight:500, fontSize:'0.88rem' }}>Generating documents…</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>AI is analysing your deal and writing 4 documents</div>
            </div>
          )}

          {!hasDocuments && !generating && (
            <div style={{ padding:'56px 28px', textAlign:'center' }}>
              <div style={{ width:44, height:44, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, display:'grid', placeItems:'center', margin:'0 auto 16px', color:'var(--text-light)', fontSize:'1.3rem' }}>✦</div>
              <div className="font-heading" style={{ fontSize:'1rem', fontWeight:600, marginBottom:8 }}>Documents not yet generated</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', maxWidth:340, margin:'0 auto 20px' }}>
                Click "Generate documents" to create your Risk Analysis, Scope Lock, Handover Brief and 30-Day Kickoff Plan.
              </div>
            </div>
          )}

          {hasDocuments && !generating && (
            <>
              <div className="gl-tab-bar">
                {TABS.map(tab => (
                  <button key={tab.key} className={`gl-tab-btn ${activeTab===tab.key?'active':''}`} onClick={()=>setActiveTab(tab.key)}>
                    <span className="gl-tab-num">{tab.num}</span>{tab.label}
                  </button>
                ))}
              </div>
              <div key={activeTab} className="animate-fade-up" style={{ padding:'28px 28px 12px' }}>
                {activeContent
                  ? <DocContent content={activeContent}/>
                  : <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontSize:'0.82rem' }}>This document was not generated. Try regenerating.</div>
                }
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 28px', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
                <span style={{ fontSize:'0.72rem', color:'var(--text-light)' }}>{activeTabDef.note}</span>
                {activeContent && (
                  <button onClick={()=>downloadPDF(activeTabDef.label, activeContent, `${deal.client_name}-${activeTab}.pdf`)} className="gl-btn gl-btn-primary" style={{ fontSize:'0.78rem', padding:'8px 18px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download PDF
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {error && (
          <div style={{ background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8, padding:'12px 16px', marginTop:14, fontSize:'0.82rem', color:'var(--red)' }}>{error}</div>
        )}
      </main>
    </>
  )
}
