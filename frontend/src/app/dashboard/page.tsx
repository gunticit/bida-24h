'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material'
import {
  Widgets as WidgetsIcon,
  Settings as SettingsIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material'
import { apiService, User } from '@/lib/api'
import SideBar from '@/app/SideBar'
import Loading from '@/components/loading/index'

export default function DashboardPage() {
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

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Loading />
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <SideBar title="Bảng điều khiển" href="/dashboard" user={user} icon={<WidgetsIcon />}>
        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" sx={{ fontSize: { sm: '18px', xs: '15px' } }} gutterBottom>
            Chào mừng, {user?.name}!
          </Typography>

          <Grid container spacing={3}>
            {/* System Status */}
            <Card sx={{ flexGrow: 1, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trạng thái hệ thống
                </Typography>
                <Grid container spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Backend API: <span style={{ color: 'green' }}>● Hoạt động</span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Database: <span style={{ color: 'green' }}>● Kết nối</span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Authentication: <span style={{ color: 'green' }}>● Đã đăng nhập</span>
                  </Typography>
                </Grid>
              </CardContent>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" gutterBottom></Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: { sm: 'auto', xs: '100%' },
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => router.push('/playtime')}
                    sx={{ width: { sm: 'auto', xs: '100%' } }}
                  >
                    Quản lý Giờ chơi
                  </Button>
                  {user?.role === 'admin' && (
                    <Button
                      variant="outlined"
                      startIcon={<BarChartIcon />}
                      onClick={() => router.push('/revenue')}
                      sx={{ width: { sm: 'auto', xs: '100%' } }}
                    >
                      Xem thống kê
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <Button
                      variant="outlined"
                      startIcon={<AttachMoneyIcon />}
                      onClick={() => router.push('/expense')}
                      sx={{ width: { sm: 'auto', xs: '100%' } }}
                    >
                      Quản lý Chi phí
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => router.push('/setting')}
                      sx={{ width: { sm: 'auto', xs: '100%' } }}
                    >
                      Cài đặt hệ thống
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Box>
      </SideBar>
    </Box>
  )
}
