export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withSignature } from '@/lib/documents'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const DOC_MAP = {
  scope: { field: 'ai_scope_lock_doc', label: 'Scope Lock' },
  handover: { field: 'ai_handover_brief', label: 'Handover Brief' },
} as const

const TOKEN_RE = /^[a-f0-9]{32}$/

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    if (!TOKEN_RE.test(token)) return NextResponse.json({ error: 'Ongeldige link' }, { status: 404 })

    const client = getServiceClient()
    const { data: deal, error } = await client
      .from('deals')
      .select('client_name, agency_id, ai_scope_lock_doc, ai_handover_brief, scope_share_token, handover_share_token')
      .or(`scope_share_token.eq.${token},handover_share_token.eq.${token}`)
      .maybeSingle()

    if (error || !deal) return NextResponse.json({ error: 'Link ongeldig of ingetrokken' }, { status: 404 })

    const docType = deal.scope_share_token === token ? 'scope' : 'handover'
    const { field, label } = DOC_MAP[docType]
    const content = (deal as Record<string, string | null>)[field]
    if (!content) return NextResponse.json({ error: 'Document niet gevonden' }, { status: 404 })

    const { data: agency } = await client
      .from('agencies')
      .select('name, signature_name, signature_title')
      .eq('id', deal.agency_id)
      .single()

    return NextResponse.json({
      docType,
      label,
      clientName: deal.client_name,
      agencyName: agency?.name ?? null,
      content: withSignature(content, docType, agency ?? null),
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
