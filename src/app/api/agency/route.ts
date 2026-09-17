export const runtime = 'edge'
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
      .from('agencies')
      .select('id, name')
      .eq('id', agencyId)
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Kon bureau niet ophalen' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name } = await request.json()
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
    }
    const { data, error } = await getServiceClient()
      .from('agencies')
      .update({ name: String(name).trim() })
      .eq('id', agencyId)
      .select('id, name')
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Kon bureaunaam niet opslaan' }, { status: 500 })
  }
}
