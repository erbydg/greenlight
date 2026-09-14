'use client'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Nav from '@/components/Nav'
import DealForm from '@/components/DealForm'
import type { Deal, DealFormData } from '@/types/deal'

function toFormData(deal: Deal): DealFormData {
  return {
    client_name: deal.client_name,
    industry: deal.industry,
    contract_duration: deal.contract_duration,
    monthly_retainer: deal.monthly_retainer,
    setup_fee: deal.setup_fee,
    ad_spend: deal.ad_spend || 0,
    ad_spend_through_agency: deal.ad_spend_through_agency || false,
    team_roles: deal.team_roles,
    deliverables: deal.deliverables,
    kpi_promises: deal.kpi_promises,
    timeline_promises: deal.timeline_promises,
    verbal_promises: deal.verbal_promises,
    exclusions: deal.exclusions,
  }
}

export default function EditDealPage() {
  const params = useParams()
  const id = params.id as string
  const [initialForm, setInitialForm] = useState<DealFormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setInitialForm(toFormData(d))
      })
      .catch(() => setError('Deal not found'))
  }, [id])

  if (error) return (
    <>
      <Nav breadcrumbs={[{ label:'Dashboard', href:'/dashboard' }, { label:'Not found' }]}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--red)', fontSize:'0.85rem' }}>{error}</div>
    </>
  )

  if (!initialForm) return (
    <>
      <Nav breadcrumbs={[{ label:'Dashboard', href:'/dashboard' }, { label:'Loading…' }]}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)', fontSize:'0.85rem' }}>Loading deal…</div>
    </>
  )

  return <DealForm mode="edit" dealId={id} initialForm={initialForm} />
}
