'use client'
import { useLocale } from '@/lib/i18n/LocaleProvider'

export default function LocaleToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--border)', borderRadius:6, overflow:'hidden', fontSize:'0.72rem', fontWeight:600 }}>
      {(['nl','en'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className="gl-locale-btn"
          style={{
            border:'none',
            cursor:'pointer',
            fontFamily:'inherit',
            background: locale === l ? 'var(--ink)' : 'transparent',
            color: locale === l ? '#fff' : 'var(--text-muted)',
            textTransform:'uppercase',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
