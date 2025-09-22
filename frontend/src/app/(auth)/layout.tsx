import '../globals.css'
import ThemeRegistry from '@/components/providers/ThemeRegistry'
import AuthThemeProvider from '@/components/providers/AuthThemeProvider'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeRegistry>
      <AuthThemeProvider>
        {children}
      </AuthThemeProvider>
    </ThemeRegistry>
  )
}
