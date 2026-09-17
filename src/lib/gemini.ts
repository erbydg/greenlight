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

// Sommige modellen leveren toch een inleidende/afsluitende zin af ondanks de
// instructie om die weg te laten. Deze regels worden als vangnet verwijderd
// voordat het document opgeslagen/getoond wordt.
const LEAKED_PREAMBLE = /^((oké|ok|okay|zeker|natuurlijk|absoluut|prima|goed)[,!.]?\s+)?(hier is|hierbij|hieronder|hier komt|hier heb je|hier volgt)[^\n]*\n+(-{3,}\s*\n+)?/i
const LEAKED_TRAILER = /\n+(ik hoop dat dit (helpt|nuttig is)|laat (het |gerust )?weten (als|indien)[^\n]*|veel succes[^\n]*)[.!]?\s*$/i

export function stripChatArtifacts(text: string): string {
  return text.replace(LEAKED_PREAMBLE, '').replace(LEAKED_TRAILER, '').trim()
}

export async function generateDealDocuments(deal: Deal, flags: string[], locale: Locale = 'nl', agencyName?: string | null): Promise<GeneratedDocuments> {
  const languageInstruction = locale === 'nl'
    ? 'Schrijf je volledige antwoord in het Nederlands.'
    : 'Write your entire response in English.'
  const noPreambleInstruction = locale === 'nl'
    ? 'Geef ALLEEN de inhoud van het document terug. Begin direct met de eerste regel van het document zelf — geen inleidende zin, bevestiging of meta-commentaar (bv. geen "Oké, hier is...", "Absoluut!", "Hierbij het document..."). Voeg ook geen afsluitende zin toe zoals "Ik hoop dat dit helpt". Vul elk gegeven feit (datum, bureaunaam, klantnaam, bedragen) letterlijk in — gebruik nooit placeholders zoals [Datum] of [Bureau Naam].'
    : 'Return ONLY the content of the document itself. Start directly with the first line of the document — no introductory sentence, confirmation or meta-commentary (e.g. no "Sure, here is...", "Absolutely!", "Here is the document..."). Do not add a closing sentence like "I hope this helps" either. Fill in every given fact (date, agency name, client name, amounts) literally — never use placeholders like [Date] or [Agency Name].'
  const allDeliverables = [
    ...deal.deliverables.paidAds,
    ...deal.deliverables.seo,
    ...deal.deliverables.creative,
    ...deal.deliverables.reporting,
    ...deal.deliverables.strategy,
    ...deal.deliverables.custom,
  ]

  const today = new Date().toLocaleDateString(locale === 'nl' ? 'nl-BE' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const adSpendLine = !deal.ad_spend
    ? 'ADVERTENTIEBUDGET: geen'
    : deal.ad_spend_through_agency
      ? `ADVERTENTIEBUDGET: €${deal.ad_spend}/maand — loopt via het bureau (het bureau factureert/beheert dit budget, het telt mee als kost in de marge)`
      : `ADVERTENTIEBUDGET: €${deal.ad_spend}/maand — de klant betaalt het platform rechtstreeks (het bureau beheert dit budget niet en het telt niet mee als kost)`

  const ctx = [
    'HUIDIGE DATUM: ' + today,
    'BUREAU: ' + (agencyName || 'Onze agency'),
    'CLIENT: ' + deal.client_name + ' (' + deal.industry + ')',
    'CONTRACT: ' + deal.contract_duration + ' maanden @ ' + deal.monthly_retainer + '/m',
    adSpendLine,
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
      contents: languageInstruction + ' ' + noPreambleInstruction + ' ' + prompt + '\n\n' + ctx,
    })
    return stripChatArtifacts(response.text ?? '')
  }

  const [riskSummary, scopeLockDoc, handoverBrief, kickoffPlan] = await Promise.all([
    ask('Senior agency ops consultant. Write internal deal risk analysis max 300 words. Cover: 1) Key risks 2) Day 1 priorities for delivery manager 3) Recommendations.'),
    ask('Senior agency account manager. Write scope lock document max 400 words. Include: 1) What IS included 2) What NOT included 3) Change request process 4) KPI disclaimer.'),
    ask('Agency sales manager. Write handover brief max 350 words. Include: 1) Deal summary 2) Critical points 3) Client expectations 4) First 30 days.'),
    ask('Agency project manager. Write 30-day kickoff plan max 400 words. Week 1: onboarding, Week 2: execution, Week 3: optimization, Week 4: reporting.'),
  ])

  return { riskSummary, scopeLockDoc, handoverBrief, kickoffPlan }
}
