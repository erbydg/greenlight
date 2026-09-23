'use client'
import { useState } from 'react'
import Link from 'next/link'
import DocContent from '@/components/DocContent'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { calculateProfitability } from '@/lib/profitability'
import { downloadPDF, stripMarkdown } from '@/lib/documents'
import { FieldLabel, CheckGrid, TagInput, SectionBlock, TeamSection, type Dict } from '@/components/DealForm'
import type { DealFormData } from '@/types/deal'

interface DemoDocuments { riskSummary: string; scopeLockDoc: string; handoverBrief: string; kickoffPlan: string }

function getDemoForm(d: Dict): DealFormData {
  return {
    client_name: d.demo.clientName,
    industry: d.dealForm.industries[0],
    contract_duration: 6,
    monthly_retainer: 3500,
    setup_fee: 500,
    ad_spend: 3000,
    ad_spend_through_agency: false,
    team_roles: [
      { role: 'Media Buyer', hourlyCost: 60, monthlyHours: 20, mode: 'quick' },
      { role: 'Designer', hourlyCost: 50, monthlyHours: 15, mode: 'quick' },
      { role: 'Account Manager', hourlyCost: 65, monthlyHours: 10, mode: 'quick' },
    ],
    deliverables: {
      paidAds: d.dealForm.paidAds.slice(0, 2),
      seo: [],
      creative: d.dealForm.creative.slice(0, 1),
      reporting: d.dealForm.reporting.slice(0, 1),
      strategy: [],
      custom: [],
    },
    kpi_promises: [d.demo.kpiPromise],
    timeline_promises: [d.demo.timelinePromise],
    verbal_promises: [],
    exclusions: [d.demo.exclusion],
  }
}

export default function DemoTool() {
  const { d, locale } = useLocale()
  const [form, setForm] = useState<DealFormData>(() => getDemoForm(d))
  const [open, setOpen] = useState<number[]>([1])
  const [documents, setDocuments] = useState<DemoDocuments | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('risk')
  const [copied, setCopied] = useState(false)

  const upd = (k: keyof DealFormData, v: any) => setForm(p => ({ ...p, [k]: v }))
  const updDel = (k: keyof DealFormData['deliverables'], v: string[]) => setForm(p => ({ ...p, deliverables: { ...p.deliverables, [k]: v } }))
  const toggleSection = (n: number) => setOpen(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n])

  const { total_monthly_cost: totalCost, gross_margin: margin, margin_percent: marginPct,
    total_projected_profit, margin_score: score, scope_risk_level: risk } = calculateProfitability(form)
  const totalProfit = total_projected_profit + (form.setup_fee || 0)
  const riskColor = risk === 'HIGH' ? 'var(--red)' : risk === 'MEDIUM' ? 'var(--amber)' : 'var(--green)'
  const marginColor = marginPct >= 30 ? 'var(--green)' : marginPct >= 20 ? 'var(--amber)' : 'var(--red)'
  const hasCalc = form.monthly_retainer > 0 && totalCost > 0

  const done = [
    !!form.client_name && !!form.industry,
    form.team_roles.length > 0,
    Object.values(form.deliverables).flat().length > 0,
    form.kpi_promises.length > 0 || form.timeline_promises.length > 0,
    form.exclusions.length > 0,
  ]
  const sections = d.dealForm.sections

  const handleGenerate = async () => {
    setGenerating(true); setGenError(null)
    try {
      const res = await fetch('/api/demo/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form, locale }),
      })
      if (res.status === 429) { setGenError(d.demo.rateLimited); return }
      if (!res.ok) throw new Error()
      const { documents: docs } = await res.json()
      setDocuments(docs)
      setActiveTab('risk')
    } catch {
      setGenError(d.demo.generateFailed)
    } finally {
      setGenerating(false)
    }
  }

  const TABS = d.dealDetail.tabs.map((t, i) => ({ ...t, num: i + 1, field: (['riskSummary', 'scopeLockDoc', 'handoverBrief', 'kickoffPlan'] as const)[i] }))
  const activeTabDef = TABS.find(t => t.key === activeTab)!
  const activeContent = documents?.[activeTabDef.field] ?? null

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(stripMarkdown(content))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="gl-nav">
        <div className="gl-nav-row">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'var(--text)' }}>
            <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L9 6H3L6 1Z" fill="white" opacity="0.9" /><rect x="3.5" y="7.5" width="5" height="3" rx="0.8" fill="white" opacity="0.4" /></svg>
            </div>
            <span className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Greenlight</span>
          </Link>
          <span className="gl-badge gl-badge-low"><span className="gl-badge-dot" />{d.demo.badge}</span>
          <Link href="/signup" className="gl-btn gl-btn-primary">{d.demo.ctaButton}</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1020, margin: '0 auto', padding: '24px 40px 0' }}>
        <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: 'var(--amber)', marginBottom: 20 }}>
          {d.demo.intro}
        </div>
      </main>

      <div className="gl-wizard-layout" style={{ maxWidth: 1020, margin: '0 auto', width: '100%' }}>
        <div>
          <SectionBlock n={1} title={sections[0].title} sub={sections[0].sub} done={done[0]} isOpen={open.includes(1)} onToggle={() => toggleSection(1)}>
            <div className="gl-form-grid-2" style={{ marginBottom: 14 }}>
              <div>
                <FieldLabel d={d}>{d.dealForm.clientName}</FieldLabel>
                <input className="gl-input" value={form.client_name} onChange={e => upd('client_name', e.target.value)} placeholder={d.dealForm.clientNamePlaceholder} />
              </div>
              <div>
                <FieldLabel d={d}>{d.dealForm.industry}</FieldLabel>
                <select className="gl-select" value={form.industry} onChange={e => upd('industry', e.target.value)}>
                  {d.dealForm.industries.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="gl-form-grid-3">
              <div>
                <FieldLabel d={d}>{d.dealForm.duration}</FieldLabel>
                <select className="gl-select" value={form.contract_duration} onChange={e => upd('contract_duration', Number(e.target.value))}>
                  {[1, 3, 6, 12, 24].map(m => <option key={m} value={m}>{d.dealForm.months(m)}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel d={d}>{d.dealForm.monthlyRetainer}</FieldLabel>
                <div className="gl-prefix">
                  <span className="gl-prefix-sym">€</span>
                  <input type="number" min={0} className="gl-input" value={form.monthly_retainer || ''} onChange={e => upd('monthly_retainer', Number(e.target.value))} />
                </div>
              </div>
              <div>
                <FieldLabel optional d={d}>{d.dealForm.setupFee}</FieldLabel>
                <div className="gl-prefix">
                  <span className="gl-prefix-sym">€</span>
                  <input type="number" min={0} className="gl-input" value={form.setup_fee || ''} onChange={e => upd('setup_fee', Number(e.target.value))} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <FieldLabel optional d={d}>{d.dealForm.monthlyAdBudget}</FieldLabel>
              <div className="gl-form-grid-adspend">
                <div className="gl-prefix">
                  <span className="gl-prefix-sym">€</span>
                  <input type="number" min={0} className="gl-input" value={form.ad_spend || ''} onChange={e => upd('ad_spend', Number(e.target.value))} />
                </div>
                <div
                  onClick={() => upd('ad_spend_through_agency', !form.ad_spend_through_agency)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 6, border: '1px solid var(--border)', background: form.ad_spend_through_agency ? 'var(--amber-bg)' : 'var(--bg)', borderColor: form.ad_spend_through_agency ? 'var(--amber-border)' : 'var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${form.ad_spend_through_agency ? 'var(--amber)' : 'var(--border)'}`, background: form.ad_spend_through_agency ? 'var(--amber)' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {form.ad_spend_through_agency && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 500, color: form.ad_spend_through_agency ? 'var(--amber)' : 'var(--text-muted)' }}>{d.dealForm.goesThroughAgency}</span>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock n={2} title={sections[1].title} sub={sections[1].sub} done={done[1]} isOpen={open.includes(2)} onToggle={() => toggleSection(2)}>
            <TeamSection form={form} upd={upd} teamMembers={[]} d={d} />
          </SectionBlock>

          <SectionBlock n={3} title={sections[2].title} sub={sections[2].sub} done={done[2]} isOpen={open.includes(3)} onToggle={() => toggleSection(3)}>
            <CheckGrid label={d.dealForm.labelPaidAds} items={d.dealForm.paidAds} selected={form.deliverables.paidAds} onChange={v => updDel('paidAds', v)} />
            <CheckGrid label={d.dealForm.labelSeo} items={d.dealForm.seoItems} selected={form.deliverables.seo} onChange={v => updDel('seo', v)} />
            <CheckGrid label={d.dealForm.labelCreative} items={d.dealForm.creative} selected={form.deliverables.creative} onChange={v => updDel('creative', v)} />
            <CheckGrid label={d.dealForm.labelReporting} items={d.dealForm.reporting} selected={form.deliverables.reporting} onChange={v => updDel('reporting', v)} />
            <CheckGrid label={d.dealForm.labelStrategy} items={d.dealForm.strategy} selected={form.deliverables.strategy} onChange={v => updDel('strategy', v)} />
          </SectionBlock>

          <SectionBlock n={4} title={sections[3].title} sub={sections[3].sub} done={done[3]} isOpen={open.includes(4)} onToggle={() => toggleSection(4)}>
            <TagInput d={d} label={d.dealForm.kpiLabel} placeholder={d.dealForm.kpiPlaceholder} values={form.kpi_promises} onChange={v => upd('kpi_promises', v)} />
            <TagInput d={d} label={d.dealForm.timelineLabel} placeholder={d.dealForm.timelinePlaceholder} values={form.timeline_promises} onChange={v => upd('timeline_promises', v)} />
            <TagInput d={d} label={d.dealForm.verbalLabel} placeholder={d.dealForm.verbalPlaceholder} values={form.verbal_promises} onChange={v => upd('verbal_promises', v)} optional />
          </SectionBlock>

          <SectionBlock n={5} title={sections[4].title} sub={sections[4].sub} done={done[4]} isOpen={open.includes(5)} onToggle={() => toggleSection(5)}>
            <TagInput d={d} label={d.dealForm.exclusionsLabel} placeholder={d.dealForm.exclusionsPlaceholder} values={form.exclusions} onChange={v => upd('exclusions', v)} />
          </SectionBlock>
        </div>

        <div className="gl-wizard-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="gl-card">
            <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.dealForm.liveProfitability}</div>
            </div>
            <div style={{ padding: 16 }}>
              {([
                [d.dealForm.retainer, form.monthly_retainer ? `€${form.monthly_retainer.toLocaleString('nl-BE')}/mo` : null],
                [d.dealForm.internalCost, totalCost > 0 ? `€${Math.round(totalCost).toLocaleString('nl-BE')}/mo` : null],
              ] as const).map(([k, v]) => (
                <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{String(k)}</span>
                  {v ? <span className="font-heading" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{String(v)}</span>
                    : <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>{d.common.dash}</span>}
                </div>
              ))}
              {hasCalc && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{d.dealForm.grossMargin}</span>
                  <span className="font-heading" style={{ fontWeight: 600, fontSize: '0.9rem', color: marginColor }}>€{Math.round(margin).toLocaleString('nl-BE')} · {marginPct.toFixed(1)}%</span>
                </div>
              )}
              {hasCalc && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.8rem' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{d.dealForm.totalProfit}</span>
                  <span className="font-heading" style={{ fontWeight: 600, fontSize: '0.9rem' }}>€{Math.round(totalProfit).toLocaleString('nl-BE')}</span>
                </div>
              )}
              <div style={{ margin: '14px 0 4px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{d.dealForm.dealHealthScore}</div>
                <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: hasCalc ? riskColor : 'var(--text-light)' }}>
                  {hasCalc ? score : d.common.dash}
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: riskColor, width: hasCalc ? `${score}%` : '0%', transition: 'width 0.4s ease' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{d.dealForm.scopeRisk}</span>
                <span className={`gl-badge gl-badge-${risk.toLowerCase()}`} style={{ opacity: hasCalc ? 1 : 0.4 }}>
                  <span className="gl-badge-dot" />{d.risk[risk]}
                </span>
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating || !hasCalc} className="gl-btn gl-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: '0.9rem', opacity: generating || !hasCalc ? 0.7 : 1 }}>
            {generating ? d.demo.generating : d.demo.generateBtn}
          </button>
          {genError && <div style={{ fontSize: '0.76rem', color: 'var(--red)', textAlign: 'center' }}>{genError}</div>}
        </div>
      </div>

      <main style={{ maxWidth: 1020, margin: '0 auto', padding: '0 40px 60px', width: '100%' }}>
        <div className="gl-card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.dealDetail.aiDocuments}</span>
          </div>

          {generating && (
            <div style={{ padding: '56px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div className="gl-loader">{[0, 1, 2, 3, 4].map(i => <div key={i} className="gl-lb" style={{ animationDelay: `${i * 0.1}s`, background: 'var(--green)' }} />)}</div>
              <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{d.demo.generating}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.demo.generatingSub}</div>
            </div>
          )}

          {!documents && !generating && (
            <div style={{ padding: '56px 28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {d.dealDetail.notGeneratedBody}
            </div>
          )}

          {documents && !generating && (
            <>
              <div className="gl-tab-bar">
                {TABS.map(tab => (
                  <button key={tab.key} className={`gl-tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                    <span className="gl-tab-num">{tab.num}</span>{tab.label}
                  </button>
                ))}
              </div>
              <div key={activeTab} className="animate-fade-up" style={{ padding: '28px 28px 12px' }}>
                {activeContent && <DocContent content={activeContent} />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                {activeContent && (
                  <>
                    <button onClick={() => copyToClipboard(activeContent)} className="gl-btn gl-btn-ghost" style={{ fontSize: '0.78rem', padding: '8px 18px' }}>
                      {copied ? d.dealDetail.copied : d.dealDetail.copy}
                    </button>
                    <button onClick={() => downloadPDF(activeTabDef.label, activeContent, `${form.client_name}-${activeTab}.pdf`)} className="gl-btn gl-btn-primary" style={{ fontSize: '0.78rem', padding: '8px 18px' }}>
                      {d.dealDetail.downloadPdf}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="gl-card" style={{ marginTop: 24, padding: '32px', textAlign: 'center', background: 'var(--ink)', border: 'none' }}>
          <div className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>{d.demo.ctaTitle}</div>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: 18 }}>{d.demo.ctaBody}</p>
          <Link href="/signup" className="gl-btn gl-btn-primary">{d.demo.ctaButton}</Link>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 14 }}>{d.demo.disclaimer}</div>
        </div>
      </main>
    </div>
  )
}
