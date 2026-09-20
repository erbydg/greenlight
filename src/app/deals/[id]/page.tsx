'use client'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import DocContent from '@/components/DocContent'
import { Skel } from '@/components/Skeleton'
import { formatEuro } from '@/lib/profitability'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { DOC_FIELDS, SHAREABLE_TABS, withSignature, stripMarkdown, downloadPDF, type AgencyInfo, type ShareableDoc } from '@/lib/documents'
import type { Deal } from '@/types/deal'

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

function DealDetailSkeleton() {
  return (
    <main style={{ maxWidth:1020, margin:'0 auto', padding:'40px' }}>
      <div style={{ marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--border)' }}>
        <Skel width={220} height={26} style={{ marginBottom:10 }}/>
        <div style={{ display:'flex', gap:10 }}>
          <Skel width={90} height={13}/><Skel width={70} height={13}/><Skel width={100} height={13}/>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, marginBottom:16 }}>
        <div>
          <div className="gl-card" style={{ marginBottom:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:20, alignItems:'center', padding:'22px 24px' }}>
              <Skel width={88} height={88} radius={44}/>
              <div>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <Skel width={70} height={11}/><Skel width={60} height={11}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ background:'var(--surface)', padding:'16px 18px' }}>
                <Skel width={80} height={10} style={{ marginBottom:10 }}/>
                <Skel width={70} height={20} style={{ marginBottom:6 }}/>
                <Skel width={50} height={9}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="gl-card">
            <div style={{ padding:'12px 16px', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}><Skel width={80} height={10}/></div>
            <div style={{ padding:'16px' }}><Skel width="100%" height={40} radius={8}/></div>
          </div>
          <div className="gl-card">
            <div style={{ padding:'12px 16px', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}><Skel width={100} height={10}/></div>
            <div style={{ padding:16 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                  <Skel width={90} height={12}/><Skel width={50} height={12}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="gl-card" style={{ marginBottom:16 }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}><Skel width={140} height={10}/></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:0 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
              <Skel width={90} height={9} style={{ marginBottom:10 }}/>
              <Skel width="80%" height={11} style={{ marginBottom:6 }}/>
              <Skel width="60%" height={11}/>
            </div>
          ))}
        </div>
      </div>

      <div className="gl-card">
        <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
          <Skel width={100} height={10}/><Skel width={90} height={24} radius={6}/>
        </div>
        <div style={{ padding:'28px' }}>
          {[100,95,88,70].map((w,i) => <Skel key={i} width={`${w}%`} height={12} style={{ marginBottom:12 }}/>)}
        </div>
      </div>
    </main>
  )
}

export default function DealDetailPage() {
  const params = useParams()
  const { locale, d } = useLocale()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [agency, setAgency] = useState<AgencyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('risk')
  const [error, setError] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const TABS = d.dealDetail.tabs.map((t, i) => ({ ...t, num: i + 1, field: DOC_FIELDS[i] }))

  useEffect(() => {
    fetch(`/api/deals/${params.id}`)
      .then(r => r.json())
      .then(dl => { setDeal(dl); setLoading(false) })
      .catch(() => { setError(d.dealDetail.notFound); setLoading(false) })
    fetch('/api/agency')
      .then(r => r.json())
      .then(data => setAgency(data.name ? data : null))
      .catch(() => {})
  }, [params.id, d.dealDetail.notFound])

  const updateStatus = async (status: string) => {
    setStatusLoading(true)
    const res = await fetch(`/api/deals/${params.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status })
    })
    if (res.ok) setDeal(await res.json())
    setStatusLoading(false)
  }

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(stripMarkdown(content))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const SHARE_TOKEN_FIELD: Record<ShareableDoc, 'scope_share_token' | 'handover_share_token'> = {
    scope: 'scope_share_token', handover: 'handover_share_token',
  }

  const shareLink = async (tab: ShareableDoc) => {
    setShareLoading(true); setError(null)
    try {
      let token = deal?.[SHARE_TOKEN_FIELD[tab]] ?? null
      if (!token) {
        const res = await fetch(`/api/deals/${params.id}/share`, {
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ doc: tab }),
        })
        if (!res.ok) throw new Error()
        token = (await res.json()).token
        setDeal(prev => prev ? { ...prev, [SHARE_TOKEN_FIELD[tab]]: token } : prev)
      }
      await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      setError(d.dealDetail.shareFailed)
    } finally {
      setShareLoading(false)
    }
  }

  const revokeShareLink = async (tab: ShareableDoc) => {
    setShareLoading(true); setError(null)
    try {
      const res = await fetch(`/api/deals/${params.id}/share`, {
        method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ doc: tab }),
      })
      if (!res.ok) throw new Error()
      setDeal(prev => prev ? { ...prev, [SHARE_TOKEN_FIELD[tab]]: null } : prev)
    } catch {
      setError(d.dealDetail.shareFailed)
    } finally {
      setShareLoading(false)
    }
  }

  const generate = async () => {
    setGenerating(true); setError(null)
    try {
      const res = await fetch('/api/ai/generate', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dealId: params.id, locale })
      })
      if (!res.ok) throw new Error()
      const { deal: updated } = await res.json()
      setDeal(updated)
      setActiveTab('risk')
    } catch {
      setError(d.dealDetail.generateFailed)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <>
      <Nav breadcrumbs={[{label:d.dealForm.breadcrumbDashboard,href:'/'},{label:d.dealForm.editLoadingCrumb}]}/>
      <DealDetailSkeleton/>
    </>
  )

  if (!deal) return (
    <>
      <Nav breadcrumbs={[{label:d.dealForm.breadcrumbDashboard,href:'/'},{label:d.dealForm.editNotFoundCrumb}]}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--red)', fontSize:'0.85rem' }}>{error || d.dealDetail.notFound}</div>
    </>
  )

  const risk = (deal.scope_risk_level ?? 'LOW').toLowerCase()
  const marginPct = deal.margin_percent ?? 0
  const marginColor = marginPct >= 30 ? 'var(--green)' : marginPct >= 20 ? 'var(--amber)' : 'var(--red)'
  const hasDocuments = !!(deal.ai_risk_summary || deal.ai_scope_lock_doc)
  const activeTabDef = TABS.find(t => t.key === activeTab)!
  const rawContent = deal[activeTabDef.field]
  const activeContent = rawContent ? withSignature(rawContent, activeTab, agency) : rawContent
  const totalProfit = (deal.total_projected_profit ?? 0) + (deal.setup_fee ?? 0)
  const shareableTab = SHAREABLE_TABS.includes(activeTab as ShareableDoc) ? (activeTab as ShareableDoc) : null
  const activeShareToken = shareableTab === 'scope' ? deal.scope_share_token : shareableTab === 'handover' ? deal.handover_share_token : null
  const activeShareUrl = activeShareToken && typeof window !== 'undefined' ? `${window.location.origin}/share/${activeShareToken}` : null

  return (
    <>
      <Nav
        breadcrumbs={[{ label:d.dealForm.breadcrumbDashboard, href:'/' }, { label: deal.client_name }]}
        actions={
          <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
            <span className={`gl-badge gl-badge-${risk}`}><span className="gl-badge-dot"/>{d.risk[deal.scope_risk_level ?? 'LOW']} {d.dealDetail.riskSuffix}</span>
            <span className={`gl-status gl-status-${deal.status.toLowerCase()}`}>{d.status[deal.status]}</span>
            <Link href={`/deals/${deal.id}/edit`} className="gl-btn gl-btn-ghost">{d.dealDetail.edit}</Link>
            {deal.status === 'DRAFT' && (
              <>
                <button onClick={()=>updateStatus('APPROVED')} disabled={statusLoading} className="gl-btn gl-btn-green">{d.dealDetail.approve}</button>
                <button onClick={()=>updateStatus('REJECTED')} disabled={statusLoading} className="gl-btn gl-btn-danger">{d.dealDetail.reject}</button>
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
            <span>{d.dealDetail.durationUnit(deal.contract_duration)}</span><span style={{ color:'var(--text-light)' }}>·</span>
            <span>{formatEuro(deal.monthly_retainer)}/mo</span>
            {(deal.setup_fee ?? 0) > 0 && <><span style={{ color:'var(--text-light)' }}>·</span><span>+{formatEuro(deal.setup_fee)}</span></>}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, marginBottom:16 }}>
          <div>
            <div className="gl-card" style={{ marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:20, alignItems:'center', padding:'22px 24px' }}>
                <ScoreRing score={deal.margin_score}/>
                <div>
                  {[
                    [d.dealDetail.margin, `${marginPct.toFixed(1)}%`, marginColor],
                    [d.dealDetail.scopeRisk, deal.scope_risk_level ? d.risk[deal.scope_risk_level] : d.common.dash, risk==='high'?'var(--red)':risk==='medium'?'var(--amber)':'var(--green)'],
                    [d.dealDetail.retainer, `${formatEuro(deal.monthly_retainer)}/mo`, ''],
                    [d.dealDetail.duration, d.dealDetail.durationUnit(deal.contract_duration), ''],
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
                { label:d.dealDetail.internalCost, value:formatEuro(deal.total_monthly_cost??0), sub:d.dealDetail.perMonth, green:false },
                { label:d.dealDetail.grossMargin,  value:formatEuro(deal.gross_margin??0),       sub:d.dealDetail.perMonth, green:true  },
                { label:d.dealDetail.totalProfit,  value:formatEuro(totalProfit),                sub:d.dealDetail.contractSub(deal.contract_duration), green:false },
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
                <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{d.dealDetail.riskFlags}</span>
                <span className={`gl-badge gl-badge-${risk}`}><span className="gl-badge-dot"/>{d.risk[deal.scope_risk_level ?? 'LOW']}</span>
              </div>
              {marginPct < 30
                ? <div style={{ display:'flex', gap:12, padding:'12px 16px' }}>
                    <div style={{ width:20, height:20, borderRadius:4, background:'var(--amber-bg)', color:'var(--amber)', border:'1px solid var(--amber-border)', display:'grid', placeItems:'center', fontSize:'0.65rem', fontWeight:700, flexShrink:0, marginTop:1 }}>!</div>
                    <div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-light)', fontWeight:500, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.03em' }}>{d.dealDetail.marginFlagCode}</div>
                      <div style={{ fontSize:'0.8rem', lineHeight:1.45 }}>{d.dealDetail.marginFlagBody(marginPct.toFixed(1))}</div>
                    </div>
                  </div>
                : <div style={{ padding:'20px 16px', textAlign:'center', fontSize:'0.8rem', color:'var(--green)' }}>{d.dealDetail.noMarginFlags}</div>
              }
              {(deal.kpi_promises.length > 0 || deal.timeline_promises.length > 0 || deal.verbal_promises.length > 0) && (
                <div style={{ display:'flex', gap:12, padding:'12px 16px', borderTop:'1px solid var(--border)', background:'var(--amber-bg)' }}>
                  <div style={{ width:20, height:20, borderRadius:4, background:'var(--amber-bg)', color:'var(--amber)', border:'1px solid var(--amber-border)', display:'grid', placeItems:'center', fontSize:'0.65rem', fontWeight:700, flexShrink:0, marginTop:1 }}>i</div>
                  <div style={{ fontSize:'0.78rem', lineHeight:1.45, color:'var(--amber)' }}>
                    {d.dealDetail.promiseWarning}
                  </div>
                </div>
              )}
            </div>

            <div className="gl-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{d.dealDetail.teamAllocation}</span>
              </div>
              <div style={{ padding:16 }}>
                {deal.team_roles.map((r, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                    <div>
                      <div style={{ fontWeight:500 }}>{r.role}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:1 }}>{d.dealDetail.hoursAtRate(r.monthlyHours, r.hourlyCost)}</div>
                    </div>
                    <div className="font-heading" style={{ fontSize:'0.95rem', fontWeight:600 }}>{formatEuro(r.hourlyCost*r.monthlyHours)}</div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, marginTop:4, borderTop:'1px solid var(--border)', fontSize:'0.82rem', fontWeight:600 }}>
                  <span>{d.dealDetail.totalPerMonth}</span><span>{formatEuro(deal.total_monthly_cost??0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gl-card" style={{ marginBottom:16 }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
            <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{d.dealDetail.deliverablesPromises}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:0 }}>
            {[
              { label:d.dealDetail.secDeliverables, items:[
                ...deal.deliverables.paidAds, ...deal.deliverables.seo, ...deal.deliverables.creative,
                ...deal.deliverables.reporting, ...deal.deliverables.strategy, ...deal.deliverables.custom,
              ] },
              { label:d.dealDetail.secKpi, items:deal.kpi_promises },
              { label:d.dealDetail.secTimeline, items:deal.timeline_promises },
              { label:d.dealDetail.secVerbal, items:deal.verbal_promises },
              { label:d.dealDetail.secExclusions, items:deal.exclusions },
            ].map(section => (
              <div key={section.label} style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:'0.65rem', fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{section.label}</div>
                {section.items.length === 0
                  ? <div style={{ fontSize:'0.8rem', color:'var(--text-light)' }}>{d.common.dash}</div>
                  : <ul style={{ margin:0, paddingLeft:16, fontSize:'0.82rem', lineHeight:1.6 }}>
                      {section.items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                }
              </div>
            ))}
          </div>
        </div>

        <div className="gl-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{d.dealDetail.aiDocuments}</span>
              {hasDocuments && !generating && (
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'var(--green)', fontWeight:500 }}>
                  <span className="logo-blink" style={{ width:6, height:6, background:'var(--green)', borderRadius:'50%', display:'inline-block', boxShadow:'0 0 5px var(--green)' }}/>
                  {d.dealDetail.docsReady}
                </div>
              )}
            </div>
            {hasDocuments && !generating
              ? <button onClick={generate} className="gl-btn gl-btn-ghost" style={{ fontSize:'0.72rem', padding:'5px 12px' }}>{d.dealDetail.regenerate}</button>
              : !generating && <button onClick={generate} className="gl-btn gl-btn-primary">{d.dealDetail.generate}</button>
            }
          </div>

          {generating && (
            <div style={{ padding:'56px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <div className="gl-loader">{[0,1,2,3,4].map(i=><div key={i} className="gl-lb" style={{ animationDelay:`${i*0.1}s`, background:'var(--green)' }}/>)}</div>
              <div style={{ fontWeight:500, fontSize:'0.88rem' }}>{d.dealDetail.generating}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{d.dealDetail.generatingSub}</div>
            </div>
          )}

          {!hasDocuments && !generating && (
            <div style={{ padding:'56px 28px', textAlign:'center' }}>
              <div style={{ width:44, height:44, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, display:'grid', placeItems:'center', margin:'0 auto 16px', color:'var(--text-light)', fontSize:'1.3rem' }}>✦</div>
              <div className="font-heading" style={{ fontSize:'1rem', fontWeight:600, marginBottom:8 }}>{d.dealDetail.notGeneratedTitle}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', maxWidth:340, margin:'0 auto 20px' }}>
                {d.dealDetail.notGeneratedBody}
              </div>
            </div>
          )}

          {hasDocuments && !generating && (
            <>
              <div className="gl-tab-bar">
                {TABS.map(tab => (
                  <button key={tab.key} className={`gl-tab-btn ${activeTab===tab.key?'active':''}`} onClick={()=>{setActiveTab(tab.key); setCopied(false)}}>
                    <span className="gl-tab-num">{tab.num}</span>{tab.label}
                  </button>
                ))}
              </div>
              <div key={activeTab} className="animate-fade-up" style={{ padding:'28px 28px 12px' }}>
                {activeContent
                  ? <DocContent content={activeContent}/>
                  : <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontSize:'0.82rem' }}>{d.dealDetail.docMissing}</div>
                }
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 28px', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
                <span style={{ fontSize:'0.72rem', color:'var(--text-light)' }}>{activeTabDef.note}</span>
                {activeContent && (
                  <div style={{ display:'flex', gap:8 }}>
                    {shareableTab && (
                      <button onClick={()=>shareLink(shareableTab)} disabled={shareLoading} className="gl-btn gl-btn-ghost" style={{ fontSize:'0.78rem', padding:'8px 18px' }}>
                        {shareCopied
                          ? d.dealDetail.copied
                          : <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
                              {activeShareToken ? d.dealDetail.copyShareLink : d.dealDetail.shareLink}
                            </>
                        }
                      </button>
                    )}
                    <button onClick={()=>copyToClipboard(activeContent)} className="gl-btn gl-btn-ghost" style={{ fontSize:'0.78rem', padding:'8px 18px' }}>
                      {copied
                        ? d.dealDetail.copied
                        : <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            {d.dealDetail.copy}
                          </>
                      }
                    </button>
                    <button onClick={()=>downloadPDF(activeTabDef.label, activeContent, `${deal.client_name}-${activeTab}.pdf`)} className="gl-btn gl-btn-primary" style={{ fontSize:'0.78rem', padding:'8px 18px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {d.dealDetail.downloadPdf}
                    </button>
                  </div>
                )}
              </div>
              {shareableTab && activeShareUrl && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'10px 28px', borderTop:'1px solid var(--border)', background:'var(--surface)', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.76rem', color:'var(--text-muted)', minWidth:0 }}>
                    <span className="logo-blink" style={{ width:6, height:6, background:'var(--green)', borderRadius:'50%', display:'inline-block', boxShadow:'0 0 5px var(--green)', flexShrink:0 }}/>
                    <span style={{ whiteSpace:'nowrap' }}>{d.dealDetail.shareLinkActive}</span>
                    <code style={{ fontSize:'0.72rem', background:'var(--bg)', padding:'2px 8px', borderRadius:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeShareUrl}</code>
                  </div>
                  <button onClick={()=>revokeShareLink(shareableTab)} disabled={shareLoading} className="gl-btn gl-btn-ghost" style={{ fontSize:'0.72rem', padding:'5px 10px', color:'var(--red)' }}>
                    {d.dealDetail.revokeLink}
                  </button>
                </div>
              )}
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
