'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { apiService, User } from '@/lib/api';
import { AppBar } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = apiService.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadUser();
  }, [router]);

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar 
        title="Dashboard"
        user={user}
        onLogout={handleLogout}
        icon={<DashboardIcon />}
      />

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 4,
          backgroundImage: 'url(/public/bg-bida.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography variant="h4" gutterBottom>
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
              <Typography variant="h6" gutterBottom>
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  onClick={() => router.push('/playtime')}
                >
                  Quản lý Giờ chơi
                </Button>
                {user?.role === 'admin' && <Button
                  variant="outlined"
                  startIcon={<DashboardIcon />}
                >
                  Xem thống kê
                </Button>}
                {user?.role === 'admin' && <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => router.push('/setting')}
                >
                  Cài đặt hệ thống
                </Button>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </Box>
  );
}
