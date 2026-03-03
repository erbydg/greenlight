import { createClient } from '@supabase/supabase-js'
import type { Deal } from '@/types/deal'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getAllDeals(agencyId: string): Promise<Deal[]> {
  const { data, error } = await getServiceClient()
    .from('deals')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data as Deal[]
}

export async function getDealById(id: string): Promise<Deal | null> {
  const { data, error } = await getServiceClient()
    .from('deals')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Deal
}

export async function createDeal(deal: Partial<Deal>): Promise<Deal> {
  const { data, error } = await getServiceClient()
    .from('deals')
    .insert(deal)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Deal
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
  const { data, error } = await getServiceClient()
    .from('deals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Deal
}
