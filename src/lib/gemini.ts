import { GoogleGenAI } from '@google/genai'
import type { Deal } from '@/types/deal'
import type { Locale } from '@/lib/i18n/translations'

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export interface GeneratedDocuments {
  riskSummary: string
  scopeLockDoc: string
  handoverBrief: string
  kickoffPlan: string
}

export async function generateDealDocuments(deal: Deal, flags: string[], locale: Locale = 'nl'): Promise<GeneratedDocuments> {
  const languageInstruction = locale === 'nl'
    ? 'Schrijf je volledige antwoord in het Nederlands.'
    : 'Write your entire response in English.'
  const allDeliverables = [
    ...deal.deliverables.paidAds,
    ...deal.deliverables.seo,
    ...deal.deliverables.creative,
    ...deal.deliverables.reporting,
    ...deal.deliverables.strategy,
    ...deal.deliverables.custom,
  ]

  const ctx = [
    'CLIENT: ' + deal.client_name + ' (' + deal.industry + ')',
    'CONTRACT: ' + deal.contract_duration + ' maanden @ ' + deal.monthly_retainer + '/m',
    'MARGE: ' + (deal.margin_percent?.toFixed(1) ?? '?') + '%',
    'SCOPE RISICO: ' + deal.scope_risk_level,
    'MARGIN SCORE: ' + deal.margin_score + '/100',
    'FLAGS: ' + flags.join(', '),
    'DELIVERABLES: ' + (allDeliverables.join(', ') || 'geen'),
    'KPI BELOFTES AAN KLANT: ' + (deal.kpi_promises.join(' | ') || 'geen'),
    'TIMELINE BELOFTES AAN KLANT: ' + (deal.timeline_promises.join(' | ') || 'geen'),
    'MONDELINGE BELOFTES AAN KLANT: ' + (deal.verbal_promises.join(' | ') || 'geen'),
    'EXCLUSIONS (wat NIET inbegrepen is): ' + (deal.exclusions.join(' | ') || 'geen'),
    '',
    'Beoordeel kritisch of de KPI/timeline/mondelinge beloftes hierboven realistisch zijn gezien de scope, marge en teamcapaciteit. Benoem expliciet elke belofte die overdreven, ongeveer onmeetbaar of onhaalbaar lijkt (bv. onrealistische ROAS, groei- of tijdsclaims).',
  ].join('\n')

  const ask = async (prompt: string) => {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: languageInstruction + ' ' + prompt + '\n\n' + ctx,
    })
    return response.text ?? ''
  }

  const [riskSummary, scopeLockDoc, handoverBrief, kickoffPlan] = await Promise.all([
    ask('Senior agency ops consultant. Write internal deal risk analysis max 300 words. Cover: 1) Key risks 2) Day 1 priorities for delivery manager 3) Recommendations.'),
    ask('Senior agency account manager. Write scope lock document max 400 words. Include: 1) What IS included 2) What NOT included 3) Change request process 4) KPI disclaimer.'),
    ask('Agency sales manager. Write handover brief max 350 words. Include: 1) Deal summary 2) Critical points 3) Client expectations 4) First 30 days.'),
    ask('Agency project manager. Write 30-day kickoff plan max 400 words. Week 1: onboarding, Week 2: execution, Week 3: optimization, Week 4: reporting.'),
  ])

  return { riskSummary, scopeLockDoc, handoverBrief, kickoffPlan }
}
