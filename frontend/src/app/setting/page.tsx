'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Grid,
  CircularProgress,
} from '@mui/material'
import MuiListItemIcon from '@mui/material/ListItemIcon'
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  TableRestaurant as TableIcon,
  Restaurant as MenuIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material'
import { apiService, User } from '@/lib/api'
import SideBar from '@/app/SideBar'

export default function SettingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = apiService.getToken()
    if (!token) {
      router.push('/login')
      return
    }

    loadUser()
  }, [router])

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#DC143C' }} />
        <Typography sx={{ color: '#8B0000' }}>Đang tải...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <SideBar title="Cài đặt hệ thống" href="/setting" user={user} icon={<SettingsIcon />}>
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  border: '2px solid #FFD700',
                  borderRadius: '16px',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,248,220,0.95) 100%)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#8B0000',
                      fontWeight: 'bold',
                      mb: 2,
                      pb: 1,
                      borderBottom: '2px solid #FFD700',
                    }}
                  >
                    Cài đặt chung
                  </Typography>
                  <List>
                    {user && user.role === 'admin' && (
                      <ListItemButton
                        onClick={() => router.push('/setting/table')}
                        sx={{
                          border: '2px solid #FFD700',
                          borderRadius: '12px',
                          mb: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(220, 20, 60, 0.08)',
                            transform: 'translateX(5px)',
                            borderColor: '#DC143C',
                          },
                        }}
                      >
                        <MuiListItemIcon>
                          <TableIcon sx={{ color: '#DC143C' }} />
                        </MuiListItemIcon>
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 'bold', color: '#8B0000' }}>Quản lý bàn</Typography>}
                          secondary="Cài đặt số lượng bàn, tên bàn và giá theo giờ"
                        />
                      </ListItemButton>
                    )}

                    {user && user.role === 'admin' && (
                      <ListItemButton
                        onClick={() => router.push('/setting/user')}
                        sx={{
                          border: '2px solid #FFD700',
                          borderRadius: '12px',
                          mb: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(220, 20, 60, 0.08)',
                            transform: 'translateX(5px)',
                            borderColor: '#DC143C',
                          },
                        }}
                      >
                        <MuiListItemIcon>
                          <PersonIcon sx={{ color: '#FF4500' }} />
                        </MuiListItemIcon>
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 'bold', color: '#8B0000' }}>Cài đặt người dùng</Typography>}
                          secondary="Quản lý vai trò và quyền hạn người dùng"
                        />
                      </ListItemButton>
                    )}

                    <ListItemButton
                      onClick={() => router.push('/setting/menus')}
                      sx={{
                        border: '2px solid #FFD700',
                        borderRadius: '12px',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(220, 20, 60, 0.08)',
                          transform: 'translateX(5px)',
                          borderColor: '#DC143C',
                        },
                      }}
                    >
                      <MuiListItemIcon>
                        <MenuIcon sx={{ color: '#B8860B' }} />
                      </MuiListItemIcon>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 'bold', color: '#8B0000' }}>Thiết lập thực đơn</Typography>}
                        secondary="Quản lý món ăn và đồ uống"
                      />
                    </ListItemButton>

                    <ListItemButton
                      sx={{
                        border: '2px solid rgba(0,0,0,0.12)',
                        borderRadius: '12px',
                        mb: 2,
                        opacity: 0.6,
                        cursor: 'not-allowed',
                      }}
                      disabled
                    >
                      <MuiListItemIcon>
                        <SettingsIcon color="disabled" />
                      </MuiListItemIcon>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 'bold' }}>Cài đặt hệ thống</Typography>}
                        secondary="Cấu hình chung của hệ thống (Đang phát triển)"
                      />
                    </ListItemButton>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  border: '2px solid #FFD700',
                  borderRadius: '16px',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,248,220,0.95) 100%)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#8B0000',
                      fontWeight: 'bold',
                      mb: 2,
                      pb: 1,
                      borderBottom: '2px solid #FFD700',
                    }}
                  >
                    Thông tin hệ thống
                  </Typography>
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(220, 20, 60, 0.08)', borderRadius: '8px' }}>
                    <Typography variant="body2" sx={{ color: '#8B0000', mb: 1 }}>
                      <strong>Phiên bản:</strong> 1.0.0
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8B0000' }}>
                      <strong>Cập nhật:</strong> {new Date().toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<DashboardIcon />}
                    onClick={() => router.push('/dashboard')}
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
                      },
                    }}
                  >
                    Quay lại Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* User Info Card */}
              <Card
                sx={{
                  mt: 3,
                  border: '2px solid #FFD700',
                  borderRadius: '16px',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,248,220,0.95) 100%)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#8B0000',
                      fontWeight: 'bold',
                      mb: 2,
                      pb: 1,
                      borderBottom: '2px solid #FFD700',
                    }}
                  >
                    Tài khoản
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    Đang đăng nhập:
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#8B0000', fontWeight: 'bold', mb: 1 }}>
                    {user?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      backgroundColor: user?.role === 'admin' ? '#DC143C' : '#FF4500',
                      color: '#FFF',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  >
                    {user?.role === 'admin' ? 'Admin' : 'Nhân viên'}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    fullWidth
                    sx={{
                      borderColor: '#DC143C',
                      color: '#DC143C',
                      fontWeight: 'bold',
                      borderRadius: '12px',
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: '#8B0000',
                        backgroundColor: 'rgba(220, 20, 60, 0.08)',
                        borderWidth: '2px',
                      },
                    }}
                  >
                    Đăng xuất
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </SideBar>
    </Box>
  )
}

