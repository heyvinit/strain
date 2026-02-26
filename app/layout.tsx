import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Strain — Share Your Race Results',
  description:
    'Turn your official race results into a beautiful transparent PNG card. Strava-style stats for any race timing platform.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
