import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Greenlight — Agency Deal Profitability',
  description: 'Know if a deal is actually profitable before you hand it to delivery.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
