'use client'

import { Box } from '@mui/material'

interface AuthThemeProviderProps {
  children: React.ReactNode
}

export default function AuthThemeProvider({ children }: AuthThemeProviderProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'rgb(236, 240, 243)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  )
}
