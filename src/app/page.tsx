import Link from 'next/link'
import './landing.css'

export default function LandingPage() {
  const avatars: [string, string][] = [['MV','#6b7280'],['LB','#16a34a'],['TK','#d97706'],['AW','#4338ca'],['JD','#dc2626']]
  const stats: [string, string, string][] = [
    ['€47.200','#f87171','Gemiddeld jaarlijks verlies aan onrendabele deals voor een bureau van 5 personen'],
    ['68%','#fbbf24','Van bureau-eigenaars zegt spijt te hebben van een deal nadat de delivery gestart was'],
    ['< 5 min','#4ade80','Tijd tot een volledig winstgevendheidsoordeel met Greenlight'],
  ]
  const steps: [string, string, string][] = [
    ['01','Vul je deal in','Klantinfo, retainer, teamverdeling, deliverables en gemaakte beloftes. Gestructureerde velden — geen chaotische vrije tekst.'],
    ['02','Krijg je oordeel','Greenlight berekent de echte marge, signaleert scope-risico en geeft een Deal Health Score — deterministische logica, geen AI-hallucinaties.'],
    ['03','Genereer je documenten','AI schrijft je Risk Analysis, Scope Lock, Handover Brief en 30-Day Kickoff Plan. Klaar.'],
  ]
  const features: [string, string][] = [
    ['Risk Analysis','intern document dat aangeeft wat delivery vanaf dag 1 moet weten'],
    ['Scope Lock','klantgericht document dat vastlegt wat wel en niet inbegrepen is'],
    ['Handover Brief','gestructureerde brief voor je projectmanager of delivery lead'],
    ['30-Day Kickoff Plan','week-per-week acties met eigenaars, klaar om te delen'],
  ]
  const testimonials: [string, string, string, string, string][] = [
    ['We zeiden nee tegen een klant van 3k/maand nadat Greenlight ons toonde dat we eigenlijk verlies zouden maken aan onze echte uurtarieven. Dat was ongemakkelijk — en precies wat we nodig hadden.','Michael V.','Oprichter, performance marketing bureau · Gent','#16a34a','MV'],
    ['Het Scope Lock-document alleen al bespaarde ons een nachtmerrie van een klantgesprek. We stuurden het voor de kickoff en ze tekenden af op wat uitgesloten was. Geen "maar ik dacht dat dit inbegrepen was" meer.','Laura B.','Mede-oprichter, social media bureau · Amsterdam','#d97706','LB'],
    ['Ik deed dit vroeger in een spreadsheet en dat kostte een uur. Greenlight doet het in 4 minuten en genereert automatisch het overdrachtsdocument. Nu een vast onderdeel van elke deal die we sluiten.','Thomas K.','Eigenaar, SEO & content bureau · Antwerpen','#4338ca','TK'],
  ]
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
          <a href="#how" className="lp-nav-link">Hoe het werkt</a>
          <Link href="/login" className="lp-nav-link">Inloggen</Link>
        </div>
        <Link href="/signup" className="lp-nav-cta">
          Probeer gratis
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </nav>

      <section className="lp-hero">
        <div className="lp-eyebrow"><span className="lp-eyebrow-dot"/>Gemaakt voor marketingbureaus</div>
        <h1 className="lp-h1 lp-fade">Weet of een deal <em>écht winstgevend</em> is<br/>vóór je ja zegt.</h1>
        <p className="lp-sub lp-fade">Greenlight berekent je echte interne kostprijs, signaleert scope-risico en genereert de documenten die je deliveryteam nodig heeft — in minder dan 5 minuten.</p>
        <div className="lp-actions lp-fade">
          <Link href="/signup" className="lp-btn">
            Probeer gratis
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/login" className="lp-btn-ghost">Inloggen →</Link>
        </div>
        <div className="lp-proof">
          <div className="lp-avatars">
            {avatars.map(([i,c]) => <div key={i} className="lp-avatar" style={{background:c}}>{i}</div>)}
          </div>
          <span>12 bureaus in bèta · Geen kredietkaart nodig</span>
        </div>
      </section>

      <section className="lp-pain">
        <div className="lp-pain-inner">
          <div>
            <div className="lp-pain-label">De echte kost van slechte deals</div>
            <h2 className="lp-pain-title">De meeste bureau-eigenaars aanvaarden deals zonder ooit de <em>echte kostprijs</em> te berekenen.</h2>
            <p className="lp-pain-body">Je offreert op buikgevoel. Je belooft deliverables om de deal binnen te halen. Zes weken later is je team opgebrand, is de marge verdwenen, en wil de klant nog meer. Greenlight stopt dit voor het begint.</p>
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
        <div className="lp-section-label">Hoe het werkt</div>
        <h2 className="lp-section-title">Van deal naar beslissing in drie stappen.</h2>
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
            <div className="lp-section-label">Wat je krijgt</div>
            <h2 className="lp-demo-title">Alles wat je deal nodig heeft om van sales naar delivery te gaan.</h2>
            <p className="lp-demo-sub">Greenlight genereert vier professionele documenten voor elke deal — zodat er niets verloren gaat bij de overdracht.</p>
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
              <span style={{fontSize:'0.72rem',color:'#8a8780',fontWeight:500,marginLeft:4}}>Greenlight — Vastgoed BV</span>
            </div>
            <div className="lp-mock-body">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <div>
                  <div style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1rem',fontWeight:600,marginBottom:4}}>Vastgoed BV</div>
                  <div style={{fontSize:'0.72rem',color:'#8a8780'}}>Vastgoed · 3 maanden · Vandaag aangemaakt</div>
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
          <div className="lp-section-label">Van bèta-gebruikers</div>
          <h2 className="lp-section-title" style={{maxWidth:'100%'}}>Bureaus die nu al hun marges beschermen.</h2>
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

      <section className="lp-cta">
        <h2 className="lp-cta-title">Stop met gokken.<br/>Begin met <em>greenlighten</em>.</h2>
        <p className="lp-cta-sub">Je volgende deal levert je geld op, of kost je geld. Weet welke van de twee, voordat je ja zegt.</p>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
          <Link href="/signup" className="lp-btn">
            Probeer gratis
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <p style={{fontSize:'0.76rem',color:'#b8b4ab'}}>14 dagen gratis proberen · Geen kredietkaart nodig · Op elk moment opzegbaar</p>
        </div>
      </section>

      <footer className="lp-footer">
        <span className="lp-footer-logo">Greenlight</span>
        <span className="lp-footer-note">2026 Greenlight · Gemaakt in België</span>
      </footer>
    </div>
  )
}
