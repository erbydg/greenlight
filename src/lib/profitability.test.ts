import { describe, it, expect } from 'vitest'
import { calculateProfitability } from './profitability'
import type { DealFormData } from '@/types/deal'

// This is the exact function DealForm.tsx's live sidebar preview calls.
// Regression test for: toggling "ad spend loopt via het bureau" had no
// effect on the live preview because DealForm used to reimplement its own
// (incomplete) copy of this calculation instead of calling it.
function baseDeal(adSpendThroughAgency: boolean): DealFormData {
  return {
    client_name: 'Acme',
    industry: 'E-commerce',
    contract_duration: 6,
    monthly_retainer: 5000,
    setup_fee: 0,
    ad_spend: 3000,
    ad_spend_through_agency: adSpendThroughAgency,
    team_roles: [
      { role: 'Strategist', hourlyCost: 50, monthlyHours: 20, mode: 'quick' },
    ],
    deliverables: { paidAds: [], seo: [], creative: [], reporting: [], strategy: [], custom: [] },
    kpi_promises: [],
    timeline_promises: [],
    verbal_promises: [],
    exclusions: [],
  }
}

describe('calculateProfitability - ad spend through agency toggle', () => {
  it('counts ad spend as a cost when it runs through the agency', () => {
    const result = calculateProfitability(baseDeal(true))
    expect(result.total_monthly_cost).toBe(1000 + 3000)
  })

  it('excludes ad spend from cost when the client pays directly', () => {
    const result = calculateProfitability(baseDeal(false))
    expect(result.total_monthly_cost).toBe(1000)
  })

  it('changes internal cost, gross margin and health score when the checkbox is toggled', () => {
    const through = calculateProfitability(baseDeal(true))
    const direct = calculateProfitability(baseDeal(false))

    expect(through.total_monthly_cost).not.toBe(direct.total_monthly_cost)
    expect(through.gross_margin).not.toBe(direct.gross_margin)
    expect(through.margin_percent).not.toBe(direct.margin_percent)
    expect(through.margin_score).not.toBe(direct.margin_score)

    // Ad spend through the agency should always look worse (lower margin, lower score)
    expect(through.gross_margin).toBeLessThan(direct.gross_margin)
    expect(through.margin_score).toBeLessThan(direct.margin_score)
  })
})
