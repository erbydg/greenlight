export const runtime = 'edge'

import Link from 'next/link'
import './landing.css'
import { getServerDictionary } from '@/lib/i18n/server'
import LocaleToggle from '@/components/LocaleToggle'

export default async function LandingPage() {
  const { d } = await getServerDictionary()
  const t = d.landing
  const avatars: [string, string][] = [['MV','#6b7280'],['LB','#16a34a'],['TK','#d97706'],['AW','#4338ca'],['JD','#dc2626']]
  const statColors = ['#f87171', '#fbbf24', '#4ade80']
  const mockTabs = ['Risk Analysis','Scope Lock','Handover','Kickoff']
  const mockLines = ['100%','80%','100%','60%','100%','80%']
  const mockMetrics: [string, string, string][] = [['Retainer','3.500','#1c1b18'],['Margin','55.4%','#16a34a'],['Health','87/100','#1c1b18']]
  const testimonialAvatars: [string, string][] = [['MV','#16a34a'],['LB','#d97706'],['TK','#4338ca']]

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
          <a href="#how" className="lp-nav-link">{t.navHow}</a>
          <Link href="/login" className="lp-nav-link">{t.navSignIn}</Link>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <LocaleToggle />
          <Link href="/signup" className="lp-nav-cta">
            {t.navCta}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </nav>

      <section className="lp-hero">
        <div className="lp-eyebrow"><span className="lp-eyebrow-dot"/>{t.eyebrow}</div>
        <h1 className="lp-h1 lp-fade">{t.h1a}<em>{t.h1em}</em>{t.h1b}</h1>
        <p className="lp-sub lp-fade">{t.sub}</p>
        <div className="lp-actions lp-fade">
          <Link href="/signup" className="lp-btn">
            {t.ctaPrimary}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/login" className="lp-btn-ghost">{t.signInArrow}</Link>
        </div>
        <div className="lp-proof">
          <div className="lp-avatars">
            {avatars.map(([i,c]) => <div key={i} className="lp-avatar" style={{background:c}}>{i}</div>)}
          </div>
          <span>{t.proof}</span>
        </div>
      </section>

      <section className="lp-pain">
        <div className="lp-pain-inner">
          <div>
            <div className="lp-pain-label">{t.painLabel}</div>
            <h2 className="lp-pain-title">{t.painTitleA}<em>{t.painTitleEm}</em>{t.painTitleB}</h2>
            <p className="lp-pain-body">{t.painBody}</p>
          </div>
          <div>
            {t.stats.map(([n,l], i) => (
              <div key={n} className="lp-stat">
                <div className="lp-stat-num" style={{color:statColors[i]}}>{n}</div>
                <div className="lp-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-hiw" id="how">
        <div className="lp-section-label">{t.howLabel}</div>
        <h2 className="lp-section-title">{t.howTitle}</h2>
        <div className="lp-steps">
          {t.steps.map(([n,ti,b]) => (
            <div key={n} className="lp-step">
              <div className="lp-step-num">{n}</div>
              <div className="lp-step-title">{ti}</div>
              <div className="lp-step-body">{b}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-demo-wrap">
        <div className="lp-demo-inner">
          <div>
            <div className="lp-section-label">{t.getLabel}</div>
            <h2 className="lp-demo-title">{t.getTitle}</h2>
            <p className="lp-demo-sub">{t.getSub}</p>
            <ul className="lp-feature-list">
              {t.features.map(([ti,de]) => (
                <li key={ti} className="lp-feature-item">
                  <span className="lp-feature-check">&#10003;</span>
                  <span><strong style={{color:'#fff'}}>{ti}</strong> — {de}</span>
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
              <span style={{fontSize:'0.72rem',color:'#8a8780',fontWeight:500,marginLeft:4}}>Greenlight — {t.mockCompany}</span>
            </div>
            <div className="lp-mock-body">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <div>
                  <div style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1rem',fontWeight:600,marginBottom:4}}>{t.mockCompany}</div>
                  <div style={{fontSize:'0.72rem',color:'#8a8780'}}>{t.mockIndustryLine}</div>
                </div>
                <span style={{display:'inline-flex',alignItems:'center',gap:4,background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#16a34a',fontSize:'0.62rem',fontWeight:600,padding:'2px 7px',borderRadius:10}}>
                  <span style={{width:4,height:4,background:'#16a34a',borderRadius:'50%',display:'inline-block'}}/>{t.mockRisk}
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
                  {mockTabs.map((t2,i) => <div key={t2} className={"lp-mock-tab"+(i===0?" active":"")}>{t2}</div>)}
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
          <div className="lp-section-label">{t.testimonialsLabel}</div>
          <h2 className="lp-section-title" style={{maxWidth:'100%'}}>{t.testimonialsTitle}</h2>
          <div className="lp-tgrid">
            {t.testimonials.map(([q,n,r], i) => (
              <div key={n} className="lp-t">
                <div className="lp-t-quote">{q}</div>
                <div className="lp-t-author">
                  <div className="lp-t-avatar" style={{background:testimonialAvatars[i][1]}}>{testimonialAvatars[i][0]}</div>
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

      <section className="lp-cta">
        <h2 className="lp-cta-title">{t.ctaTitleA}<br/>{t.ctaTitlePre}<em>{t.ctaTitleEm}</em>{t.ctaTitlePost}</h2>
        <p className="lp-cta-sub">{t.ctaSub}</p>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
          <Link href="/signup" className="lp-btn">
            {t.ctaPrimary}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <p style={{fontSize:'0.76rem',color:'#b8b4ab'}}>{t.trialLine}</p>
        </div>
      </section>

      <footer className="lp-footer">
        <span className="lp-footer-logo">Greenlight</span>
        <span className="lp-footer-note">{t.footerNote}</span>
      </footer>
    </div>
  )
}
