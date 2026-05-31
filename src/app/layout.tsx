import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PrepAndCut — Competition Prep for Athletes',
  description: 'Competition prep and weight cutting platform for MMA, BJJ, wrestling, and bodybuilding athletes.',
  manifest: '/manifest.json',
  icons: { apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
  themeColor: '#D4A24E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-void text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
