import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inbound — Truckmottagning',
  description: 'Fisher Inbound',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv"><body>{children}</body></html>
  )
}
