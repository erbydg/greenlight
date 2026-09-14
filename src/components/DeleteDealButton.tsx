'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteDealButton({ dealId, clientName }: { dealId: string; clientName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Delete the deal for "${clientName}"? This cannot be undone.`)) return
    setLoading(true)
    await fetch(`/api/deals/${dealId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Delete permanently"
      className="gl-btn gl-btn-ghost"
      style={{ fontSize: '0.72rem', padding: '5px 10px', color: 'var(--red)', opacity: loading ? 0.6 : 1 }}
    >
      {loading ? '…' : '🗑 Delete'}
    </button>
  )
}
