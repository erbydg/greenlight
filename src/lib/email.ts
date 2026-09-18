import { formatEuro } from '@/lib/profitability'

interface ResultEmailData {
  to: string
  locale: string | null
  appUrl: string
  totalMonthlyCost: number
  grossMargin: number
  marginPercent: number
  marginScore: number
  totalProfit: number
}

// Sandbox-safe defaults: Resend's shared onboarding@resend.dev sender only
// delivers to the Resend account's own verified email until a real domain
// is verified. Once verified, set RESEND_FROM_EMAIL to switch senders —
// no other code changes needed.
const FROM = process.env.RESEND_FROM_EMAIL || 'Greenlight <onboarding@resend.dev>'

function buildEmail(data: ResultEmailData) {
  const nl = data.locale !== 'en'
  const subject = nl ? 'Je Greenlight-resultaat' : 'Your Greenlight result'
  const rows: [string, string][] = nl
    ? [
        ['Interne kost / maand', formatEuro(data.totalMonthlyCost)],
        ['Brutomarge / maand', formatEuro(data.grossMargin)],
        ['Marge %', `${data.marginPercent.toFixed(1)}%`],
        ['Totale winst over looptijd', formatEuro(data.totalProfit)],
        ['Deal Health Score', `${data.marginScore}/100`],
      ]
    : [
        ['Internal cost / month', formatEuro(data.totalMonthlyCost)],
        ['Gross margin / month', formatEuro(data.grossMargin)],
        ['Margin %', `${data.marginPercent.toFixed(1)}%`],
        ['Total profit over duration', formatEuro(data.totalProfit)],
        ['Deal Health Score', `${data.marginScore}/100`],
      ]

  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e4e1db;color:#8a8780;font-size:13px;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e4e1db;text-align:right;font-weight:600;font-size:14px;color:#1c1b18;">${value}</td>
    </tr>`).join('')

  const cta = nl ? 'Bekijk de volledige app →' : 'See the full app →'
  const intro = nl
    ? 'Hier is het resultaat van je gratis check:'
    : "Here's the result from your free check:"

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1c1b18;">
      <p style="font-size:15px;">${intro}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rowsHtml}</table>
      <a href="${data.appUrl}/signup" style="display:inline-block;background:#1c1b18;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;margin-top:8px;">${cta}</a>
    </div>`

  return { subject, html }
}

export async function sendResultEmail(data: ResultEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return // not configured yet -- lead is still saved, just skip sending

  const { subject, html } = buildEmail(data)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: data.to, subject, html }),
  }).catch(() => {}) // best-effort -- never fail the lead save because of this
}
