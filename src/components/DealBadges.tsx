import type { RiskLevel } from '@/types/deal'
import type { getDictionary } from '@/lib/i18n/translations'

type Dict = ReturnType<typeof getDictionary>

export function ScoreRing({ score, size = 28 }: { score: number | null; size?: number }) {
  const s = score ?? 0
  const r = size === 28 ? 11 : 36, circ = 2 * Math.PI * r
  const offset = circ - (s / 100) * circ
  const color = s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="gl-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function RiskBadge({ level, d }: { level: RiskLevel | null; d: Dict }) {
  if (!level) return null
  const cls = level === 'LOW' ? 'gl-badge-low' : level === 'MEDIUM' ? 'gl-badge-medium' : 'gl-badge-high'
  return <span className={`gl-badge ${cls}`}><span className="gl-badge-dot" />{d.risk[level]}</span>
}

export function StatusBadge({ status, d }: { status: 'DRAFT' | 'APPROVED' | 'REJECTED' | 'COMPLETED'; d: Dict }) {
  return <span className={`gl-status gl-status-${status.toLowerCase()}`}>{d.status[status]}</span>
}
