'use client'
import { useState } from 'react'
import Link from 'next/link'
import { calculateProfitability, formatEuro } from '@/lib/profitability'
import type { DealFormData } from '@/types/deal'
import { useLocale } from '@/lib/i18n/LocaleProvider'

export default function FreeCheckCalculator({ id }: { id?: string } = {}) {
  const { d, locale } = useLocale()
  const t = d.landing.freeCheck

  const [retainer, setRetainer] = useState(4500)
  const [duration, setDuration] = useState(12)
  const [setupFee, setSetupFee] = useState(1000)
  const [hours, setHours] = useState(31.5)
  const [hourlyRate, setHourlyRate] = useState(65)
  const [adSpend, setAdSpend] = useState(3000)
  const [adThroughAgency, setAdThroughAgency] = useState(true)

  const [leadEmail, setLeadEmail] = useState('')
  const [leadSending, setLeadSending] = useState(false)
  const [leadSent, setLeadSent] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)

  const formData: DealFormData = {
    client_name: '', industry: '', contract_duration: duration,
    monthly_retainer: retainer, setup_fee: setupFee,
    ad_spend: adSpend, ad_spend_through_agency: adThroughAgency,
    team_roles: [{ role: 'Team', mode: 'quick', hourlyCost: hourlyRate, monthlyHours: hours }],
    deliverables: { paidAds: [], seo: [], creative: [], reporting: [], strategy: [], custom: [] },
    kpi_promises: [], timeline_promises: [], verbal_promises: [], exclusions: [],
  }
  const result = calculateProfitability(formData)
  const totalProfit = result.total_projected_profit + setupFee

  const scoreColor = result.gross_margin < 0 ? 'var(--lp-calc-red, #dc2626)'
    : result.scope_risk_level === 'HIGH' ? 'var(--lp-calc-red, #dc2626)'
    : result.scope_risk_level === 'MEDIUM' ? 'var(--lp-calc-amber, #d97706)'
    : 'var(--lp-calc-green, #16a34a)'

  const message = result.gross_margin < 0 ? t.messageLoss
    : result.scope_risk_level === 'HIGH' ? t.messageHigh
    : result.scope_risk_level === 'MEDIUM' ? t.messageMedium
    : t.messageHealthy

  const handleSaveLead = async () => {
    if (!leadEmail.trim()) return
    setLeadSending(true); setLeadError(null); setLeadSent(false)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail.trim(),
          monthly_retainer: retainer, contract_duration: duration, setup_fee: setupFee,
          hours, hourly_rate: hourlyRate, ad_spend: adSpend, ad_through_agency: adThroughAgency,
          total_monthly_cost: result.total_monthly_cost, gross_margin: result.gross_margin,
          margin_percent: result.margin_percent, margin_score: result.margin_score,
          total_profit: totalProfit, locale,
        }),
      })
      if (!res.ok) throw new Error()
      setLeadSent(true)
      setLeadEmail('')
    } catch {
      setLeadError(t.leadError)
    } finally {
      setLeadSending(false)
    }
  }

  return (
    <section id={id} className="lp-calc-wrap">
      <div className="lp-calc-inner">
        <div className="lp-calc-intro">
          <div className="lp-eyebrow" style={{ marginBottom: 14 }}><span className="lp-eyebrow-dot"/>{t.eyebrow}</div>
          <h2 className="lp-calc-title">{t.title}</h2>
          <p className="lp-calc-sub">{t.sub}</p>
        </div>

        <div className="lp-calc-card">
          <div className="lp-calc-form">
            <div className="lp-calc-section-label">{t.sectionDeal}</div>
            <div className="lp-calc-row">
              <div className="lp-calc-field">
                <label className="lp-calc-label">{t.retainerLabel}</label>
                <div className="lp-calc-prefix">
                  <span>€</span>
                  <input type="number" min={0} value={retainer} onChange={e => setRetainer(Number(e.target.value))}/>
                </div>
              </div>
              <div className="lp-calc-field">
                <label className="lp-calc-label">{t.durationLabel}</label>
                <div className="lp-calc-suffix">
                  <input type="number" min={0} value={duration} onChange={e => setDuration(Number(e.target.value))}/>
                  <span>{t.durationUnit}</span>
                </div>
              </div>
            </div>
            <div className="lp-calc-field">
              <label className="lp-calc-label">{t.setupFeeLabel}</label>
              <div className="lp-calc-prefix">
                <span>€</span>
                <input type="number" min={0} value={setupFee} onChange={e => setSetupFee(Number(e.target.value))}/>
              </div>
              <div className="lp-calc-note">{t.setupFeeNote}</div>
            </div>

            <div className="lp-calc-section-label" style={{ marginTop: 18 }}>{t.sectionTeam}</div>
            <div className="lp-calc-row">
              <div className="lp-calc-field">
                <label className="lp-calc-label">{t.hoursLabel}</label>
                <div className="lp-calc-suffix">
                  <input type="number" min={0} step={0.5} value={hours} onChange={e => setHours(Number(e.target.value))}/>
                  <span>{t.hoursUnit}</span>
                </div>
              </div>
              <div className="lp-calc-field">
                <label className="lp-calc-label">{t.rateLabel}</label>
                <div className="lp-calc-prefix">
                  <span>€</span>
                  <input type="number" min={0} value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))}/>
                  <span className="lp-calc-unit-tail">{t.rateUnit}</span>
                </div>
              </div>
            </div>
            <div className="lp-calc-note">{t.rateNote}</div>

            <div className="lp-calc-section-label" style={{ marginTop: 18 }}>{t.sectionAd}</div>
            <div className="lp-calc-field">
              <label className="lp-calc-label">{t.adLabel}</label>
              <div className="lp-calc-prefix">
                <span>€</span>
                <input type="number" min={0} value={adSpend} onChange={e => setAdSpend(Number(e.target.value))}/>
              </div>
            </div>
            <label className="lp-calc-checkbox">
              <input type="checkbox" checked={adThroughAgency} onChange={e => setAdThroughAgency(e.target.checked)}/>
              <span>{t.adThroughAgency}</span>
            </label>
          </div>

          <div className="lp-calc-result">
            <div className="lp-calc-result-row">
              <span>{t.internalCostLabel}</span>
              <strong>{formatEuro(result.total_monthly_cost)}</strong>
            </div>
            <div className="lp-calc-result-row">
              <span>{t.grossMarginLabel}</span>
              <strong>{formatEuro(result.gross_margin)}</strong>
            </div>
            <div className="lp-calc-result-row">
              <span>{t.marginPctLabel}</span>
              <strong>{result.margin_percent.toFixed(1)}%</strong>
            </div>
            <div className="lp-calc-result-row">
              <span>{t.totalProfitLabel}</span>
              <strong>{formatEuro(totalProfit)}</strong>
            </div>

            <div className="lp-calc-score" style={{ borderColor: scoreColor }}>
              <div className="lp-calc-score-label">{t.healthScoreLabel}</div>
              <div className="lp-calc-score-val" style={{ color: scoreColor }}>{result.margin_score}/100</div>
              <div className="lp-calc-score-bar">
                <div style={{ width: `${result.margin_score}%`, background: scoreColor }}/>
              </div>
              <div className="lp-calc-score-msg" style={{ color: scoreColor }}>{message}</div>
            </div>

            <div className="lp-calc-lead">
              <div className="lp-calc-lead-label">{t.leadLabel}</div>
              <div className="lp-calc-lead-row">
                <input
                  type="email"
                  value={leadEmail}
                  onChange={e => { setLeadEmail(e.target.value); setLeadSent(false); setLeadError(null) }}
                  placeholder={t.leadPlaceholder}
                />
                <button onClick={handleSaveLead} disabled={leadSending || !leadEmail.trim()} className="lp-calc-lead-btn">
                  {leadSending ? t.leadSending : t.leadButton}
                </button>
              </div>
              {leadSent && !leadError && <div className="lp-calc-lead-msg lp-calc-lead-ok">{t.leadSent}</div>}
              {leadError && <div className="lp-calc-lead-msg lp-calc-lead-err">{leadError}</div>}
              {!leadSent && !leadError && <div className="lp-calc-note">{t.leadNote}</div>}
            </div>

            <div className="lp-calc-footer-note">{t.footerNote}</div>
            <Link href="/signup" className="lp-btn lp-calc-cta">{t.cta}</Link>
            <div className="lp-calc-disclaimer">{t.disclaimer}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
