// src/app/page.tsx
export const runtime = 'edge'

import Link from 'next/link'
import Nav from '@/components/Nav'
import { getAllDeals } from '@/lib/supabase'
import { formatEuro } from '@/lib/profitability'
import type { Deal, RiskLevel } from '@/types/deal'

function ScoreRing({ score }: { score: number | null }) {
  const s = score ?? 0
  const r = 11, circ = 2 * Math.PI * r
  const offset = circ - (s / 100) * circ
  const color = s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="gl-score-ring" style={{ width:28, height:28 }}>
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={r} fill="none" stroke="var(--border)" strokeWidth="3"/>
        <circle cx="14" cy="14" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <div className="gl-score-inner" style={{ fontSize:'0.56rem', fontWeight:700 }}>{s}</div>
    </div>
  )
}

function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return null
  const cls = level.toLowerCase()
  return <span className={`gl-badge gl-badge-${cls}`}><span className="gl-badge-dot"/>{level}</span>
}

function StatusPill({ status }: { status: string }) {
  return <span className={`gl-status gl-status-${status.toLowerCase()}`}>{status}</span>
}

function MarginBar({ percent }: { percent: number | null }) {
  const p = percent ?? 0
  const color = p >= 30 ? 'var(--green)' : p >= 20 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:56, height:3, background:'var(--border)', borderRadius:2, overflow:'hidden', flexShrink:0 }}>
        <div style={{ height:'100%', borderRadius:2, background:color, width:`${Math.max(0,Math.min(100,p))}%` }}/>
      </div>
      <span style={{ fontSize:'0.82rem', fontWeight:600, color }}>{p.toFixed(1)}%</span>
    </div>
  )
}

export default async function DashboardPage() {
  let deals: Deal[] = []
  let dbError = false
  try { deals = await getAllDeals() } catch { dbError = true }

  const approved = deals.filter(d => d.status === 'APPROVED')
  const totalRetainer = approved.reduce((s, d) => s + d.monthly_retainer, 0)
  const avgMargin = deals.length ? deals.reduce((s, d) => s + (d.margin_percent ?? 0), 0) / deals.length : 0
  const atRisk = deals.filter(d => d.scope_risk_level === 'HIGH' || d.scope_risk_level === 'MEDIUM').length

  return (
    <>
      <Nav
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <Link href="/deals/new" className="gl-btn gl-btn-primary">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5.5v10M.5 5.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New Deal
          </Link>
        }
      />
      <main style={{ maxWidth:1020, margin:'0 auto', padding:'44px 40px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:32 }}>
          <h1 className="font-heading" style={{ fontSize:'1.75rem', fontWeight:600, letterSpacing:'-0.025em' }}>Dashboard</h1>
          <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{deals.length} deals</span>
        </div>
        {dbError && (
          <div style={{ background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:'0.82rem', color:'var(--red)' }}>
            Could not connect to database. Check your Supabase config.
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
          {[
            { label:'Monthly Pipeline', value: totalRetainer > 0 ? formatEuro(totalRetainer) : '—', color:'' },
            { label:'Avg Margin', value: deals.length ? `${avgMargin.toFixed(1)}%` : '—', color:'var(--green)' },
            { label:'At Risk', value: String(atRisk), color: atRisk > 0 ? 'var(--red)' : 'var(--text)' },
            { label:'Approved', value: String(approved.length), color:'' },
          ].map(s => (
            <div key={s.label} className="gl-card" style={{ padding:'18px 20px' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:500, color:'var(--text-muted)', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
              <div className="font-heading" style={{ fontSize:'1.55rem', fontWeight:600, letterSpacing:'-0.02em', color: s.color || 'var(--text)' }}>{s.value}</div>
            </div>
          ))}
        </div>
        {deals.length === 0 && !dbError && (
          <div className="gl-card" style={{ padding:'64px 40px', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:16 }}>📊</div>
            <div className="font-heading" style={{ fontSize:'1.2rem', fontWeight:600, marginBottom:8 }}>No deals yet</div>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:24 }}>Create your first deal to see if it's actually profitable.</div>
            <Link href="/deals/new" className="gl-btn gl-btn-primary">Create first deal</Link>
          </div>
        )}
        {deals.length > 0 && (
          <div className="gl-card">
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                  {['Client','Retainer','Margin','Score','Risk','Status','Date',''].map(h => (
                    <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal.id} className="gl-tr">
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{deal.client_name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:1 }}>{deal.industry} · {deal.contract_duration}mo</div>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <span className="font-heading" style={{ fontSize:'0.9rem', fontWeight:600 }}>{formatEuro(deal.monthly_retainer)}</span>
                      <span style={{ color:'var(--text-light)', fontSize:'0.75rem' }}>/mo</span>
                    </td>
                    <td style={{ padding:'14px 20px' }}><MarginBar percent={deal.margin_percent}/></td>
                    <td style={{ padding:'14px 20px' }}><ScoreRing score={deal.margin_score}/></td>
                    <td style={{ padding:'14px 20px' }}><RiskBadge level={deal.scope_risk_level}/></td>
                    <td style={{ padding:'14px 20px' }}><StatusPill status={deal.status}/></td>
                    <td style={{ padding:'14px 20px', fontSize:'0.76rem', color:'var(--text-muted)' }}>
                      {new Date(deal.created_at).toLocaleDateString('nl-BE')}
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <Link href={`/deals/${deal.id}`} style={{ color:'var(--text-light)', textDecoration:'none', fontSize:'0.9rem' }}>→</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
