'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const features = [
    {
      title: 'Laravel Backend',
      description: 'RESTful API với authentication, validation và database management',
      icon: <StorageIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Next.js Frontend',
      description: 'Modern React framework với App Router và TypeScript',
      icon: <CodeIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    },
    {
      title: 'Material-UI',
      description: 'Beautiful và responsive UI components từ Google Material Design',
      icon: <DashboardIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    },
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Phần mềm quản lý 24h Billiard
          </Typography>
          <Button color="inherit" startIcon={<LoginIcon />}>
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
          <List>
            <ListItem>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Đăng nhập" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Đăng ký" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <>
        <style>{`
          body {
            position: relative;
            background-image: url(/bg-bida.jpg);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
          }

          body::after {
            content: "";
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: lch(61 0.01 356.63 / 0.56);
            z-index: -1;
          }

          /* Đảm bảo rằng nội dung được hiển thị trên lớp phủ */
          #__next, .MuiContainer-root {
            position: relative;
            z-index: 1;
          }
        `}</style>
        <Container
          maxWidth="lg"
          sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Hero Section */}
            <Box sx={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '5px' }}>
            <Typography variant="h5" component="h5" gutterBottom>
              Chào mừng đến với
            </Typography>
            <Typography variant="h3" component="h2" color="primary" gutterBottom>
              Phần mềm quản lý 24h Billiard
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Quản lý giờ chơi, bàn, món ăn, đồ uống và tính toán tổng tiền
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button onClick={() => router.push('/playtime')} variant="contained" size="large" sx={{ mr: 2 }}>
          Bắt đầu
              </Button>
            </Box>
          </Box>
        </Container>
      </>
    </Box>
  );
}
