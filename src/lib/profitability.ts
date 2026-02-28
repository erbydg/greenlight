// src/lib/profitability.ts
// ⚠️ Geen AI hier. Alleen wiskunde en regels.

import type { DealFormData, ProfitabilityResult, RiskLevel } from '@/types/deal'

export function calculateProfitability(inputs: DealFormData): ProfitabilityResult {
  // 1. Interne kosten
  const total_monthly_cost = inputs.team_roles.reduce(
    (sum, role) => sum + role.hourlyCost * role.monthlyHours, 0
  )

  // 2. Marge
  const gross_margin = inputs.monthly_retainer - total_monthly_cost
  const margin_percent = inputs.monthly_retainer > 0
    ? (gross_margin / inputs.monthly_retainer) * 100
    : 0

  // 3. Contract totalen
  const projected_contract_value =
    inputs.monthly_retainer * inputs.contract_duration + inputs.setup_fee
  const total_projected_profit = gross_margin * inputs.contract_duration

  // 4. Risico regels
  const flags: string[] = []
  let riskScore = 0

  if (margin_percent < 0) {
    flags.push('❌ VERLIESLATEND: interne kosten overschrijden retainer')
    riskScore += 40
  } else if (margin_percent < 20) {
    flags.push('⚠️ Gevaarlijk lage marge (<20%) — nauwelijks buffer')
    riskScore += 25
  } else if (margin_percent < 30) {
    flags.push('⚠️ Lage marge (<30%) — scope uitbreiding maakt dit snel verlieslatend')
    riskScore += 10
  }

  const customCount = inputs.deliverables.custom.length
  if (customCount > 3) {
    flags.push(`⚠️ ${customCount} custom deliverables — hoog scope creep risico`)
    riskScore += 15
  } else if (customCount > 1) {
    flags.push(`⚠️ ${customCount} custom deliverables — zorg dat dit gedocumenteerd is`)
    riskScore += 5
  }

  const totalDeliverables =
    inputs.deliverables.paidAds.length + inputs.deliverables.seo.length +
    inputs.deliverables.creative.length + inputs.deliverables.reporting.length +
    inputs.deliverables.strategy.length
  if (totalDeliverables > 12) {
    flags.push(`⚠️ ${totalDeliverables} deliverables — veel voor dit team`)
    riskScore += 10
  }

  if (inputs.kpi_promises.length > 0 && inputs.exclusions.length === 0) {
    flags.push('⚠️ KPI beloften zonder uitsluitingen — risico bij niet-halen')
    riskScore += 15
  }
  if (inputs.kpi_promises.length > 3) {
    flags.push(`⚠️ ${inputs.kpi_promises.length} KPI beloften — overbelofte risico`)
    riskScore += 10
  }
  if (inputs.verbal_promises.length > 2) {
    flags.push(`⚠️ ${inputs.verbal_promises.length} verbale beloften — niet gedocumenteerd`)
    riskScore += 10
  }
  if (inputs.timeline_promises.length > 0) {
    const totalHours = inputs.team_roles.reduce((sum, r) => sum + r.monthlyHours, 0)
    if (totalHours < 40) {
      flags.push('⚠️ Timeline beloften met <40u/maand team — haalbaarheid twijfelachtig')
      riskScore += 10
    }
  }

  // 5. Risk level
  let scope_risk_level: RiskLevel
  if (riskScore >= 40) scope_risk_level = 'HIGH'
  else if (riskScore >= 20) scope_risk_level = 'MEDIUM'
  else scope_risk_level = 'LOW'

  // 6. Margin score 0-100
  const base = Math.max(0, Math.min(100, margin_percent >= 60 ? 100 : (margin_percent / 60) * 100))
  const margin_score = Math.max(0, Math.round(base) - Math.round(riskScore / 2))

  return {
    total_monthly_cost,
    gross_margin,
    margin_percent,
    projected_contract_value,
    total_projected_profit,
    margin_score,
    scope_risk_level,
    flags,
  }
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
