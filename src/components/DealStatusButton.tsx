'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DealStatus } from '@/types/deal'

export default function DealStatusButton({
  dealId, targetStatus, label, title,
}: { dealId: string; targetStatus: DealStatus; label: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    await fetch(`/api/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={title}
      className="gl-btn gl-btn-ghost gl-btn-compact"
      style={{ opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap' }}
    >
      {loading ? '…' : label}
    </button>
  )
}
