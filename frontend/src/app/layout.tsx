import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from '@/components/providers/ThemeRegistry'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Phần mềm quản lý 24h Billiard App',
  description: 'Fullstack application with Laravel backend and Next.js frontend',
  viewport: 'initial-scale=1, width=device-width',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <meta name="emotion-insertion-point" content="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
