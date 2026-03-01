import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Greenlight — Agency Deal Profitability',
  description: 'Know if a deal is actually profitable before you hand it to delivery.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%231c1b18'/><path d='M16 6L23 18H9L16 6Z' fill='white' opacity='0.9'/><circle cx='23' cy='24' r='3.5' fill='%2316a34a'/></svg>",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
