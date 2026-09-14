import { cookies } from 'next/headers'
import { LOCALE_COOKIE, parseLocale, getDictionary, type Locale } from './translations'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value)
}

export async function getServerDictionary() {
  const locale = await getLocale()
  return { locale, d: getDictionary(locale) }
}
