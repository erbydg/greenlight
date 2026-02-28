// src/app/api/deals/[id]/route.ts
export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDealById, updateDeal } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const deal = await getDealById(params.id)
    if (!deal) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    return NextResponse.json(deal)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const deal = await updateDeal(params.id, body)
    return NextResponse.json(deal)
  } catch {
    return NextResponse.json({ error: 'Update mislukt' }, { status: 500 })
  }
}
