'use client'
export const runtime = 'edge'

import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { Skel } from '@/components/Skeleton'
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
  const [signatureNameInput, setSignatureNameInput] = useState('')
  const [signatureTitleInput, setSignatureTitleInput] = useState('')
  const [savedAgency, setSavedAgency] = useState({ name: '', signature_name: '', signature_title: '' })
  const [agencyLoading, setAgencyLoading] = useState(true)
  const [agencySaving, setAgencySaving] = useState(false)
  const [agencyError, setAgencyError] = useState<string | null>(null)
  const [agencySaved, setAgencySaved] = useState(false)

  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [teamInterested, setTeamInterested] = useState(false)
  const [interestSubmitting, setInterestSubmitting] = useState(false)
  const [interestError, setInterestError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/agency')
      .then(r => r.json())
      .then(data => {
        setAgencyName(data.name || '')
        setAgencyNameInput(data.name || '')
        setSignatureNameInput(data.signature_name || '')
        setSignatureTitleInput(data.signature_title || '')
        setSavedAgency({ name: data.name || '', signature_name: data.signature_name || '', signature_title: data.signature_title || '' })
        setAgencyLoading(false)
      })
      .catch(() => setAgencyLoading(false))
    fetch('/api/plan-interest')
      .then(r => { setHasAccount(r.ok); return r.ok ? r.json() : { plans: [] } })
      .then(data => setTeamInterested((data.plans ?? []).includes('team')))
      .catch(() => setHasAccount(false))
  }, [])

  const handleTeamInterest = async () => {
    setInterestSubmitting(true); setInterestError(null)
    const res = await fetch('/api/plan-interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'team' }),
    })
    if (res.ok) setTeamInterested(true)
    else setInterestError(d.pricing.interestFailed)
    setInterestSubmitting(false)
  }

  const agencyDirty = agencyNameInput.trim() !== savedAgency.name
    || signatureNameInput.trim() !== savedAgency.signature_name
    || signatureTitleInput.trim() !== savedAgency.signature_title

  const handleSaveAgencyName = async () => {
    if (!agencyNameInput.trim()) return
    setAgencySaving(true); setAgencyError(null); setAgencySaved(false)
    const res = await fetch('/api/agency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: agencyNameInput.trim(),
        signature_name: signatureNameInput.trim(),
        signature_title: signatureTitleInput.trim(),
      })
    })
    if (res.ok) {
      const data = await res.json()
      setAgencyName(data.name)
      setSavedAgency({ name: data.name || '', signature_name: data.signature_name || '', signature_title: data.signature_title || '' })
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

  const pricingTiers = [
    { key: 'basic', name: d.pricing.basicName, price: '€29', desc: d.pricing.basicDesc },
    { key: 'team', name: d.pricing.teamName, price: '€79', desc: d.pricing.teamDesc },
    { key: 'custom', name: d.pricing.customName, price: null, desc: d.pricing.customDesc },
  ]

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
          <div style={{ padding: '16px 24px' }}>
            {agencyLoading ? (
              <>
                <Skel width="100%" height={38} radius={8} style={{ marginBottom: 14 }}/>
                <div className="gl-settings-pair" style={{ marginBottom: 20 }}>
                  <Skel width="100%" height={38} radius={8}/>
                  <Skel width="100%" height={38} radius={8}/>
                </div>
                <Skel width={90} height={34} radius={6}/>
              </>
            ) : (
              <>
                <input
                  className="gl-input"
                  style={{ marginBottom: 14 }}
                  value={agencyNameInput}
                  onChange={e => { setAgencyNameInput(e.target.value); setAgencySaved(false) }}
                  placeholder={d.settings.agencyNamePlaceholder}
                />

                <div className="gl-settings-pair" style={{ marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{d.settings.signatureName}</div>
                    <input
                      className="gl-input"
                      value={signatureNameInput}
                      onChange={e => { setSignatureNameInput(e.target.value); setAgencySaved(false) }}
                      placeholder={d.settings.signatureNamePlaceholder}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{d.settings.signatureTitle}</div>
                    <input
                      className="gl-input"
                      value={signatureTitleInput}
                      onChange={e => { setSignatureTitleInput(e.target.value); setAgencySaved(false) }}
                      placeholder={d.settings.signatureTitlePlaceholder}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 14 }}>{d.settings.signatureNote}</div>

                <button
                  onClick={handleSaveAgencyName}
                  disabled={agencySaving || !agencyNameInput.trim() || !agencyDirty}
                  className="gl-btn gl-btn-primary"
                  style={{ opacity: agencySaving ? 0.7 : 1 }}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="gl-settings-member-row" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                    <div>
                      <Skel width={120} height={13} style={{ marginBottom: 6 }}/>
                      <Skel width={80} height={10}/>
                    </div>
                    <Skel width={64} height={18} radius={20}/>
                    <Skel width={50} height={16}/>
                    <Skel width={28} height={28} radius={5}/>
                  </div>
                ))}
              </div>
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
                  <div key={m.id} className="gl-settings-member-row" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.role}</div>
                    </div>
                    <CostBadge cost={m.monthly_cost} d={d} />
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-heading" style={{ fontSize: '0.95rem', fontWeight: 600 }}>€{m.monthly_cost.toLocaleString('nl-BE')}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>/mo</div>
                    </div>
                    <button onClick={() => handleDelete(m.id)} className="gl-icon-btn">×</button>
                  </div>
                ))}
              </div>
            )}

            {adding && (
              <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', marginBottom: 12 }}>{d.settings.newMember}</div>
                <div className="gl-settings-pair" style={{ marginBottom: 10 }}>
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
                  <div className="gl-cost-hints-grid">
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

        <div className="gl-card" id="pricing">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 600 }}>{d.pricing.sectionTitle}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.pricing.sectionSub}</div>
          </div>
          <div style={{ padding: '16px 24px' }}>
            <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)' }}>
              {d.pricing.previewLabel}
            </div>

            <div className="gl-pricing-grid">
              {pricingTiers.map(tier => (
                <div key={tier.key} className="gl-card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column' }}>
                  <div className="font-heading" style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6 }}>{tier.name}</div>
                  <div style={{ marginBottom: 4 }}>
                    {tier.price
                      ? <><span className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 600 }}>{tier.price}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.pricing.perMonth}</span></>
                      : <span className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{d.pricing.contactUs}</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tier.desc}</div>

                  {tier.key === 'team' && hasAccount !== false && (
                    <div style={{ marginTop: 16 }}>
                      <button
                        onClick={handleTeamInterest}
                        disabled={teamInterested || interestSubmitting || hasAccount === null}
                        className="gl-btn gl-btn-ghost"
                        style={{
                          width: '100%', justifyContent: 'center', fontSize: '0.76rem', padding: '8px 12px',
                          ...(teamInterested ? { background: 'var(--green-bg)', borderColor: 'var(--green-border)', color: 'var(--green)' } : {}),
                        }}
                      >
                        {teamInterested ? d.pricing.interestConfirmed : interestSubmitting ? d.pricing.interestSubmitting : d.pricing.interestCta}
                      </button>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: 6 }}>{d.pricing.interestNote}</div>
                      {interestError && <div style={{ fontSize: '0.7rem', color: 'var(--red)', marginTop: 6 }}>{interestError}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
