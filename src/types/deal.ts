export interface TeamRole {
  role: string
  hourlyCost: number
  monthlyHours: number
  mode?: 'quick' | 'team'
  memberId?: string
  memberName?: string
  monthlyCost?: number
  allocationPercent?: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  monthly_cost: number
}

export interface Deliverables {
  paidAds: string[]
  seo: string[]
  creative: string[]
  reporting: string[]
  strategy: string[]
  custom: string[]
}

export type DealStatus = 'DRAFT' | 'APPROVED' | 'REJECTED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Deal {
  id: string
  created_at: string
  updated_at: string
  agency_id: string
  status: DealStatus
  client_name: string
  industry: string
  contract_duration: number
  monthly_retainer: number
  setup_fee: number
  ad_spend: number
  ad_spend_through_agency: boolean
  team_roles: TeamRole[]
  deliverables: Deliverables
  kpi_promises: string[]
  timeline_promises: string[]
  verbal_promises: string[]
  exclusions: string[]
  total_monthly_cost: number | null
  gross_margin: number | null
  margin_percent: number | null
  projected_contract_value: number | null
  total_projected_profit: number | null
  margin_score: number | null
  scope_risk_level: RiskLevel | null
  ai_risk_summary: string | null
  ai_scope_lock_doc: string | null
  ai_handover_brief: string | null
  ai_kickoff_plan: string | null
}

export interface DealFormData {
  client_name: string
  industry: string
  contract_duration: number
  monthly_retainer: number
  setup_fee: number
  ad_spend: number
  ad_spend_through_agency: boolean
  team_roles: TeamRole[]
  deliverables: Deliverables
  kpi_promises: string[]
  timeline_promises: string[]
  verbal_promises: string[]
  exclusions: string[]
}

export interface ProfitabilityResult {
  total_monthly_cost: number
  gross_margin: number
  margin_percent: number
  projected_contract_value: number
  total_projected_profit: number
  margin_score: number
  scope_risk_level: RiskLevel
  flags: string[]
}
