import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeRegistry from '@/components/providers/ThemeRegistry'

export const metadata: Metadata = {
  title: 'Phần mềm quản lý 24h Billiard App',
  description: 'Fullstack application with Laravel backend and Next.js frontend',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
