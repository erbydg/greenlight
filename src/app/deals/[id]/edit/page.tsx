'use client'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Nav from '@/components/Nav'
import DealForm from '@/components/DealForm'
import { useLocale } from '@/lib/i18n/LocaleProvider'
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
  const { d } = useLocale()
  const [initialForm, setInitialForm] = useState<DealFormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then(r => r.json())
      .then(dl => {
        if (dl.error) throw new Error(dl.error)
        setInitialForm(toFormData(dl))
      })
      .catch(() => setError(d.dealForm.editNotFound))
  }, [id, d.dealForm.editNotFound])

  if (error) return (
    <>
      <Nav breadcrumbs={[{ label:d.dealForm.breadcrumbDashboard, href:'/dashboard' }, { label:d.dealForm.editNotFoundCrumb }]}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--red)', fontSize:'0.85rem' }}>{error}</div>
    </>
  )

  if (!initialForm) return (
    <>
      <Nav breadcrumbs={[{ label:d.dealForm.breadcrumbDashboard, href:'/dashboard' }, { label:d.dealForm.editLoadingCrumb }]}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)', fontSize:'0.85rem' }}>{d.dealForm.editLoading}</div>
    </>
  )

  return <DealForm mode="edit" dealId={id} initialForm={initialForm} />
}
