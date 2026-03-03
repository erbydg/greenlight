import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAgencyId } from '@/lib/supabase-server'
import { getAllDeals } from '@/lib/supabase'
import { formatEuro } from '@/lib/profitability'
import Nav from '@/components/Nav'
import { createClient } from '@supabase/supabase-js'
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
    </div>
  )
}

function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return null
  const cls = level === 'LOW' ? 'gl-badge-low' : level === 'MEDIUM' ? 'gl-badge-medium' : 'gl-badge-high'
  return <span className={`gl-badge ${cls}`}><span className="gl-badge-dot"/>{level}</span>
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`gl-status gl-status-${status.toLowerCase()}`}>{status}</span>
}

export default async function DashboardPage() {
  const agencyId = await getAgencyId()
  if (!agencyId) redirect('/login')

  const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: agencyData } = await svc.from('agencies').select('plan').eq('id', agencyId).single()
  const plan = agencyData?.plan ?? 'trial'
  const isTrialExpired = plan === 'trial'

  let deals: Deal[] = []
  let dbError = false
  try { deals = await getAllDeals(agencyId) } catch { dbError = true }

  const isLimited = isTrialExpired && deals.length >= 1

  const totalDeals = deals.length
  const avgMargin = totalDeals > 0 ? deals.reduce((s, d) => s + (d.margin_percent ?? 0), 0) / totalDeals : 0
  const approved = deals.filter(d => d.status === 'APPROVED').length
  const atRisk = deals.filter(d => d.scope_risk_level === 'HIGH' || d.scope_risk_level === 'MEDIUM').length

  return (
    <>
      <Nav
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          isLimited
            ? <span className="gl-btn gl-btn-primary" style={{opacity:0.5,cursor:'not-allowed'}}>New Deal</span>
            : <Link href="/deals/new" className="gl-btn gl-btn-primary">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5.5v10M.5 5.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                New Deal
              </Link>
        }
      />

      {isLimited && (
        <div style={{background:'#fffbeb',borderBottom:'1px solid #fde68a',padding:'12px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:'0.82rem',color:'#d97706'}}>
            <strong>Your free trial has ended.</strong> You have used your 1 free deal. Upgrade to continue.
          </div>
          <a href="mailto:bas@getgreenlight.io?subject=Upgrade Greenlight" style={{display:'inline-flex',alignItems:'center',gap:6,background:'#d97706',color:'#fff',padding:'7px 16px',borderRadius:6,fontSize:'0.78rem',fontWeight:500,textDecoration:'none'}}>
            Upgrade — contact us
          </a>
        </div>
      )}

      <main style={{ maxWidth: 1020, margin: '0 auto', padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>Dashboard</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Overview of all your deals and profitability.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Total Deals', value: totalDeals, sub: 'all time' },
            { label: 'Avg Margin', value: `${avgMargin.toFixed(1)}%`, sub: 'across deals', color: avgMargin >= 30 ? 'var(--green)' : avgMargin >= 20 ? 'var(--amber)' : 'var(--red)' },
            { label: 'Approved', value: approved, sub: 'deals closed' },
            { label: 'At Risk', value: atRisk, sub: 'medium or high', color: atRisk > 0 ? 'var(--amber)' : 'var(--green)' },
          ].map(stat => (
            <div key={stat.label} className="gl-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{stat.label}</div>
              <div className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em', color: stat.color || 'var(--text)', lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {dbError && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: 'var(--red)' }}>
            Could not load deals. Please refresh.
          </div>
        )}

        <div className="gl-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 600 }}>All Deals</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{totalDeals} deal{totalDeals !== 1 ? 's' : ''}</div>
          </div>

          {deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
              <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No deals yet</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
                Create your first deal to see your profitability analysis here.
              </div>
              <Link href="/deals/new" className="gl-btn gl-btn-primary">Create first deal</Link>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 80px 32px', gap: 12, padding: '8px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Retainer', 'Margin', 'Risk', 'Status', ''].map(h => (
                  <div key={h} style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {deals.map(deal => {
                const mp = deal.margin_percent ?? 0
                const mc = mp >= 30 ? 'var(--green)' : mp >= 20 ? 'var(--amber)' : 'var(--red)'
                return (
                  <div key={deal.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 80px 32px', gap: 12, padding: '14px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background 0.12s' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{deal.client_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{deal.industry} · {deal.contract_duration}mo</div>
                    </div>
                    <div className="font-heading" style={{ fontSize: '0.88rem', fontWeight: 600 }}>{formatEuro(deal.monthly_retainer)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ScoreRing score={deal.margin_score} />
                      <span className="font-heading" style={{ fontSize: '0.88rem', fontWeight: 600, color: mc }}>{mp.toFixed(1)}%</span>
                    </div>
                    <RiskBadge level={deal.scope_risk_level} />
                    <StatusBadge status={deal.status} />
                    <Link href={`/deals/${deal.id}`} style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '0.9rem' }}>→</Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
