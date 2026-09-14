export const runtime = 'edge'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAgencyId } from '@/lib/supabase-server'
import { getAllDeals } from '@/lib/supabase'
import { formatEuro } from '@/lib/profitability'
import { getServerDictionary } from '@/lib/i18n/server'
import Nav from '@/components/Nav'
import { ScoreRing, RiskBadge, StatusBadge } from '@/components/DealBadges'
import DealStatusButton from '@/components/DealStatusButton'
import { createClient } from '@supabase/supabase-js'
import type { Deal } from '@/types/deal'

export default async function DashboardPage() {
  const agencyId = await getAgencyId()
  if (!agencyId) redirect('/login')
  const { d } = await getServerDictionary()

  const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: agencyData } = await svc.from('agencies').select('plan, created_at').eq('id', agencyId).single()
  const plan = agencyData?.plan ?? 'trial'
  const trialDaysElapsed = agencyData?.created_at
    ? (Date.now() - new Date(agencyData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 0
  const isTrialExpired = plan === 'trial' && trialDaysElapsed > 14

  let allDeals: Deal[] = []
  let dbError = false
  try { allDeals = await getAllDeals(agencyId) } catch { dbError = true }
  const deals = allDeals.filter(d => d.status !== 'COMPLETED')

  const isLimited = isTrialExpired

  const totalDeals = deals.length
  const avgMargin = totalDeals > 0 ? deals.reduce((s, dl) => s + (dl.margin_percent ?? 0), 0) / totalDeals : 0
  const approved = deals.filter(dl => dl.status === 'APPROVED').length
  const atRisk = deals.filter(dl => dl.scope_risk_level === 'HIGH' || dl.scope_risk_level === 'MEDIUM').length

  return (
    <>
      <Nav
        breadcrumbs={[{ label: d.dashboard.title }]}
        actions={
          isLimited
            ? <span className="gl-btn gl-btn-primary" style={{opacity:0.5,cursor:'not-allowed'}}>{d.dashboard.newDeal}</span>
            : <Link href="/deals/new" className="gl-btn gl-btn-primary">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5.5v10M.5 5.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {d.dashboard.newDeal}
              </Link>
        }
      />

      {isLimited && (
        <div style={{background:'#fffbeb',borderBottom:'1px solid #fde68a',padding:'12px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:'0.82rem',color:'#d97706'}}>
            <strong>{d.dashboard.trialEndedStrong}</strong> {d.dashboard.trialEndedBody}
          </div>
          <a href="mailto:bas@getgreenlight.io?subject=Upgrade Greenlight" style={{display:'inline-flex',alignItems:'center',gap:6,background:'#d97706',color:'#fff',padding:'7px 16px',borderRadius:6,fontSize:'0.78rem',fontWeight:500,textDecoration:'none'}}>
            {d.dashboard.upgrade}
          </a>
        </div>
      )}

      <main style={{ maxWidth: 1020, margin: '0 auto', padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>{d.dashboard.title}</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.dashboard.sub}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: d.dashboard.stats.totalDeals, value: totalDeals, sub: d.dashboard.stats.totalDealsSub },
            { label: d.dashboard.stats.avgMargin, value: `${avgMargin.toFixed(1)}%`, sub: d.dashboard.stats.avgMarginSub, color: avgMargin >= 30 ? 'var(--green)' : avgMargin >= 20 ? 'var(--amber)' : 'var(--red)' },
            { label: d.dashboard.stats.approved, value: approved, sub: d.dashboard.stats.approvedSub },
            { label: d.dashboard.stats.atRisk, value: atRisk, sub: d.dashboard.stats.atRiskSub, color: atRisk > 0 ? 'var(--amber)' : 'var(--green)' },
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
            {d.dashboard.loadError}
          </div>
        )}

        <div className="gl-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{d.dashboard.allDeals}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.dashboard.dealCount(totalDeals)}</div>
              <Link href="/dashboard/completed" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{d.dashboard.completedLink}</Link>
            </div>
          </div>

          {deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
              <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>
                {allDeals.length > 0 ? d.dashboard.noActiveTitle : d.dashboard.noDealsTitle}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
                {allDeals.length > 0 ? d.dashboard.noActiveBody : d.dashboard.noDealsBody}
              </div>
              {allDeals.length > 0
                ? <Link href="/dashboard/completed" className="gl-btn gl-btn-ghost">{d.dashboard.viewCompleted}</Link>
                : <Link href="/deals/new" className="gl-btn gl-btn-primary">{d.dashboard.createFirst}</Link>}
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 80px 100px 32px', gap: 12, padding: '8px 24px', borderBottom: '1px solid var(--border)' }}>
                {[d.dashboard.colClient, d.dashboard.colRetainer, d.dashboard.colMargin, d.dashboard.colRisk, d.dashboard.colStatus, '', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {deals.map(deal => {
                const mp = deal.margin_percent ?? 0
                const mc = mp >= 30 ? 'var(--green)' : mp >= 20 ? 'var(--amber)' : 'var(--red)'
                return (
                  <div key={deal.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 80px 100px 32px', gap: 12, padding: '14px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background 0.12s' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{deal.client_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{deal.industry} · {deal.contract_duration}mo</div>
                    </div>
                    <div className="font-heading" style={{ fontSize: '0.88rem', fontWeight: 600 }}>{formatEuro(deal.monthly_retainer)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ScoreRing score={deal.margin_score} />
                      <span className="font-heading" style={{ fontSize: '0.88rem', fontWeight: 600, color: mc }}>{mp.toFixed(1)}%</span>
                    </div>
                    <RiskBadge level={deal.scope_risk_level} d={d} />
                    <StatusBadge status={deal.status} d={d} />
                    <DealStatusButton dealId={deal.id} targetStatus="COMPLETED" label={d.dashboard.markDone} title={d.dashboard.markDoneTitle} />
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
