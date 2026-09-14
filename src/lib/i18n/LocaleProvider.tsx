'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, getDictionary, type Locale } from './translations'

interface LocaleContextValue {
  locale: Locale
  d: ReturnType<typeof getDictionary>
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((l: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000`
    setLocaleState(l)
    router.refresh()
  }, [router])

  return (
    <LocaleContext.Provider value={{ locale, d: getDictionary(locale), setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}
