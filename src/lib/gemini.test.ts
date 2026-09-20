import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Deal } from '@/types/deal'

const generateContentMock = vi.fn()

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(function () {
    return { models: { generateContent: generateContentMock } }
  }),
}))

process.env.GEMINI_API_KEY = 'test-key'

function baseDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: '1', created_at: '', updated_at: '', agency_id: 'a1', status: 'DRAFT',
    client_name: 'Noord Bakkerij BV', industry: 'Retail',
    contract_duration: 6, monthly_retainer: 5000, setup_fee: 0,
    ad_spend: 3000, ad_spend_through_agency: true,
    team_roles: [], deliverables: { paidAds: [], seo: [], creative: [], reporting: [], strategy: [], custom: [] },
    kpi_promises: [], timeline_promises: [], verbal_promises: [], exclusions: [],
    total_monthly_cost: 4000, gross_margin: 1000, margin_percent: 20,
    projected_contract_value: 30000, total_projected_profit: 6000,
    margin_score: 40, scope_risk_level: 'MEDIUM',
    ai_risk_summary: null, ai_scope_lock_doc: null, ai_handover_brief: null, ai_kickoff_plan: null,
    scope_share_token: null, handover_share_token: null,
    ...overrides,
  }
}

describe('stripChatArtifacts', () => {
  it('removes a leaked chat preamble before the document content', async () => {
    const { stripChatArtifacts } = await import('./gemini')
    const dirty = 'Oké, hier is het gevraagde scope lock document:\n\n# Scope Lock\nInhoud hier.'
    expect(stripChatArtifacts(dirty)).toBe('# Scope Lock\nInhoud hier.')
  })

  it('removes a leaked closing remark after the document content', async () => {
    const { stripChatArtifacts } = await import('./gemini')
    const dirty = '# Kickoff Plan\nWeek 1: onboarding.\n\nIk hoop dat dit helpt!'
    expect(stripChatArtifacts(dirty)).toBe('# Kickoff Plan\nWeek 1: onboarding.')
  })

  it('removes a preamble that starts directly with "Hier is" (no leading interjection)', async () => {
    const { stripChatArtifacts } = await import('./gemini')
    const dirty = 'Hier is het scope lock document en de kritische beoordeling, conform je specificaties.\n\n---\n\n**Duiding van de Scope** - Velten Interieur BV\nInhoud.'
    expect(stripChatArtifacts(dirty)).toBe('**Duiding van de Scope** - Velten Interieur BV\nInhoud.')
  })

  it('leaves clean document content untouched', async () => {
    const { stripChatArtifacts } = await import('./gemini')
    const clean = '# Scope Lock\nWat is inbegrepen: SEO, paid ads.'
    expect(stripChatArtifacts(clean)).toBe(clean)
  })
})

describe('generateDealDocuments - prompt context', () => {
  beforeEach(() => {
    generateContentMock.mockReset()
    generateContentMock.mockResolvedValue({ text: 'gegenereerde inhoud' })
  })

  it('tells the model ad spend runs through the agency when the checkbox is on', async () => {
    const { generateDealDocuments } = await import('./gemini')
    await generateDealDocuments(baseDeal({ ad_spend_through_agency: true }), [], 'nl', 'Test Bureau')
    const contents: string = generateContentMock.mock.calls[0][0].contents
    expect(contents).toContain('loopt via het bureau')
    expect(contents).not.toContain('betaalt het platform rechtstreeks')
  })

  it('tells the model the client pays ad spend directly when the checkbox is off', async () => {
    const { generateDealDocuments } = await import('./gemini')
    await generateDealDocuments(baseDeal({ ad_spend_through_agency: false }), [], 'nl', 'Test Bureau')
    const contents: string = generateContentMock.mock.calls[0][0].contents
    expect(contents).toContain('betaalt het platform rechtstreeks')
    expect(contents).not.toContain('loopt via het bureau')
  })

  it('passes the real agency name and current date instead of leaving it to guess a placeholder', async () => {
    const { generateDealDocuments } = await import('./gemini')
    await generateDealDocuments(baseDeal(), [], 'nl', 'Test Bureau')
    const contents: string = generateContentMock.mock.calls[0][0].contents
    expect(contents).toContain('BUREAU: Test Bureau')
    expect(contents).toContain('HUIDIGE DATUM: ' + new Date().toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }))
    expect(contents).toMatch(/gebruik nooit placeholders/i)
  })
})
