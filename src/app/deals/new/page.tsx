// src/app/deals/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DealFormData, TeamRole } from '@/types/deal'

const INDUSTRIES = ['E-commerce', 'SaaS / Tech', 'Retail', 'Horeca & Food', 'Real Estate', 'Healthcare', 'Finance', 'Education', 'Fashion', 'Automotive', 'Local Business', 'Other']
const PAID_ADS = ['Meta Ads campagne setup', 'Meta Ads maandelijks beheer', 'Google Ads campagne setup', 'Google Ads maandelijks beheer', 'LinkedIn Ads', 'TikTok Ads', 'Retargeting setup', 'A/B testing', 'Rapportage & analyse']
const SEO = ['Technische SEO audit', 'On-page optimalisatie', 'Content strategie', 'Linkbuilding', 'Lokale SEO', 'Maandelijkse rapportage']
const CREATIVE = ['Ad creatives (statisch)', 'Ad creatives (video)', 'Social media content', 'Copywriting', 'Landing page design', 'Branding assets']
const REPORTING = ['Maandelijks rapport', 'Wekelijks rapport', 'Dashboard setup', 'Kwartaalreview', 'GA4 setup']
const STRATEGY = ['Maandelijks strategy call', 'Quarterly business review', 'Competitor analyse', 'Audience research', 'Funnel strategie']

function CheckboxGroup({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])} className="w-4 h-4 text-green-600 rounded border-gray-300" />
            <span className="text-sm text-gray-600">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function TagInput({ label, placeholder, values, onChange }: { label: string; placeholder: string; values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')
  const add = () => { const t = input.trim(); if (t && !values.includes(t)) { onChange([...values, t]); setInput('') } }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button type="button" onClick={add} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">+</button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map(val => (
            <span key={val} className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">
              {val}
              <button type="button" onClick={() => onChange(values.filter(v => v !== val))} className="hover:text-green-900">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const empty: DealFormData = {
  client_name: '', industry: '', contract_duration: 6, monthly_retainer: 0, setup_fee: 0,
  team_roles: [],
  deliverables: { paidAds: [], seo: [], creative: [], reporting: [], strategy: [], custom: [] },
  kpi_promises: [], timeline_promises: [], verbal_promises: [], exclusions: [],
}

export default function NewDealPage() {
  const router = useRouter()
  const [form, setForm] = useState<DealFormData>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (key: keyof DealFormData, value: any) => setForm(p => ({ ...p, [key]: value }))
  const updateDel = (key: keyof DealFormData['deliverables'], value: string[]) => setForm(p => ({ ...p, deliverables: { ...p.deliverables, [key]: value } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      const { deal } = await res.json()
      router.push(`/deals/${deal.id}`)
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</a>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nieuwe deal</h1>
            <p className="text-sm text-gray-500">Vul de deal details in om winstgevendheid te berekenen</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* 1. Client */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">1. Client informatie</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Klantnaam *</label>
              <input required type="text" value={form.client_name} onChange={e => update('client_name', e.target.value)} placeholder="bijv. Webshop BV" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industrie *</label>
              <select required value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Kies industrie</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contractduur *</label>
              <select required value={form.contract_duration} onChange={e => update('contract_duration', Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {[1, 3, 6, 12, 24].map(m => <option key={m} value={m}>{m} maanden</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Financieel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">2. Financieel</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maandelijks retainer (€) *</label>
              <input required type="number" min={0} value={form.monthly_retainer || ''} onChange={e => update('monthly_retainer', Number(e.target.value))} placeholder="bijv. 3500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eenmalige setup fee (€)</label>
              <input type="number" min={0} value={form.setup_fee || ''} onChange={e => update('setup_fee', Number(e.target.value))} placeholder="bijv. 1500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>

        {/* 3. Team */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">3. Team & kosten</h2>
            <button type="button" onClick={() => update('team_roles', [...form.team_roles, { role: '', hourlyCost: 75, monthlyHours: 20 }])} className="text-sm text-green-600 font-medium hover:text-green-800">+ Rol toevoegen</button>
          </div>
          {form.team_roles.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nog geen rollen toegevoegd.</p>}
          <div className="space-y-3">
            {form.team_roles.map((role, i) => (
              <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-lg p-3">
                <div className="flex-1 space-y-2">
                  <input type="text" value={role.role} onChange={e => update('team_roles', form.team_roles.map((r, j) => j === i ? { ...r, role: e.target.value } : r))} placeholder="Rol (bijv. Media Buyer)" className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">€/uur intern</label>
                      <input type="number" value={role.hourlyCost} onChange={e => update('team_roles', form.team_roles.map((r, j) => j === i ? { ...r, hourlyCost: Number(e.target.value) } : r))} className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">uur/maand</label>
                      <input type="number" value={role.monthlyHours} onChange={e => update('team_roles', form.team_roles.map((r, j) => j === i ? { ...r, monthlyHours: Number(e.target.value) } : r))} className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => update('team_roles', form.team_roles.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 text-xl leading-none mt-1">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Deliverables */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">4. Deliverables</h2>
          <div className="space-y-5">
            <CheckboxGroup label="Paid Advertising" options={PAID_ADS} selected={form.deliverables.paidAds} onChange={v => updateDel('paidAds', v)} />
            <CheckboxGroup label="SEO" options={SEO} selected={form.deliverables.seo} onChange={v => updateDel('seo', v)} />
            <CheckboxGroup label="Creative & Content" options={CREATIVE} selected={form.deliverables.creative} onChange={v => updateDel('creative', v)} />
            <CheckboxGroup label="Reporting" options={REPORTING} selected={form.deliverables.reporting} onChange={v => updateDel('reporting', v)} />
            <CheckboxGroup label="Strategy" options={STRATEGY} selected={form.deliverables.strategy} onChange={v => updateDel('strategy', v)} />
            <TagInput label="Custom deliverables" placeholder="Typ en druk Enter..." values={form.deliverables.custom} onChange={v => updateDel('custom', v)} />
          </div>
        </div>

        {/* 5. Beloften */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">5. Beloften & uitsluitingen</h2>
          <div className="space-y-4">
            <TagInput label="KPI beloften" placeholder="bijv. ROAS van 4x binnen 60 dagen" values={form.kpi_promises} onChange={v => update('kpi_promises', v)} />
            <TagInput label="Timeline beloften" placeholder="bijv. Eerste resultaten binnen 30 dagen" values={form.timeline_promises} onChange={v => update('timeline_promises', v)} />
            <TagInput label="Verbale beloften" placeholder="bijv. Altijd binnen 24u bereikbaar" values={form.verbal_promises} onChange={v => update('verbal_promises', v)} />
            <TagInput label="Uitsluitingen (wat is NIET inbegrepen)" placeholder="bijv. Advertentiebudget is niet inbegrepen" values={form.exclusions} onChange={v => update('exclusions', v)} />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}

        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
            {loading ? 'Berekenen...' : 'Deal analyseren →'}
          </button>
          <a href="/" className="px-6 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium">Annuleren</a>
        </div>
      </form>
    </div>
  )
}
