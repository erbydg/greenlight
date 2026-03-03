'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'

interface TeamMember {
  id: string
  name: string
  role: string
  monthly_cost: number
}

const ROLES = ['Strategist','Media Buyer','Designer','SEO Specialist','Copywriter','Account Manager','Developer','Project Manager','Freelancer','Other']

const COST_HINTS = [
  { label: 'Junior (employee)', net: '€2.000 net', total: 3500 },
  { label: 'Medior (employee)', net: '€2.500 net', total: 4700 },
  { label: 'Senior (employee)', net: '€3.500 net', total: 6200 },
]

function CostBadge({ cost }: { cost: number }) {
  const label = cost >= 5500 ? 'Senior' : cost >= 3500 ? 'Medior' : 'Junior'
  const cls = cost >= 5500 ? 'gl-badge-low' : cost >= 3500 ? 'gl-badge-medium' : 'gl-badge-high'
  return <span className={`gl-badge ${cls}`}><span className="gl-badge-dot"/>{label}</span>
}

export default function SettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', role: '', monthly_cost: '' })

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!form.name || !form.role || !form.monthly_cost) return
    setSaving(true); setError(null)
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, role: form.role, monthly_cost: Number(form.monthly_cost) })
    })
    if (res.ok) {
      const member = await res.json()
      setMembers([...members, member])
      setForm({ name: '', role: '', monthly_cost: '' })
      setAdding(false)
    } else {
      setError('Could not add team member.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' })
    if (res.ok) setMembers(members.filter(m => m.id !== id))
  }

  const totalCost = members.reduce((s, m) => s + m.monthly_cost, 0)

  return (
    <>
      <Nav breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>Settings</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage your team and agency settings.</p>
        </div>

        <div className="gl-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div>
              <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 600 }}>Your team</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Fixed monthly cost per person — including gross salary, employer taxes and benefits
              </div>
            </div>
            {members.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Total overhead</div>
                <div className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--green)' }}>
                  €{totalCost.toLocaleString('nl-BE')}/mo
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '16px 24px' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading…</div>
            )}

            {!loading && members.length === 0 && !adding && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>👥</div>
                <div className="font-heading" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6 }}>No team members yet</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto 20px' }}>
                  Add your team members with their full monthly cost. You'll use this when creating deals.
                </div>
                <button onClick={() => setAdding(true)} className="gl-btn gl-btn-primary">
                  + Add first team member
                </button>
              </div>
            )}

            {!loading && members.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {members.map(m => (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 14, alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.role}</div>
                    </div>
                    <CostBadge cost={m.monthly_cost} />
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-heading" style={{ fontSize: '0.95rem', fontWeight: 600 }}>€{m.monthly_cost.toLocaleString('nl-BE')}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>/mo</div>
                    </div>
                    <button onClick={() => handleDelete(m.id)} style={{ width: 28, height: 28, borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-light)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 14 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            {adding && (
              <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', marginBottom: 12 }}>New team member</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Name</div>
                    <input className="gl-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="First Last"/>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Role</div>
                    <select className="gl-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="">Select role…</option>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total monthly cost to the agency</div>
                  <div className="gl-prefix">
                    <span className="gl-prefix-sym">€</span>
                    <input type="number" className="gl-input" value={form.monthly_cost} onChange={e => setForm({...form, monthly_cost: e.target.value})} placeholder="4700"/>
                  </div>
                </div>

                <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 6, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    💡 Reference costs — gross + employer taxes (~27%) + benefits
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {COST_HINTS.map(h => (
                      <div key={h.label} onClick={() => setForm({...form, monthly_cost: String(h.total)})}
                        style={{ background: 'var(--surface)', border: '1px solid var(--amber-border)', borderRadius: 5, padding: '7px 10px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--amber)', marginBottom: 2 }}>{h.label}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{h.net}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>≈ €{h.total.toLocaleString('nl-BE')}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--amber)', marginTop: 6 }}>Click a reference to prefill. For freelancers: use their monthly rate.</div>
                </div>

                {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem', color: 'var(--red)', marginBottom: 10 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleAdd} disabled={saving || !form.name || !form.role || !form.monthly_cost} className="gl-btn gl-btn-green" style={{ opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : 'Save team member'}
                  </button>
                  <button onClick={() => { setAdding(false); setForm({ name:'', role:'', monthly_cost:'' }) }} className="gl-btn gl-btn-ghost">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!loading && members.length > 0 && !adding && (
              <button onClick={() => setAdding(true)} className="gl-add-btn">
                + Add team member
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
