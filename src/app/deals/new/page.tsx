'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import type { DealFormData } from '@/types/deal'

const INDUSTRIES = ['E-commerce','SaaS / Tech','Retail','Horeca & Food','Real Estate','Healthcare','Finance','Education','Fashion','Automotive','Local Business','Other']
const PAID_ADS   = ['Meta Ads campaign setup','Meta Ads monthly management','Google Ads campaign setup','Google Ads monthly management','LinkedIn Ads','TikTok Ads','Retargeting setup','A/B testing','Reporting & analysis']
const SEO_ITEMS  = ['Technical SEO audit','On-page optimisation','Content strategy','Link building','Local SEO','Monthly reporting']
const CREATIVE   = ['Ad creatives (static)','Ad creatives (video)','Social media content','Copywriting','Landing page design','Branding assets']
const REPORTING  = ['Monthly report','Weekly report','Dashboard setup','Quarterly review','GA4 setup']
const STRATEGY   = ['Monthly strategy call','Quarterly business review','Competitor analysis','Audience research','Funnel strategy']

const EMPTY: DealFormData = {
  client_name:'', industry:'', contract_duration:6, monthly_retainer:0, setup_fee:0,
  team_roles:[],
  deliverables:{ paidAds:[], seo:[], creative:[], reporting:[], strategy:[], custom:[] },
  kpi_promises:[], timeline_promises:[], verbal_promises:[], exclusions:[],
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 }}>
      {children}{optional && <span style={{ fontWeight:400, color:'var(--text-light)', marginLeft:4 }}>(optional)</span>}
    </div>
  )
}

function CheckGrid({ label, items, selected, onChange }: { label:string; items:string[]; selected:string[]; onChange:(v:string[])=>void }) {
  const toggle = (item: string) => onChange(selected.includes(item) ? selected.filter(s=>s!==item) : [...selected,item])
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{label}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {items.map(item => (
          <div key={item} className={`gl-check-item ${selected.includes(item)?'checked':''}`} onClick={()=>toggle(item)}>
            <div className="gl-check-box"/>{item}
          </div>
        ))}
      </div>
    </div>
  )
}

function TagInput({ label, placeholder, values, onChange, optional }: { label:string; placeholder:string; values:string[]; onChange:(v:string[])=>void; optional?:boolean }) {
  const [input, setInput] = useState('')
  const add = () => { const t=input.trim(); if(t){ onChange([...values,t]); setInput('') } }
  return (
    <div style={{ marginBottom:14 }}>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      {values.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
          {values.map(v => (
            <span key={v} className="gl-tag">
              {v}<span onClick={()=>onChange(values.filter(x=>x!==v))} style={{ cursor:'pointer', opacity:0.5, fontSize:11, marginLeft:4 }}>x</span>
            </span>
          ))}
        </div>
      )}
      <div style={{ display:'flex', gap:8 }}>
        <input className="gl-input" style={{ flex:1 }} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),add())} placeholder={placeholder}/>
        <button type="button" onClick={add} className="gl-btn gl-btn-primary" style={{ flexShrink:0 }}>Add</button>
      </div>
    </div>
  )
}

function SectionBlock({ n, title, sub, done, isOpen, onToggle, children }: { n:number; title:string; sub:string; done:boolean; isOpen:boolean; onToggle:()=>void; children:React.ReactNode }) {
  return (
    <div className="gl-card" style={{ marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 24px', cursor:'pointer', borderBottom:isOpen?'1px solid var(--border)':'none' }} onClick={onToggle}>
        <div style={{ width:22, height:22, borderRadius:5, background:done?'var(--green)':'var(--ink)', color:'#fff', display:'grid', placeItems:'center', fontSize:'0.62rem', fontWeight:700, flexShrink:0 }}>
          {done ? 'v' : n}
        </div>
        <div style={{ flex:1 }}>
          <div className="font-heading" style={{ fontSize:'0.95rem', fontWeight:600, letterSpacing:'-0.01em' }}>{title}</div>
          <div style={{ fontSize:'0.73rem', color:'var(--text-muted)', marginTop:1 }}>{sub}</div>
        </div>
        <span style={{ color:'var(--text-light)', fontSize:'0.8rem', display:'inline-block', transform:isOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}>v</span>
      </div>
      {isOpen && <div style={{ padding:'20px 24px 24px' }}>{children}</div>}
    </div>
  )
}

export default function NewDealPage() {
  const router = useRouter()
  const [form, setForm] = useState<DealFormData>(EMPTY)
  const [open, setOpen] = useState<number[]>([1])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const upd = (k: keyof DealFormData, v: any) => setForm(p=>({...p,[k]:v}))
  const updDel = (k: keyof DealFormData['deliverables'], v: string[]) => setForm(p=>({...p,deliverables:{...p.deliverables,[k]:v}}))
  const toggleSection = (n: number) => setOpen(s=>s.includes(n)?s.filter(x=>x!==n):[...s,n])

  const totalCost   = form.team_roles.reduce((s,r)=>s+r.hourlyCost*r.monthlyHours, 0)
  const margin      = form.monthly_retainer - totalCost
  const marginPct   = form.monthly_retainer > 0 ? (margin/form.monthly_retainer)*100 : 0
  const totalProfit = margin * form.contract_duration + (form.setup_fee||0)
  const score = Math.max(0, Math.min(100, Math.round(marginPct*1.4) - (Object.values(form.deliverables).flat().length>10?8:0)))
  const risk  = marginPct < 20 || score < 35 ? 'HIGH' : marginPct < 30 || score < 55 ? 'MEDIUM' : 'LOW'
  const riskColor   = risk==='HIGH'?'var(--red)':risk==='MEDIUM'?'var(--amber)':'var(--green)'
  const marginColor = marginPct>=30?'var(--green)':marginPct>=20?'var(--amber)':'var(--red)'
  const hasCalc = form.monthly_retainer > 0 && totalCost > 0

  const done = [
    !!form.client_name && !!form.industry,
    form.team_roles.length > 0,
    Object.values(form.deliverables).flat().length > 0,
    form.kpi_promises.length > 0 || form.timeline_promises.length > 0,
    form.exclusions.length > 0,
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/deals', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (!res.ok) throw new Error()
      const { deal } = await res.json()
      router.push(`/deals/${deal.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Nav
        breadcrumbs={[{ label:'Dashboard', href:'/' }, { label:'New Deal' }]}
        actions={<Link href="/" className="gl-btn gl-btn-ghost">Cancel</Link>}
      />
      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth:1020, margin:'0 auto', padding:'40px', display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}>
          <div>

            <SectionBlock n={1} title="Client & Contract" sub="Who is this deal for?" done={done[0]} isOpen={open.includes(1)} onToggle={()=>toggleSection(1)}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <FieldLabel>Client Name</FieldLabel>
                  <input required className="gl-input" value={form.client_name} onChange={e=>upd('client_name',e.target.value)} placeholder="e.g. Real Estate Co."/>
                </div>
                <div>
                  <FieldLabel>Industry</FieldLabel>
                  <select required className="gl-select" value={form.industry} onChange={e=>upd('industry',e.target.value)}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                <div>
                  <FieldLabel>Duration</FieldLabel>
                  <select className="gl-select" value={form.contract_duration} onChange={e=>upd('contract_duration',Number(e.target.value))}>
                    {[1,3,6,12,24].map(m=><option key={m} value={m}>{m} months</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Monthly Retainer</FieldLabel>
                  <div className="gl-prefix">
                    <span className="gl-prefix-sym">EUR</span>
                    <input required type="number" min={0} className="gl-input" value={form.monthly_retainer||''} onChange={e=>upd('monthly_retainer',Number(e.target.value))} placeholder="3500"/>
                  </div>
                </div>
                <div>
                  <FieldLabel optional>Setup Fee</FieldLabel>
                  <div className="gl-prefix">
                    <span className="gl-prefix-sym">EUR</span>
                    <input type="number" min={0} className="gl-input" value={form.setup_fee||''} onChange={e=>upd('setup_fee',Number(e.target.value))} placeholder="500"/>
                  </div>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock n={2} title="Team & Costs" sub="Who works on this deal and at what rate?" done={done[1]} isOpen={open.includes(2)} onToggle={()=>toggleSection(2)}>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:10 }}>
                {form.team_roles.map((role,i) => (
                  <div key={i} className="gl-team-entry">
                    <div>
                      <div style={{ fontSize:'0.65rem', fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:3 }}>Role</div>
                      <input className="gl-input" style={{ background:'transparent', border:'none', padding:0, fontSize:'0.84rem' }} value={role.role} onChange={e=>upd('team_roles',form.team_roles.map((r,j)=>j===i?{...r,role:e.target.value}:r))} placeholder="e.g. Media Buyer"/>
                    </div>
                    <div>
                      <div style={{ fontSize:'0.65rem', fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:3 }}>Hours/mo</div>
                      <input type="number" className="gl-input" style={{ background:'transparent', border:'none', padding:0, fontSize:'0.84rem' }} value={role.monthlyHours||''} onChange={e=>upd('team_roles',form.team_roles.map((r,j)=>j===i?{...r,monthlyHours:Number(e.target.value)}:r))} placeholder="20"/>
                    </div>
                    <div>
                      <div style={{ fontSize:'0.65rem', fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:3 }}>Rate/h</div>
                      <input type="number" className="gl-input" style={{ background:'transparent', border:'none', padding:0, fontSize:'0.84rem' }} value={role.hourlyCost||''} onChange={e=>upd('team_roles',form.team_roles.map((r,j)=>j===i?{...r,hourlyCost:Number(e.target.value)}:r))} placeholder="65"/>
                    </div>
                    <button type="button" onClick={()=>upd('team_roles',form.team_roles.filter((_,j)=>j!==i))} style={{ width:28, height:28, borderRadius:5, background:'transparent', border:'1px solid var(--border)', color:'var(--text-light)', cursor:'pointer', display:'grid', placeItems:'center', fontSize:14 }}>x</button>
                  </div>
                ))}
              </div>
              <button type="button" className="gl-add-btn" onClick={()=>upd('team_roles',[...form.team_roles,{role:'',hourlyCost:65,monthlyHours:20}])}>+ Add team member</button>
              {totalCost > 0 && (
                <div style={{ background:'var(--green-bg)', border:'1px solid var(--green-border)', borderRadius:7, padding:'10px 14px', marginTop:12, display:'flex', justifyContent:'space-between', fontSize:'0.82rem' }}>
                  <span style={{ color:'var(--green)', fontWeight:500 }}>Total internal cost</span>
                  <span className="font-heading" style={{ fontSize:'1rem', fontWeight:600, color:'var(--green)' }}>EUR {Math.round(totalCost).toLocaleString('nl-BE')}/mo</span>
                </div>
              )}
            </SectionBlock>

            <SectionBlock n={3} title="Deliverables" sub="What exactly are you delivering each month?" done={done[2]} isOpen={open.includes(3)} onToggle={()=>toggleSection(3)}>
              <CheckGrid label="Paid Advertising" items={PAID_ADS} selected={form.deliverables.paidAds} onChange={v=>updDel('paidAds',v)}/>
              <CheckGrid label="SEO" items={SEO_ITEMS} selected={form.deliverables.seo} onChange={v=>updDel('seo',v)}/>
              <CheckGrid label="Creative & Content" items={CREATIVE} selected={form.deliverables.creative} onChange={v=>updDel('creative',v)}/>
              <CheckGrid label="Reporting" items={REPORTING} selected={form.deliverables.reporting} onChange={v=>updDel('reporting',v)}/>
              <CheckGrid label="Strategy" items={STRATEGY} selected={form.deliverables.strategy} onChange={v=>updDel('strategy',v)}/>
              <div style={{ marginTop:4 }}>
                <FieldLabel optional>Custom deliverables</FieldLabel>
                <textarea className="gl-textarea" value={form.deliverables.custom.join('\n')} onChange={e=>updDel('custom',e.target.value.split('\n').filter(Boolean))} placeholder="e.g. WhatsApp campaign, email newsletter..."/>
              </div>
            </SectionBlock>

            <SectionBlock n={4} title="Promises Made" sub="KPIs, timelines and verbal commitments" done={done[3]} isOpen={open.includes(4)} onToggle={()=>toggleSection(4)}>
              <TagInput label="KPIs Promised" placeholder="e.g. ROAS 4x, 40 leads/month..." values={form.kpi_promises} onChange={v=>upd('kpi_promises',v)}/>
              <TagInput label="Timeline Promises" placeholder="e.g. Results within 3 weeks..." values={form.timeline_promises} onChange={v=>upd('timeline_promises',v)}/>
              <TagInput label="Verbal Extras" placeholder="e.g. Help with landing pages..." values={form.verbal_promises} onChange={v=>upd('verbal_promises',v)} optional/>
            </SectionBlock>

            <SectionBlock n={5} title="Exclusions" sub="What is explicitly NOT included?" done={done[4]} isOpen={open.includes(5)} onToggle={()=>toggleSection(5)}>
              <TagInput label="Not Included" placeholder="e.g. Website development, videography..." values={form.exclusions} onChange={v=>upd('exclusions',v)}/>
            </SectionBlock>

            {error && <div style={{ background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8, padding:'12px 16px', fontSize:'0.82rem', color:'var(--red)', marginTop:10 }}>{error}</div>}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:76 }}>
            <div className="gl-card" style={{ padding:16 }}>
              <div style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Progress</div>
              {['Client & Contract','Team & Costs','Deliverables','Promises Made','Exclusions'].map((label,i) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:9, padding:'5px 0', fontSize:'0.78rem' }}>
                  <div style={{ width:18, height:18, borderRadius:4, background:done[i]?'var(--green)':'var(--bg)', border:done[i]?'none':'1px solid var(--border)', color:'#fff', display:'grid', placeItems:'center', flexShrink:0, fontSize:'0.6rem', fontWeight:700 }}>
                    {done[i] ? 'v' : ''}
                  </div>
                  <span style={{ color:done[i]?'var(--text-muted)':'var(--text)' }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="gl-card">
              <div style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'12px 16px' }}>
                <div style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Live Profitability</div>
              </div>
              <div style={{ padding:16 }}>
                {[
                  ['Retainer', form.monthly_retainer ? `EUR ${form.monthly_retainer.toLocaleString('nl-BE')}/mo` : null],
                  ['Internal Cost', totalCost > 0 ? `EUR ${Math.round(totalCost).toLocaleString('nl-BE')}/mo` : null],
                ].map(([k,v]) => (
                  <div key={String(k)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'0.8rem' }}>
                    <span style={{ fontSize:'0.74rem', color:'var(--text-muted)' }}>{String(k)}</span>
                    {v ? <span className="font-heading" style={{ fontWeight:600, fontSize:'0.9rem' }}>{String(v)}</span>
                       : <span style={{ color:'var(--text-light)', fontSize:'0.78rem' }}>-</span>}
                  </div>
                ))}
                {hasCalc && (
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'0.8rem' }}>
                    <span style={{ fontSize:'0.74rem', color:'var(--text-muted)' }}>Gross Margin</span>
                    <span className="font-heading" style={{ fontWeight:600, fontSize:'0.9rem', color:marginColor }}>EUR {Math.round(margin).toLocaleString('nl-BE')} - {marginPct.toFixed(1)}%</span>
                  </div>
                )}
                {hasCalc && (
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'0.8rem' }}>
                    <span style={{ fontSize:'0.74rem', color:'var(--text-muted)' }}>Total Profit</span>
                    <span className="font-heading" style={{ fontWeight:600, fontSize:'0.9rem' }}>EUR {Math.round(totalProfit).toLocaleString('nl-BE')}</span>
                  </div>
                )}
                <div style={{ margin:'14px 0 4px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:14, textAlign:'center' }}>
                  <div style={{ fontSize:'0.65rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Deal Health Score</div>
                  <div className="font-heading" style={{ fontSize:'2rem', fontWeight:600, letterSpacing:'-0.03em', lineHeight:1, color:hasCalc?riskColor:'var(--text-light)' }}>
                    {hasCalc ? score : '-'}
                  </div>
                  <div style={{ height:4, background:'var(--border)', borderRadius:2, marginTop:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:2, background:riskColor, width:hasCalc?`${score}%`:'0%', transition:'width 0.4s ease' }}/>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)', fontSize:'0.78rem' }}>
                  <span style={{ color:'var(--text-muted)' }}>Scope Risk</span>
                  <span className={`gl-badge gl-badge-${risk.toLowerCase()}`} style={{ opacity:hasCalc?1:0.4 }}>
                    <span className="gl-badge-dot"/>{risk}
                  </span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="gl-btn gl-btn-primary" style={{ width:'100%', justifyContent:'center', padding:13, fontSize:'0.9rem', opacity:loading?0.7:1 }}>
              {loading ? 'Calculating...' : 'Calculate & Greenlight Deal'}
            </button>
            <div style={{ fontSize:'0.7rem', color:'var(--text-light)', textAlign:'center' }}>Instant results - AI documents generated after</div>
          </div>
        </div>
      </form>
    </>
  )
}
