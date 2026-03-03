import Link from 'next/link'
import './landing.css'

export default function LandingPage() {
  const avatars: [string, string][] = [['MV','#6b7280'],['LB','#16a34a'],['TK','#d97706'],['AW','#4338ca'],['JD','#dc2626']]
  const stats: [string, string, string][] = [
    ['47.200','#f87171','Average annual loss to unprofitable deals for a 5-person agency'],
    ['68%','#fbbf24','Of agency founders say they regretted accepting a deal after delivery started'],
    ['< 5 min','#4ade80','Time to a full profitability verdict with Greenlight'],
  ]
  const steps: [string, string, string][] = [
    ['01','Fill in your deal','Client info, retainer, team allocation, deliverables, and promises made. Structured fields — no chaotic free text.'],
    ['02','Get your verdict','Greenlight calculates true margin, flags scope risk, and gives a Deal Health Score — deterministic logic, no AI hallucinations.'],
    ['03','Generate your documents','AI writes your Risk Analysis, Scope Lock, Delivery Handover, and 30-Day Kickoff Plan. Done.'],
  ]
  const features: [string, string][] = [
    ['Risk Analysis','internal document flagging what delivery needs to know from day 1'],
    ['Scope Lock','client-facing document defining what is and is not included'],
    ['Handover Brief','structured brief for your project manager or delivery lead'],
    ['30-Day Kickoff Plan','week-by-week actions with owners, ready to share'],
  ]
  const testimonials: [string, string, string, string, string][] = [
    ['We said no to a 3k/month client after Greenlight showed us we would actually lose money at our real hourly rates. That was uncomfortable — and exactly what we needed.','Michael V.','Founder, performance marketing agency · Ghent','#16a34a','MV'],
    ['The Scope Lock document alone saved us a nightmare client conversation. We sent it before kickoff and they signed off on what was excluded. No more but I thought this was included.','Laura B.','Co-founder, social media agency · Amsterdam','#d97706','LB'],
    ['I used to do this in a spreadsheet that took an hour. Greenlight does it in 4 minutes and generates the handover doc automatically. Part of every deal we close now.','Thomas K.','Owner, SEO & content agency · Antwerp','#4338ca','TK'],
  ]
  const starterFeatures = ['5 deals per month','Full profitability engine','AI document generation','PDF downloads','Email support']
  const growthFeatures = ['Unlimited deals','Full profitability engine','AI document generation','PDF downloads','Deal history & analytics','Priority support']
  const mockTabs = ['Risk Analysis','Scope Lock','Handover','Kickoff']
  const mockLines = ['100%','80%','100%','60%','100%','80%']
  const mockMetrics: [string, string, string][] = [['Retainer','3.500','#1c1b18'],['Margin','55.4%','#16a34a'],['Health','87/100','#1c1b18']]

  return (
    <div className="lp-body">
      <nav className="lp-nav">
        <a className="lp-logo" href="#">
          <div className="lp-logo-mark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{position:'relative',zIndex:1}}>
              <path d="M7 1.5L10.5 7.5H3.5L7 1.5Z" fill="white" opacity="0.9"/>
              <rect x="4" y="9" width="6" height="4" rx="1" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <span className="lp-logo-name">Greenlight</span>
        </a>
        <div className="lp-nav-links">
          <a href="#how" className="lp-nav-link">How it works</a>
          <a href="#pricing" className="lp-nav-link">Pricing</a>
          <Link href="/login" className="lp-nav-link">Sign in</Link>
        </div>
        <Link href="/signup" className="lp-nav-cta">
          Start free trial
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </nav>

      <section className="lp-hero">
        <div className="lp-eyebrow"><span className="lp-eyebrow-dot"/>Built for marketing agencies</div>
        <h1 className="lp-h1 lp-fade">Know if a deal is <em>actually profitable</em><br/>before you say yes.</h1>
        <p className="lp-sub lp-fade">Greenlight calculates your true internal cost, detects scope risk, and generates the documents your delivery team needs — in under 5 minutes.</p>
        <div className="lp-actions lp-fade">
          <Link href="/signup" className="lp-btn">
            Analyse a deal free
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/login" className="lp-btn-ghost">Sign in →</Link>
        </div>
        <div className="lp-proof">
          <div className="lp-avatars">
            {avatars.map(([i,c]) => <div key={i} className="lp-avatar" style={{background:c}}>{i}</div>)}
          </div>
          <span>12 agencies in beta · No credit card required</span>
        </div>
      </section>

      <section className="lp-pain">
        <div className="lp-pain-inner">
          <div>
            <div className="lp-pain-label">The real cost of bad deals</div>
            <h2 className="lp-pain-title">Most agency founders accept deals without ever calculating the <em>true cost</em>.</h2>
            <p className="lp-pain-body">You quote on gut feel. You promise deliverables to close the deal. Six weeks later your team is burned out, the margin is gone, and the client still wants more. Greenlight stops this before it starts.</p>
          </div>
          <div>
            {stats.map(([n,c,l]) => (
              <div key={n} className="lp-stat">
                <div className="lp-stat-num" style={{color:c}}>{n}</div>
                <div className="lp-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-hiw" id="how">
        <div className="lp-section-label">How it works</div>
        <h2 className="lp-section-title">From deal to decision in three steps.</h2>
        <div className="lp-steps">
          {steps.map(([n,t,b]) => (
            <div key={n} className="lp-step">
              <div className="lp-step-num">{n}</div>
              <div className="lp-step-title">{t}</div>
              <div className="lp-step-body">{b}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-demo-wrap">
        <div className="lp-demo-inner">
          <div>
            <div className="lp-section-label">What you get</div>
            <h2 className="lp-demo-title">Everything your deal needs to go from sales to delivery.</h2>
            <p className="lp-demo-sub">Greenlight generates four professional documents for every deal — so nothing gets lost in the handover.</p>
            <ul className="lp-feature-list">
              {features.map(([t,d]) => (
                <li key={t} className="lp-feature-item">
                  <span className="lp-feature-check">&#10003;</span>
                  <span><strong style={{color:'#fff'}}>{t}</strong> — {d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-mock">
            <div className="lp-mock-header">
              <div className="lp-mock-dots">
                <div className="lp-mock-dot" style={{background:'#ff5f57'}}/>
                <div className="lp-mock-dot" style={{background:'#febc2e'}}/>
                <div className="lp-mock-dot" style={{background:'#28c840'}}/>
              </div>
              <span style={{fontSize:'0.72rem',color:'#8a8780',fontWeight:500,marginLeft:4}}>Greenlight — Real Estate Co.</span>
            </div>
            <div className="lp-mock-body">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <div>
                  <div style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1rem',fontWeight:600,marginBottom:4}}>Real Estate Co.</div>
                  <div style={{fontSize:'0.72rem',color:'#8a8780'}}>Real Estate · 3 months · Created today</div>
                </div>
                <span style={{display:'inline-flex',alignItems:'center',gap:4,background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#16a34a',fontSize:'0.62rem',fontWeight:600,padding:'2px 7px',borderRadius:10}}>
                  <span style={{width:4,height:4,background:'#16a34a',borderRadius:'50%',display:'inline-block'}}/>LOW RISK
                </span>
              </div>
              <div className="lp-mock-metrics">
                {mockMetrics.map(([l,v,c]) => (
                  <div key={l} className="lp-mock-metric">
                    <div className="lp-mock-metric-label">{l}</div>
                    <div className="lp-mock-metric-val" style={{color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{height:5,background:'#f3f4f6',borderRadius:3,overflow:'hidden',marginBottom:14}}>
                <div style={{height:'100%',background:'#16a34a',width:'87%',borderRadius:3}}/>
              </div>
              <div style={{border:'1px solid #e4e1db',borderRadius:8,overflow:'hidden'}}>
                <div className="lp-mock-tabs">
                  {mockTabs.map((t,i) => <div key={t} className={"lp-mock-tab"+(i===0?" active":"")}>{t}</div>)}
                </div>
                <div className="lp-mock-doc">
                  <div className="lp-mock-line" style={{background:'#bbf7d0',width:'40%',marginBottom:10}}/>
                  {mockLines.map((w,i) => <div key={i} className="lp-mock-line" style={{width:w}}/>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-testimonials">
        <div className="lp-testimonials-inner">
          <div className="lp-section-label">From beta users</div>
          <h2 className="lp-section-title" style={{maxWidth:'100%'}}>Agencies already protecting their margins.</h2>
          <div className="lp-tgrid">
            {testimonials.map(([q,n,r,c,i]) => (
              <div key={n} className="lp-t">
                <div className="lp-t-quote">{q}</div>
                <div className="lp-t-author">
                  <div className="lp-t-avatar" style={{background:c}}>{i}</div>
                  <div>
                    <div className="lp-t-name">{n}</div>
                    <div className="lp-t-role">{r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-pricing" id="pricing">
        <div style={{textAlign:'center',marginBottom:48}}>
          <div className="lp-section-label" style={{display:'inline-block'}}>Pricing</div>
          <h2 className="lp-section-title" style={{maxWidth:'100%',marginBottom:0,marginTop:12}}>One plan. Everything included.</h2>
        </div>
        <div style={{maxWidth:480,margin:'0 auto'}}>
          <div className="lp-pcard lp-pcard-featured" style={{padding:40}}>
            <div style={{fontSize:'0.72rem',fontWeight:600,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>Agency Plan</div>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:4}}>
              <div className="lp-price" style={{color:'#fff'}}>149</div>
              <div style={{fontSize:'1rem',color:'#6b7280'}}>/mo</div>
            </div>
            <div style={{fontSize:'0.78rem',color:'#6b7280',marginBottom:28}}>all features included · unlimited deals</div>
            <ul className="lp-pfeatures" style={{marginBottom:28}}>
              {growthFeatures.map(f => <li key={f} className="lp-pfeature" style={{color:'#d1d5db'}}><span style={{color:'#16a34a',fontSize:11,flexShrink:0}}>&#10003;</span>{f}</li>)}
            </ul>
            <div style={{background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.25)',borderRadius:8,padding:'12px 16px',marginBottom:20}}>
              <div style={{fontSize:'0.68rem',fontWeight:600,color:'#4ade80',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Early adopter discount</div>
              <div style={{fontSize:'0.85rem',color:'#d1d5db'}}>Use code <strong style={{color:'#fff',fontFamily:'monospace',background:'rgba(255,255,255,0.1)',padding:'1px 6px',borderRadius:4}}>LAUNCH50</strong> at checkout for <strong style={{color:'#4ade80'}}>50% off</strong> — first 20 agencies only.</div>
            </div>
            <Link href="/signup" className="lp-pbtn lp-pbtn-solid" style={{fontSize:'0.9rem',padding:'13px'}}>Start free trial</Link>
          </div>
        </div>
        <p style={{textAlign:'center',marginTop:20,fontSize:'0.76rem',color:'#b8b4ab'}}>14-day free trial · No credit card required · Cancel anytime</p>
      </section>

      <section className="lp-cta">
        <h2 className="lp-cta-title">Stop guessing.<br/>Start <em>greenlighting</em>.</h2>
        <p className="lp-cta-sub">Your next deal is either going to make you money or cost you money. Know which one before you say yes.</p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
          <Link href="/signup" className="lp-btn">
            Analyse your first deal free
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </section>

      <footer className="lp-footer">
        <span className="lp-footer-logo">Greenlight</span>
        <span className="lp-footer-note">2026 Greenlight · Made in Belgium</span>
      </footer>
    </div>
  )
}
