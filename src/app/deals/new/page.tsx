'use client'
export const runtime = 'edge'

import DealForm from '@/components/DealForm'

export default function NewDealPage() {
  return <DealForm mode="create" />
}
