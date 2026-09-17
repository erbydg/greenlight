'use client'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { useLocale } from '@/lib/i18n/LocaleProvider'

interface TeamMember {
  id: string
  name: string
  role: string
  monthly_cost: number
}

function CostBadge({ cost, d }: { cost: number; d: ReturnType<typeof useLocale>['d'] }) {
  const label = cost >= 5500 ? d.settings.senioritySenior : cost >= 3500 ? d.settings.seniorityMedior : d.settings.seniorityJunior
  const cls = cost >= 5500 ? 'gl-badge-low' : cost >= 3500 ? 'gl-badge-medium' : 'gl-badge-high'
  return <span className={`gl-badge ${cls}`}><span className="gl-badge-dot"/>{label}</span>
}

export default function SettingsPage() {
  const { d } = useLocale()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', role: '', monthly_cost: '' })

  const [agencyName, setAgencyName] = useState('')
  const [agencyNameInput, setAgencyNameInput] = useState('')
  const [agencyLoading, setAgencyLoading] = useState(true)
  const [agencySaving, setAgencySaving] = useState(false)
  const [agencyError, setAgencyError] = useState<string | null>(null)
  const [agencySaved, setAgencySaved] = useState(false)

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/agency')
      .then(r => r.json())
      .then(data => { setAgencyName(data.name || ''); setAgencyNameInput(data.name || ''); setAgencyLoading(false) })
      .catch(() => setAgencyLoading(false))
  }, [])

  const handleSaveAgencyName = async () => {
    if (!agencyNameInput.trim()) return
    setAgencySaving(true); setAgencyError(null); setAgencySaved(false)
    const res = await fetch('/api/agency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: agencyNameInput.trim() })
    })
    if (res.ok) {
      const data = await res.json()
      setAgencyName(data.name)
      setAgencySaved(true)
    } else {
      setAgencyError(d.settings.saveError)
    }
    setAgencySaving(false)
  }

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
      setError(d.settings.saveError)
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
      <Nav breadcrumbs={[{ label: d.settings.breadcrumbDashboard, href: '/dashboard' }, { label: d.settings.title }]} />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>{d.settings.title}</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.settings.sub}</p>
        </div>

        <div className="gl-card" style={{ marginBottom: 16 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 600 }}>{d.settings.agencyName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.settings.agencyNameNote}</div>
          </div>
          <div style={{ padding: '16px 24px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {agencyLoading ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.common.loading}</div>
            ) : (
              <>
                <input
                  className="gl-input"
                  style={{ flex: 1 }}
                  value={agencyNameInput}
                  onChange={e => { setAgencyNameInput(e.target.value); setAgencySaved(false) }}
                  placeholder={d.settings.agencyNamePlaceholder}
                />
                <button
                  onClick={handleSaveAgencyName}
                  disabled={agencySaving || !agencyNameInput.trim() || agencyNameInput.trim() === agencyName}
                  className="gl-btn gl-btn-primary"
                  style={{ opacity: agencySaving ? 0.7 : 1, flexShrink: 0 }}
                >
                  {agencySaving ? d.settings.savingMember : d.common.save}
                </button>
              </>
            )}
          </div>
          {agencyError && <div style={{ margin: '0 24px 16px', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem', color: 'var(--red)' }}>{agencyError}</div>}
          {agencySaved && !agencyError && <div style={{ margin: '0 24px 16px', fontSize: '0.78rem', color: 'var(--green)' }}>{d.settings.agencyNameSaved}</div>}
        </div>

        <div className="gl-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div>
              <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 600 }}>{d.settings.yourTeam}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {d.settings.teamNote}
              </div>
            </div>
            {members.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{d.settings.totalOverhead}</div>
                <div className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--green)' }}>
                  €{totalCost.toLocaleString('nl-BE')}/mo
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '16px 24px' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.common.loading}</div>
            )}

            {!loading && members.length === 0 && !adding && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>👥</div>
                <div className="font-heading" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6 }}>{d.settings.noTeamTitle}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto 20px' }}>
                  {d.settings.noTeamBody}
                </div>
                <button onClick={() => setAdding(true)} className="gl-btn gl-btn-primary">
                  {d.settings.addFirst}
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
                    <CostBadge cost={m.monthly_cost} d={d} />
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
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', marginBottom: 12 }}>{d.settings.newMember}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{d.settings.name}</div>
                    <input className="gl-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={d.settings.namePlaceholder}/>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{d.settings.role}</div>
                    <select className="gl-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="">{d.settings.selectRole}</option>
                      {d.settings.roles.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{d.settings.totalMonthlyCost}</div>
                  <div className="gl-prefix">
                    <span className="gl-prefix-sym">€</span>
                    <input type="number" className="gl-input" value={form.monthly_cost} onChange={e => setForm({...form, monthly_cost: e.target.value})} placeholder={d.settings.costPlaceholder}/>
                  </div>
                </div>

                <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 6, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    {d.settings.referenceCostsNote}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {d.settings.costHints.map(h => (
                      <div key={h.label} onClick={() => setForm({...form, monthly_cost: String(h.total)})}
                        style={{ background: 'var(--surface)', border: '1px solid var(--amber-border)', borderRadius: 5, padding: '7px 10px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--amber)', marginBottom: 2 }}>{h.label}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{h.net}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>≈ €{h.total.toLocaleString('nl-BE')}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--amber)', marginTop: 6 }}>{d.settings.clickToPrefill}</div>
                </div>

                {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem', color: 'var(--red)', marginBottom: 10 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleAdd} disabled={saving || !form.name || !form.role || !form.monthly_cost} className="gl-btn gl-btn-green" style={{ opacity: saving ? 0.7 : 1 }}>
                    {saving ? d.settings.savingMember : d.settings.saveMember}
                  </button>
                  <button onClick={() => { setAdding(false); setForm({ name:'', role:'', monthly_cost:'' }) }} className="gl-btn gl-btn-ghost">
                    {d.common.cancel}
                  </button>
                </div>
              </div>
            )}

            {!loading && members.length > 0 && !adding && (
              <button onClick={() => setAdding(true)} className="gl-add-btn">
                {d.settings.addMember}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
