export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateProfitability } from '@/lib/profitability'
import type { DealFormData } from '@/types/deal'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await getServiceClient()
      .from('deals')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // A full deal-form edit (as opposed to a partial update like a status change)
    // carries team_roles + deliverables — recompute profitability from the new inputs.
    let update: Record<string, unknown> = { ...body }
    if (body.team_roles && body.deliverables) {
      const { flags: _flags, ...profitability } = calculateProfitability(body as DealFormData)
      update = { ...update, ...profitability }
    }

    const { data, error } = await getServiceClient()
      .from('deals')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Update mislukt' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await getServiceClient().from('deals').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 })
  }
}
