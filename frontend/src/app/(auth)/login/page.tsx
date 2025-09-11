'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material'
import { apiService, LoginCredentials } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiService.login(formData)
      apiService.setToken(response.token)
      router.push('/dashboard')
    } catch (err) {
      let message = 'Đăng nhập thất bại'
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as Record<string, unknown>).message === 'string'
      ) {
        message = (err as { message: string }).message
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Đăng nhập
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              type="email"
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 1,
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 1,
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                paddingY: 1.5,
                fontSize: '1rem',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/register" variant="body2" underline="hover">
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
