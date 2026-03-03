import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { agencyName, userId } = await request.json()
    const supabase = getServiceClient()
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({ name: agencyName })
      .select()
      .single()
    if (agencyError) throw agencyError
    const { error: linkError } = await supabase
      .from('agency_users')
      .insert({ user_id: userId, agency_id: agency.id, role: 'owner' })
    if (linkError) throw linkError
    return NextResponse.json({ agency }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Agency setup failed' }, { status: 500 })
  }
}
