export const runtime = 'edge'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAgencyId } from '@/lib/supabase-server'
import { getAllDeals } from '@/lib/supabase'
import { formatEuro } from '@/lib/profitability'
import Nav from '@/components/Nav'
import { ScoreRing, RiskBadge } from '@/components/DealBadges'
import DealStatusButton from '@/components/DealStatusButton'

export default async function CompletedDealsPage() {
  const agencyId = await getAgencyId()
  if (!agencyId) redirect('/login')

  let deals: Awaited<ReturnType<typeof getAllDeals>> = []
  let dbError = false
  try { deals = (await getAllDeals(agencyId)).filter(d => d.status === 'COMPLETED') } catch { dbError = true }

  return (
    <>
      <Nav breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Completed' }]} />

      <main style={{ maxWidth: 1020, margin: '0 auto', padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>Completed Deals</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Deals marked as finished. They no longer show up on the main dashboard.</p>
        </div>

        {dbError && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: 'var(--red)' }}>
            Could not load deals. Please refresh.
          </div>
        )}

        <div className="gl-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Completed</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{deals.length} deal{deals.length !== 1 ? 's' : ''}</div>
          </div>

          {deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
              <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No completed deals</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
                Deals you mark as completed on the dashboard will show up here.
              </div>
              <Link href="/dashboard" className="gl-btn gl-btn-ghost">Back to dashboard</Link>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 100px 32px', gap: 12, padding: '8px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Retainer', 'Margin', 'Risk', '', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {deals.map(deal => {
                const mp = deal.margin_percent ?? 0
                const mc = mp >= 30 ? 'var(--green)' : mp >= 20 ? 'var(--amber)' : 'var(--red)'
                return (
                  <div key={deal.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 100px 32px', gap: 12, padding: '14px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
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
                    <DealStatusButton dealId={deal.id} targetStatus="DRAFT" label="↩ Reopen" title="Move back to active deals" />
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
