'use client'

import { useEffect, useState } from 'react'

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material'
import useLogin from '@/hook/auth/useLogin'
import Loading from '@/components/loading/index'

export default function LoginPage() {
  const { formData, loading, error, setLoading, handleChange, handleSubmit } = useLogin()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setLoading(false)
    setIsMounted(true)
  }, [setLoading])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FF4500 100%)',
        }}
      >
        <Loading />
      </Box>
    )
  }

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

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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

      {/* Decorative sparkles - render after mount only */}
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

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: '25px',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignSelf: 'center',
              paddingX: { xs: 2, sm: 3 },
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.95) 100%)',
              borderRadius: '20px',
              border: '4px solid #FFD700',
              padding: { xs: 3, sm: 5 },
              gap: { xs: 2, sm: 5 },
              flex: 1,
              width: '100%',
              maxWidth: '800px',
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

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 2,
                width: '100%',
                padding: { xs: '0 15px', sm: '0 30px' },
              }}
            >
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
                  width: '80%',
                  backgroundColor: '#FFD700',
                  height: 2,
                  mb: 3,
                }}
              />

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid #DC143C',
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
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
                    fontSize: { xs: 26, sm: 30 },
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #8B0000, #DC143C, #FF4500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  🔐 Đăng nhập
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
                    paddingY: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: '30px',
                    margin: '30px auto 20px',
                    background: 'linear-gradient(45deg, #DC143C 0%, #FF4500 50%, #FFD700 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 3s ease infinite',
                    color: '#FFF',
                    border: '2px solid #FFD700',
                    boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)',
                    maxWidth: '220px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: '0 8px 25px rgba(220, 20, 60, 0.5)',
                    },
                    // '&:disabled': {
                    //   background: 'rgba(0,0,0,0.12)',
                    //   border: '2px solid rgba(0,0,0,0.12)',
                    // },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : '🚀 Đăng nhập'}
                </Button>

                {/* Footer năm mới */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#8B0000',
                    fontWeight: 500,
                    textAlign: 'center',
                    mt: 1,
                  }}
                >
                  Năm 2026 - Phát Lộc Phát Tài
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                gap: 2,
              }}
            >
              <Avatar
                src="/logo.jpg"
                alt="Login Image"
                sx={{
                  borderRadius: '50%',
                  p: '25px',
                  width: '180px',
                  height: '180px',
                  boxShadow: '0 8px 30px rgba(139, 0, 0, 0.3)',
                  border: '4px solid #FFD700',
                  bgcolor: '#fff',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: '#DC143C',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                24h Billiard
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#8B4513',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                Hệ thống qlý chuyên nghiệp
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
