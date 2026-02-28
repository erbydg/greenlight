// src/app/page.tsx
export const runtime = 'edge'

import Link from 'next/link'
import { getAllDeals } from '@/lib/supabase'
import { formatEuro } from '@/lib/profitability'
import type { Deal, RiskLevel } from '@/types/deal'

function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return null
  const styles = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-red-100 text-red-800',
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>{level}</span>
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>{status}</span>
}

function MarginBar({ percent }: { percent: number | null }) {
  if (percent === null) return <span className="text-gray-400 text-sm">—</span>
  const color = percent >= 30 ? 'bg-green-500' : percent >= 20 ? 'bg-amber-500' : 'bg-red-500'
  const width = Math.max(0, Math.min(100, percent))
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-700">{percent.toFixed(1)}%</span>
    </div>
  )
}

export default async function DashboardPage() {
  let deals: Deal[] = []
  let error: string | null = null
  try {
    deals = await getAllDeals()
  } catch {
    error = 'Kon deals niet laden. Controleer je Supabase verbinding.'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">🟢 Greenlight</h1>
            <p className="text-sm text-gray-500">Deal profitability & scope control</p>
          </div>
          <Link href="/deals/new" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            + Nieuwe deal
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">{error}</div>}

        {deals.length === 0 && !error ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Geen deals nog</h2>
            <p className="text-gray-500 mb-6">Maak je eerste deal aan om de winstgevendheid te berekenen.</p>
            <Link href="/deals/new" className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Eerste deal aanmaken
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Totaal deals</p>
                <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">High risk</p>
                <p className="text-2xl font-bold text-red-600">{deals.filter(d => d.scope_risk_level === 'HIGH').length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Goedgekeurd</p>
                <p className="text-2xl font-bold text-green-600">{deals.filter(d => d.status === 'APPROVED').length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Retainer</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Marge</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Risico</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Datum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{deal.client_name}</p>
                        <p className="text-xs text-gray-500">{deal.industry} · {deal.contract_duration}m</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatEuro(deal.monthly_retainer)}/m</td>
                      <td className="px-6 py-4"><MarginBar percent={deal.margin_percent} /></td>
                      <td className="px-6 py-4"><RiskBadge level={deal.scope_risk_level} /></td>
                      <td className="px-6 py-4"><StatusBadge status={deal.status} /></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(deal.created_at).toLocaleDateString('nl-BE')}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/deals/${deal.id}`} className="text-green-600 text-sm font-medium hover:text-green-800">Bekijk →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
