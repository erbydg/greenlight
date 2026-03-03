import type { DealFormData, ProfitabilityResult, RiskLevel } from '@/types/deal'

export function calculateProfitability(inputs: DealFormData): ProfitabilityResult {
  const team_cost = inputs.team_roles.reduce((sum, role) => {
    if (role.mode === 'team') {
      return sum + (role.monthlyCost || 0) * (role.allocationPercent || 0) / 100
    }
    return sum + role.hourlyCost * role.monthlyHours
  }, 0)

  // Ad spend alleen aftrekken als het door de agency loopt
  const ad_cost = inputs.ad_spend_through_agency ? (inputs.ad_spend || 0) : 0
  const total_monthly_cost = team_cost + ad_cost

  const gross_margin = inputs.monthly_retainer - total_monthly_cost
  const margin_percent = inputs.monthly_retainer > 0
    ? (gross_margin / inputs.monthly_retainer) * 100
    : 0

  const projected_contract_value =
    inputs.monthly_retainer * inputs.contract_duration + inputs.setup_fee
  const total_projected_profit = gross_margin * inputs.contract_duration

  const setup_fee_monthly = inputs.contract_duration > 0
    ? (inputs.setup_fee || 0) / inputs.contract_duration
    : 0
  const effective_monthly_margin = gross_margin + setup_fee_monthly
  const effective_margin_percent = inputs.monthly_retainer > 0
    ? (effective_monthly_margin / (inputs.monthly_retainer + setup_fee_monthly)) * 100
    : margin_percent

  const flags: string[] = []
  let riskScore = 0

  if (margin_percent < 0 && effective_margin_percent < 0) {
    flags.push('❌ LOSS-MAKING: internal costs exceed retainer + setup fee')
    riskScore += 40
  } else if (margin_percent < 0 && effective_margin_percent >= 0) {
    flags.push('⚠️ Monthly retainer is loss-making — profitable only due to setup fee')
    riskScore += 20
  } else if (effective_margin_percent < 20) {
    flags.push('⚠️ Dangerously low margin (<20%) — barely any buffer')
    riskScore += 25
  } else if (effective_margin_percent < 30) {
    flags.push('⚠️ Low margin (<30%) — any scope creep will hurt')
    riskScore += 10
  }

  if (inputs.ad_spend_through_agency && (inputs.ad_spend || 0) > inputs.monthly_retainer) {
    flags.push(`⚠️ Ad spend (€${inputs.ad_spend}/mo) exceeds retainer — high financial exposure`)
    riskScore += 15
  }

  const customCount = inputs.deliverables.custom.length
  if (customCount > 3) {
    flags.push(`⚠️ ${customCount} custom deliverables — high scope creep risk`)
    riskScore += 15
  } else if (customCount > 1) {
    flags.push(`⚠️ ${customCount} custom deliverables — make sure these are documented`)
    riskScore += 5
  }

  const totalDeliverables =
    inputs.deliverables.paidAds.length + inputs.deliverables.seo.length +
    inputs.deliverables.creative.length + inputs.deliverables.reporting.length +
    inputs.deliverables.strategy.length
  if (totalDeliverables > 12) {
    flags.push(`⚠️ ${totalDeliverables} deliverables — a lot for this team`)
    riskScore += 10
  }

  if (inputs.kpi_promises.length > 0 && inputs.exclusions.length === 0) {
    flags.push('⚠️ KPI promises without exclusions — risk if targets are missed')
    riskScore += 15
  }
  if (inputs.kpi_promises.length > 3) {
    flags.push(`⚠️ ${inputs.kpi_promises.length} KPI promises — overpromising risk`)
    riskScore += 10
  }
  if (inputs.verbal_promises.length > 2) {
    flags.push(`⚠️ ${inputs.verbal_promises.length} verbal promises — not documented`)
    riskScore += 10
  }
  if (inputs.timeline_promises.length > 0) {
    const totalHours = inputs.team_roles.reduce((sum, r) => {
      if (r.mode === 'team') return sum + (r.allocationPercent || 0)
      return sum + r.monthlyHours
    }, 0)
    if (totalHours < 40) {
      flags.push('⚠️ Timeline promises with low team capacity — feasibility doubtful')
      riskScore += 10
    }
  }

  let scope_risk_level: RiskLevel
  if (riskScore >= 40) scope_risk_level = 'HIGH'
  else if (riskScore >= 20) scope_risk_level = 'MEDIUM'
  else scope_risk_level = 'LOW'

  const base = Math.max(0, Math.min(100, effective_margin_percent >= 60 ? 100 : (effective_margin_percent / 60) * 100))
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
