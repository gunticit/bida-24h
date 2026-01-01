'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import useRegister from '@/hook/auth/useRegister'

export default function RegisterPage() {
  const { formData, loading, error, handleChange, handleSubmit } = useRegister()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #FF4500 50%, #FF6347 75%, #FFA07A 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4), 0 10px 40px rgba(139, 0, 0, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6), 0 15px 50px rgba(139, 0, 0, 0.4); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .sparkle-dot {
          position: fixed;
          background: gold;
          border-radius: 50%;
          animation: sparkle 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      {/* Decorative sparkles */}
      {isMounted && (
        <>
          {[...Array(15)].map((_, i) => (
            <Box
              key={`sparkle-${i}`}
              className="sparkle-dot"
              sx={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13 + 5) % 100}%`,
                width: `${4 + (i % 3)}px`,
                height: `${4 + (i % 3)}px`,
                animationDelay: `${(i * 0.2) % 3}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Decorative lanterns */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 30,
          fontSize: '3rem',
          animation: 'float 3s ease-in-out infinite',
          zIndex: 2,
        }}
      >
        🏮
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 30,
          fontSize: '3rem',
          animation: 'float 3s ease-in-out infinite',
          animationDelay: '1.5s',
          zIndex: 2,
        }}
      >
        🏮
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 'calc(100vh - 64px)',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.95) 100%)',
              borderRadius: '20px',
              border: '4px solid #FFD700',
              padding: { xs: 3, sm: 5 },
              animation: 'glow 3s ease-in-out infinite',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative corners */}
            <Box sx={{ position: 'absolute', top: 15, left: 15, fontSize: '1.5rem' }}>🌸</Box>
            <Box sx={{ position: 'absolute', top: 15, right: 15, fontSize: '1.5rem' }}>🌸</Box>
            <Box sx={{ position: 'absolute', bottom: 15, left: 15, fontSize: '1.5rem' }}>🧧</Box>
            <Box sx={{ position: 'absolute', bottom: 15, right: 15, fontSize: '1.5rem' }}>🧧</Box>

            {/* Lời chúc Tết */}
            <Typography
              variant="h5"
              sx={{
                color: '#DC143C',
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 1,
                textShadow: '1px 1px 2px rgba(220, 20, 60, 0.2)',
              }}
            >
              🎊 Chúc Mừng Năm Mới 2026 🎊
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#B22222',
                fontStyle: 'italic',
                textAlign: 'center',
                mb: 2,
              }}
            >
              ✨ An Khang Thịnh Vượng ✨
            </Typography>

            <Divider
              sx={{
                width: '60%',
                backgroundColor: '#FFD700',
                height: 2,
                mb: 3,
                mx: 'auto',
              }}
            />

            <Typography
              component="h1"
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #8B0000, #DC143C, #FF4500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              📝 Đăng ký tài khoản
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: '12px',
                  border: '1px solid #DC143C',
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Họ và tên"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#FFD700',
                      borderWidth: '2px',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#DC143C',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#8B0000',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B0000',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#FFD700',
                      borderWidth: '2px',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#DC143C',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#8B0000',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B0000',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#FFD700',
                      borderWidth: '2px',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#DC143C',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#8B0000',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B0000',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password_confirmation"
                label="Xác nhận mật khẩu"
                type="password"
                id="password_confirmation"
                autoComplete="new-password"
                value={formData.password_confirmation}
                onChange={handleChange}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#FFD700',
                      borderWidth: '2px',
                      borderRadius: '12px',
                    },
                    '&:hover fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#DC143C',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: '2px',
                      borderRadius: '12px',
                      borderColor: '#8B0000',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B0000',
                  },
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
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  background: 'linear-gradient(45deg, #DC143C 0%, #FF4500 50%, #FFD700 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 3s ease infinite',
                  color: '#FFF',
                  border: '2px solid #FFD700',
                  boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(220, 20, 60, 0.5)',
                  },
                  // '&:disabled': {
                  //   background: 'rgba(0,0,0,0.12)',
                  //   border: '2px solid rgba(0,0,0,0.12)',
                  // },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : '🚀 Đăng ký ngay'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  href="/login"
                  variant="body2"
                  sx={{
                    color: '#DC143C',
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#8B0000',
                    },
                  }}
                >
                  Đã có tài khoản? 🔐 Đăng nhập ngay
                </Link>
              </Box>

              {/* Footer năm mới */}
              <Typography
                variant="body2"
                sx={{
                  color: '#8B0000',
                  fontWeight: 500,
                  textAlign: 'center',
                  mt: 3,
                }}
              >
                Năm 2026 - Phát Lộc Phát Tài
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

