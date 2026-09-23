export const runtime = 'edge'

import Link from 'next/link'
import './landing.css'
import { getServerDictionary } from '@/lib/i18n/server'
import LocaleToggle from '@/components/LocaleToggle'

const STEP_SCREENSHOTS = ['/demo-screenshots/step-1-input.png', '/demo-screenshots/step-2-result.png', '/demo-screenshots/step-3-document.png']

export default async function LandingPage() {
  const { d } = await getServerDictionary()
  const t = d.landing

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
          <Link href="/demo" className="lp-nav-link">{t.navDemo}</Link>
          <a href="#how" className="lp-nav-link">{t.navHow}</a>
          <Link href="/login" className="lp-nav-link">{t.navSignIn}</Link>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="lp-trial-badge">{t.navTrialBadge}</span>
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
            {t.painPoints.map(p => (
              <div key={p} className="lp-stat">
                <div className="lp-stat-label" style={{color:'#e5e7eb',fontSize:'0.88rem',lineHeight:1.5}}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-hiw" id="how">
        <div className="lp-section-label">{t.howLabel}</div>
        <h2 className="lp-section-title">{t.howTitle}</h2>
        <div className="lp-steps">
          {t.steps.map(([n,ti,b], i) => (
            <div key={n} className="lp-step">
              <img src={STEP_SCREENSHOTS[i]} alt={ti} className="lp-step-img"/>
              <div className="lp-step-body-wrap">
                <div className="lp-step-num">{n}</div>
                <div className="lp-step-title">{ti}</div>
                <div className="lp-step-body">{b}</div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/demo" className="lp-btn" style={{margin:'36px auto 0'}}>
          {t.howCta}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </section>

      <section className="lp-features-dark">
        <div className="lp-features-dark-inner">
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
