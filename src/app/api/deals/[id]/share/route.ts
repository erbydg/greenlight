export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SHAREABLE_TABS, type ShareableDoc } from '@/lib/documents'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const TOKEN_COLUMN: Record<ShareableDoc, 'scope_share_token' | 'handover_share_token'> = {
  scope: 'scope_share_token',
  handover: 'handover_share_token',
}

function resolveColumn(doc: unknown) {
  return SHAREABLE_TABS.includes(doc as ShareableDoc) ? TOKEN_COLUMN[doc as ShareableDoc] : null
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { doc } = await request.json()
    const column = resolveColumn(doc)
    if (!column) return NextResponse.json({ error: 'Ongeldig document' }, { status: 400 })

    const client = getServiceClient()
    const { data: existing, error: fetchError } = await client.from('deals').select(column).eq('id', id).single()
    if (fetchError || !existing) return NextResponse.json({ error: 'Deal niet gevonden' }, { status: 404 })

    const existingToken = (existing as Record<string, string | null>)[column]
    if (existingToken) return NextResponse.json({ token: existingToken })

    const token = crypto.randomUUID().replace(/-/g, '')
    const { error: updateError } = await client.from('deals').update({ [column]: token }).eq('id', id)
    if (updateError) throw updateError

    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ error: 'Kon link niet aanmaken' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { doc } = await request.json()
    const column = resolveColumn(doc)
    if (!column) return NextResponse.json({ error: 'Ongeldig document' }, { status: 400 })

    const { error } = await getServiceClient().from('deals').update({ [column]: null }).eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Kon link niet intrekken' }, { status: 500 })
  }
}
