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
  List,
  ListItemButton,
  ListItemText
} from '@mui/material';
import MuiListItemIcon from '@mui/material/ListItemIcon';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  TableRestaurant as TableIcon,
  Restaurant as MenuIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { apiService, User } from '@/lib/api';
import { AppBar } from '@/components/ui';

export default function SettingPage() {
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
        title="Cài đặt hệ thống"
        user={user}
        onLogout={handleLogout}
        icon={<SettingsIcon />}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
         CÀI ĐẶT HỆ THỐNG
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cài đặt chung
                </Typography>
                <List>
                  <ListItemButton 
                    onClick={() => router.push('/setting/table')}
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <MuiListItemIcon>
                      <TableIcon color="primary" />
                    </MuiListItemIcon>
                    <ListItemText 
                      primary="Quản lý bàn" 
                      secondary="Cài đặt số lượng bàn, tên bàn và giá theo giờ"
                    />
                  </ListItemButton>
                  
                  <ListItemButton 
                    onClick={() => router.push('/setting/user')}
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <MuiListItemIcon>
                      <PersonIcon color="primary" />
                    </MuiListItemIcon>
                    <ListItemText 
                      primary="Cài đặt người dùng" 
                      secondary="Quản lý vai trò và quyền hạn người dùng"
                    />
                  </ListItemButton>
                  
                  <ListItemButton
                    onClick={() => router.push('/setting/menus')}
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <MuiListItemIcon>
                      <MenuIcon color="primary" />
                    </MuiListItemIcon>
                    <ListItemText 
                      primary="Thiết lập thực đơn" 
                      secondary="Quản lý món ăn và đồ uống"
                    />
                  </ListItemButton>
                  
                  <ListItemButton
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      opacity: 0.6,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <MuiListItemIcon>
                      <SettingsIcon color="disabled" />
                    </MuiListItemIcon>
                    <ListItemText 
                      primary="Cài đặt hệ thống" 
                      secondary="Cấu hình chung của hệ thống"
                    />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin hệ thống
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Phiên bản: 1.0.0
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DashboardIcon />}
                  onClick={() => router.push('/dashboard')}
                  fullWidth
                >
                  Quay lại Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
