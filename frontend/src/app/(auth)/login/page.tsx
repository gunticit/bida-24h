'use client'

import { useEffect } from 'react'

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material'
import useLogin from '@/hook/auth/useLogin'
import Loading from '@/components/loading/index'

export default function LoginPage() {
  const { formData, loading, error, setLoading, handleChange, handleSubmit } = useLogin()

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Loading />
      </Box>
    )
  }

  return (
    <Box component="main">
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            padding: '25px',
            borderRadius: '12px',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignSelf: 'center',
              paddingX: { xs: 2, sm: 3 },
              backgroundColor: 'rgb(236, 240, 243)',
              boxShadow: 'rgb(209, 217, 230) 10px 10px 10px, rgb(249, 249, 249) -10px -10px 10px',
              borderRadius: 5,
              padding: { xs: 2, sm: 5 },
              gap: { xs: 2, sm: 5 },
              flex: 1,
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 2,
                width: '100%',
                boxShadow: { xs: 'unset', sm: '4px 4px 10px #d1d9e6, -4px -4px 10px #f9f9f9' },
                padding: { xs: '0 15px', sm: '0 30px' },
                borderRadius: '50%',
              }}
            >
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
                  gap: 4,
                  width: '100%',
                  flex: 1,
                }}
              >
                <Typography
                  component="h1"
                  variant="h4"
                  align="center"
                  gutterBottom
                  sx={{
                    fontSize: { xs: 30, sm: 34 },
                    fontWeight: 700,
                    lineHeight: 3,
                    color: '#181818',
                  }}
                >
                  Đăng nhập
                </Typography>
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
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        borderWidth: '1px',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderWidth: '1px',
                        borderRadius: '12px',
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '1px',
                        borderRadius: '12px',
                        borderColor: 'green',
                      },
                    },
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
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        borderWidth: '1px',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderWidth: '1px',
                        borderRadius: '12px',
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '1px',
                        borderRadius: '12px',
                        borderColor: 'green',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    paddingY: 1.5,
                    fontSize: '1rem',
                    borderRadius: 30,
                    margin: '60px auto 30px',
                    backgroundColor: 'rgb(75, 112, 226)',
                    color: 'rgb(249, 249, 249)',
                    boxShadow: 'rgb(209, 217, 230) 8px 8px 16px, rgb(249, 249, 249) -8px -8px 16px',
                    maxWidth: '180px',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Avatar
                src="/fingerprint.jpg"
                alt="Login Image"
                sx={{
                  borderRadius: '50%',
                  width: '200px',
                  height: '200px',
                  boxShadow:
                    'rgb(209, 217, 230) 10px 10px 10px, rgb(249, 249, 249) -10px -10px 10px',
                  border: '5px solid #589eff',
                  color: 'rgb(249, 249, 249)',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
