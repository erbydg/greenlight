import type { Deal, RiskLevel } from '@/types/deal'
import type { Locale, getDictionary } from '@/lib/i18n/translations'

type Dict = ReturnType<typeof getDictionary>

const RISK_COLOR: Record<RiskLevel, string> = {
  LOW: 'var(--green)',
  MEDIUM: 'var(--amber)',
  HIGH: 'var(--red)',
}

function MarginTrendChart({ deals, d, locale }: { deals: Deal[]; d: Dict; locale: Locale }) {
  const points = deals
    .filter(dl => dl.margin_percent !== null)
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  if (points.length === 0) {
    return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.dashboard.portfolioMarginEmpty}</div>
  }

  const W = 560, H = 160, PAD = 24
  const margins = points.map(dl => dl.margin_percent ?? 0)
  const minM = Math.min(...margins, 0)
  const maxM = Math.max(...margins, 40)
  const padM = (maxM - minM) * 0.15 || 5
  const yMin = minM - padM
  const yMax = maxM + padM

  const times = points.map(dl => new Date(dl.created_at).getTime())
  const minT = Math.min(...times)
  const maxT = Math.max(...times)
  const spread = maxT > minT

  const x = (t: number) => spread ? PAD + ((t - minT) / (maxT - minT)) * (W - PAD * 2) : W / 2
  const y = (m: number) => H - PAD - ((m - yMin) / (yMax - yMin)) * (H - PAD * 2)

  const coords = points.map(dl => ({
    x: x(new Date(dl.created_at).getTime()),
    y: y(dl.margin_percent ?? 0),
    dl,
  }))
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')

  const dateFmt = new Intl.DateTimeFormat(locale === 'nl' ? 'nl-BE' : 'en-GB', { day: 'numeric', month: 'short' })
  const showZeroLine = yMin < 0 && yMax > 0

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <text x={0} y={PAD} fontSize="10" fill="var(--text-light)">{yMax.toFixed(0)}%</text>
      <text x={0} y={H - PAD + 10} fontSize="10" fill="var(--text-light)">{yMin.toFixed(0)}%</text>

      {showZeroLine && (
        <line x1={PAD} y1={y(0)} x2={W - PAD} y2={y(0)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
      )}

      {coords.length > 1 && <path d={linePath} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" />}

      {coords.map((c, i) => (
        <circle key={points[i].id} cx={c.x} cy={c.y} r="4" fill={points[i].scope_risk_level ? RISK_COLOR[points[i].scope_risk_level!] : 'var(--text-light)'} stroke="var(--surface)" strokeWidth="1.5">
          <title>{`${points[i].client_name}: ${(points[i].margin_percent ?? 0).toFixed(1)}% (${dateFmt.format(new Date(points[i].created_at))})`}</title>
        </circle>
      ))}

      <text x={PAD} y={H + 16} fontSize="10" fill="var(--text-light)">{dateFmt.format(new Date(minT))}</text>
      <text x={W - PAD} y={H + 16} fontSize="10" fill="var(--text-light)" textAnchor="end">{dateFmt.format(new Date(maxT))}</text>
    </svg>
  )
}

function RiskDonut({ deals, d }: { deals: Deal[]; d: Dict }) {
  const counts: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 }
  for (const dl of deals) {
    if (dl.scope_risk_level) counts[dl.scope_risk_level]++
  }
  const total = counts.LOW + counts.MEDIUM + counts.HIGH

  if (total === 0) {
    return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.dashboard.portfolioMarginEmpty}</div>
  }

  const r = 36, cx = 44, cy = 44, circ = 2 * Math.PI * r
  const segments = (['LOW', 'MEDIUM', 'HIGH'] as RiskLevel[])
    .map(level => ({ level, value: counts[level], color: RISK_COLOR[level] }))
    .filter(s => s.value > 0)

  let offset = 0
  const arcs = segments.map(s => {
    const len = (s.value / total) * circ
    const arc = { ...s, len, dashoffset: -offset }
    offset += len
    return arc
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div className="gl-score-ring" style={{ width: 88, height: 88, flexShrink: 0 }}>
        <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
          {arcs.map(a => (
            <circle key={a.level} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth="10"
              strokeDasharray={`${a.len} ${circ - a.len}`} strokeDashoffset={a.dashoffset} strokeLinecap="butt" />
          ))}
        </svg>
        <div className="gl-score-inner">
          <span className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1 }}>{total}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {(['LOW', 'MEDIUM', 'HIGH'] as RiskLevel[]).map(level => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLOR[level], flexShrink: 0 }} />
              {d.risk[level]}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{counts[level]} · {total > 0 ? Math.round((counts[level] / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PortfolioSection({ deals, d, locale }: { deals: Deal[]; d: Dict; locale: Locale }) {
  if (deals.length === 0) return null

  return (
    <div className="gl-portfolio-grid" style={{ marginBottom: 16 }}>
      <div className="gl-card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{d.dashboard.portfolioMarginTitle}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.dashboard.portfolioMarginSub}</div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <MarginTrendChart deals={deals} d={d} locale={locale} />
        </div>
      </div>

      <div className="gl-card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{d.dashboard.portfolioRiskTitle}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.dashboard.portfolioRiskSub}</div>
        </div>
        <div style={{ padding: '20px' }}>
          <RiskDonut deals={deals} d={d} />
        </div>
      </div>
    </div>
  )
}
