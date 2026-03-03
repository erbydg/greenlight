import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAgencyId } from '@/lib/supabase-server'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await getServiceClient()
      .from('team_members')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Kon team niet ophalen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, role, monthly_cost } = await request.json()
    const { data, error } = await getServiceClient()
      .from('team_members')
      .insert({ agency_id: agencyId, name, role, monthly_cost })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kon teamlid niet toevoegen' }, { status: 500 })
  }
}
