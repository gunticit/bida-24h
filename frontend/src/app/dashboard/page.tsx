'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Card, CardContent, Grid, Button, Divider } from '@mui/material'

import {
  Widgets as WidgetsIcon,
  Settings as SettingsIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material'
import { apiService, User } from '@/lib/api'
import SideBar from '@/app/SideBar'
import Loading from '@/components/loading/index'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  const loadUser = useCallback(async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const token = apiService.getToken()
    if (!token) {
      router.push('/login')
      return
    }
    loadUser()
    setIsMounted(true)
  }, [router, loadUser])

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
    <Box sx={{ flexGrow: 1 }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(255, 215, 0, 0.5); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .sparkle-dot {
          position: fixed;
          background: gold;
          border-radius: 50%;
          animation: sparkle 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        .tet-card {
          transition: all 0.3s ease;
        }

        .tet-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(220, 20, 60, 0.3);
        }
      `}</style>

      {/* Decorative sparkles */}
      {isMounted && (
        <>
          {[...Array(10)].map((_, i) => (
            <Box
              key={`sparkle-${i}`}
              className="sparkle-dot"
              sx={{
                left: `${(i * 10 + 5) % 100}%`,
                top: `${(i * 15 + 10) % 100}%`,
                width: `${3 + (i % 3)}px`,
                height: `${3 + (i % 3)}px`,
                animationDelay: `${(i * 0.3) % 2}s`,
              }}
            />
          ))}
        </>
      )}

      <SideBar title="Bảng điều khiển" href="/dashboard" user={user} icon={<WidgetsIcon />}>
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(139,0,0,0.05) 0%, rgba(220,20,60,0.08) 50%, rgba(255,69,0,0.05) 100%)',
          }}
        >
          {/* Welcome Banner */}
          <Card
            className="tet-card"
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FF4500 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 10s ease infinite',
              border: '3px solid #FFD700',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <CelebrationIcon sx={{ fontSize: 50, color: '#FFD700' }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFD700',
                      fontWeight: 'bold',
                      fontSize: { xs: '1.3rem', sm: '1.8rem' },
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    🎊 Chúc Mừng Năm Mới 2026 🎊
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#FFF',
                      fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    }}
                  >
                    Xin chào, <strong>{user?.name}</strong>! ✨ Chúc bạn An Khang Thịnh Vượng!
                  </Typography>
                </Box>
              </Box>
              {/* Decorative elements */}
              <Box sx={{ position: 'absolute', top: 10, right: 20, fontSize: '2rem', opacity: 0.8 }}>
                🏮
              </Box>
              <Box sx={{ position: 'absolute', bottom: 10, right: 60, fontSize: '1.5rem', opacity: 0.8 }}>
                🧧
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* System Status Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                className="tet-card"
                sx={{
                  height: '100%',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.95) 100%)',
                  border: '2px solid #FFD700',
                  borderRadius: '16px',
                  animation: 'glow 3s ease-in-out infinite',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleIcon sx={{ color: '#DC143C' }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #8B0000, #DC143C)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      Trạng thái hệ thống
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2, backgroundColor: '#FFD700' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Backend API: <strong style={{ color: '#22C55E' }}>Hoạt động</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Database: <strong style={{ color: '#22C55E' }}>Kết nối</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Authentication: <strong style={{ color: '#22C55E' }}>Đã đăng nhập</strong>
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(220, 20, 60, 0.1)', borderRadius: '8px' }}>
                    <Typography variant="body2" sx={{ color: '#8B0000' }}>
                      Hệ thống hoạt động ổn định!
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                className="tet-card"
                sx={{
                  height: '100%',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.95) 100%)',
                  border: '2px solid #FFD700',
                  borderRadius: '16px',
                  animation: 'glow 3s ease-in-out infinite',
                  animationDelay: '1.5s',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <WidgetsIcon sx={{ color: '#DC143C' }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #8B0000, #DC143C)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      Truy cập nhanh
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2, backgroundColor: '#FFD700' }} />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<AccessTimeIcon />}
                      onClick={() => router.push('/playtime')}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(45deg, #DC143C 0%, #FF4500 100%)',
                        color: '#FFF',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        py: 1.5,
                        border: '2px solid #FFD700',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #8B0000 0%, #DC143C 100%)',
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      Quản lý Giờ chơi
                    </Button>
                    {user?.role === 'admin' && (
                      <Button
                        variant="outlined"
                        startIcon={<BarChartIcon />}
                        onClick={() => router.push('/revenue')}
                        fullWidth
                        sx={{
                          borderColor: '#DC143C',
                          color: '#DC143C',
                          fontWeight: 'bold',
                          borderRadius: '12px',
                          borderWidth: '2px',
                          py: 1.2,
                          '&:hover': {
                            borderColor: '#8B0000',
                            backgroundColor: 'rgba(220, 20, 60, 0.1)',
                            borderWidth: '2px',
                          },
                        }}
                      >
                        Xem thống kê
                      </Button>
                    )}
                    {user?.role === 'admin' && (
                      <Button
                        variant="outlined"
                        startIcon={<AttachMoneyIcon />}
                        onClick={() => router.push('/expense')}
                        fullWidth
                        sx={{
                          borderColor: '#FF4500',
                          color: '#FF4500',
                          fontWeight: 'bold',
                          borderRadius: '12px',
                          borderWidth: '2px',
                          py: 1.2,
                          '&:hover': {
                            borderColor: '#DC143C',
                            backgroundColor: 'rgba(255, 69, 0, 0.1)',
                            borderWidth: '2px',
                          },
                        }}
                      >
                        Quản lý Chi phí
                      </Button>
                    )}
                    {user?.role === 'admin' && (
                      <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => router.push('/setting')}
                        fullWidth
                        sx={{
                          borderColor: '#8B4513',
                          color: '#8B4513',
                          fontWeight: 'bold',
                          borderRadius: '12px',
                          borderWidth: '2px',
                          py: 1.2,
                          '&:hover': {
                            borderColor: '#654321',
                            backgroundColor: 'rgba(139, 69, 19, 0.1)',
                            borderWidth: '2px',
                          },
                        }}
                      >
                        Cài đặt hệ thống
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* User Info Card */}
            <Grid size={{ xs: 12 }}>
              <Card
                className="tet-card"
                sx={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.95) 100%)',
                  border: '2px solid #FFD700',
                  borderRadius: '16px',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Đang đăng nhập với tài khoản:
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 'bold' }}>
                        {user?.email}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: user?.role === 'admin' ? '#DC143C' : '#FF4500',
                          color: '#FFF',
                          borderRadius: '20px',
                          display: 'inline-block',
                          fontWeight: 'bold',
                        }}
                      >
                        {user?.role === 'admin' ? '👑 Admin' : '👤 Nhân viên'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#8B0000', fontStyle: 'italic' }}>
                      🎉 Chúc bạn làm việc hiệu quả trong năm mới!
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </SideBar>
    </Box>
  )
}

