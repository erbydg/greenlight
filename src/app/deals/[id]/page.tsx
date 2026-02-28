// src/app/deals/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatEuro } from '@/lib/profitability'
import type { Deal, RiskLevel } from '@/types/deal'

function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return null
  const styles = { LOW: 'bg-green-100 text-green-800', MEDIUM: 'bg-amber-100 text-amber-800', HIGH: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${styles[level]}`}>{level} RISK</span>
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function markdownToText(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\*\s+/gm, '- ')
    .replace(/^\d+\.\s+/gm, '')
    .trim()
}

function Doc({ title, content, onDownload }: { title: string; content: string | null; onDownload?: () => void }) {
  if (!content) return null
  const clean = markdownToText(content)
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
        {onDownload && (
          <button onClick={onDownload} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 font-medium">
            ↓ Download PDF
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{clean}</div>
    </div>
  )
}

async function downloadPDF(title: string, content: string, filename: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const clean = content
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .trim()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin, 20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const lines = doc.splitTextToSize(clean, maxWidth)
  let y = 35
  lines.forEach((line: string) => {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.text(line, margin, y)
    y += 5
  })
  doc.save(filename)
}

export default function DealDetailPage() {
  const params = useParams()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/deals/${params.id}`)
      .then(r => r.json())
      .then(d => { setDeal(d); setLoading(false) })
      .catch(() => { setError('Deal niet gevonden'); setLoading(false) })
  }, [params.id])

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/deals/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) setDeal(await res.json())
  }

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealId: params.id }) })
      if (!res.ok) throw new Error()
      const { deal: updated } = await res.json()
      setDeal(updated)
    } catch {
      setError('AI generatie mislukt. Controleer je Gemini API key.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Laden...</div>
  if (!deal) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error || 'Niet gevonden'}</div>

  const marginColor = (deal.margin_percent || 0) >= 30 ? 'text-green-600' : (deal.margin_percent || 0) >= 20 ? 'text-amber-600' : 'text-red-600'
  const hasDocuments = deal.ai_risk_summary || deal.ai_scope_lock_doc

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</a>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{deal.client_name}</h1>
              <p className="text-sm text-gray-500">{deal.industry} · {deal.contract_duration} maanden</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={deal.scope_risk_level} />
            {deal.status === 'DRAFT' && (
              <>
                <button onClick={() => updateStatus('APPROVED')} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Goedkeuren</button>
                <button onClick={() => updateStatus('REJECTED')} className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200">Afwijzen</button>
              </>
            )}
            {deal.status !== 'DRAFT' && (
              <span className={`px-3 py-1.5 text-sm rounded-lg font-medium ${deal.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{deal.status}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Metric label="Retainer" value={`${formatEuro(deal.monthly_retainer)}/m`} />
          <Metric label="Interne kosten" value={`${formatEuro(deal.total_monthly_cost || 0)}/m`} />
          <Metric label="Marge" value={`${(deal.margin_percent || 0).toFixed(1)}%`} color={marginColor} />
          <Metric label="Contractwaarde" value={formatEuro(deal.projected_contract_value || 0)} sub={`${deal.contract_duration}m contract`} />
        </div>

        {/* Score bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Deal Health Score</h3>
            <span className="text-2xl font-bold text-gray-900">{deal.margin_score}/100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full ${(deal.margin_score || 0) >= 60 ? 'bg-green-500' : (deal.margin_score || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${deal.margin_score || 0}%` }} />
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Team Allocatie</h3>
          <div className="space-y-2">
            {deal.team_roles.map((r: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{r.role}</span>
                <span className="text-gray-500">{r.monthlyHours}u/m @ €{r.hourlyCost}/u</span>
                <span className="font-medium">{formatEuro(r.hourlyCost * r.monthlyHours)}/m</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold">
              <span>Totale interne kosten</span>
              <span>{formatEuro(deal.total_monthly_cost || 0)}/m</span>
            </div>
          </div>
        </div>

        {/* AI Documenten */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">AI Documenten</h3>
              <p className="text-xs text-gray-500 mt-0.5">Risico analyse · Scope lock · Handover · Kickoff plan</p>
            </div>
            {!hasDocuments && (
              <button onClick={generate} disabled={generating} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                {generating ? 'Genereren...' : 'Genereer documenten'}
              </button>
            )}
          </div>
          {!hasDocuments && !generating && <p className="text-sm text-gray-400 text-center py-6">Klik op "Genereer documenten" om de 4 AI documenten aan te maken.</p>}
          {generating && (
            <div className="text-center py-6">
              <div className="inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-500">Gemini genereert documenten...</p>
            </div>
          )}
        </div>

        {hasDocuments && (
          <>
            <Doc title="Interne Risico Analyse" content={deal.ai_risk_summary} onDownload={() => downloadPDF('Internal Risk Analysis', deal.ai_risk_summary!, `${deal.client_name}-risk-analysis.pdf`)} />
            <Doc title="Scope Lock Document" content={deal.ai_scope_lock_doc} onDownload={() => downloadPDF('Scope Lock Document', deal.ai_scope_lock_doc!, `${deal.client_name}-scope-lock.pdf`)} />
            <Doc title="Delivery Handover Brief" content={deal.ai_handover_brief} onDownload={() => downloadPDF('Handover Brief', deal.ai_handover_brief!, `${deal.client_name}-handover.pdf`)} />
            <Doc title="30-Dagen Kickoff Plan" content={deal.ai_kickoff_plan} onDownload={() => downloadPDF('30-Day Kickoff Plan', deal.ai_kickoff_plan!, `${deal.client_name}-kickoff-plan.pdf`)} />
          </>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
      </div>
    </div>
  )
}
