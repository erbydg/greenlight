// src/app/api/deals/[id]/route.ts
export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDealById, updateDeal } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deal = await getDealById(id)
    if (!deal) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    return NextResponse.json(deal)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const deal = await updateDeal(id, body)
    return NextResponse.json(deal)
  } catch {
    return NextResponse.json({ error: 'Update mislukt' }, { status: 500 })
  }
}
