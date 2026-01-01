'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Hàm tạo số ngẫu nhiên với seed cố định để tránh hydration mismatch
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Chỉ render các phần tử random sau khi component đã mount ở client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  // Tạo các chấm lấp lánh với giá trị seed cố định  
  const sparkleElements = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: seededRandom(i * 4 + 100) * 100,
      top: seededRandom(i * 4 + 101) * 100,
      delay: seededRandom(i * 4 + 102) * 2,
    })), []
  )

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* CSS Animation cho hoa đào rơi */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg) translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(30px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) rotate(360deg) translateX(-20px);
            opacity: 0;
          }
        }

        @keyframes sway {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 100, 100, 0.4); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        body {
          position: relative;
          background: linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #FF4500 50%, #FF6347 75%, #FFA07A 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          min-height: 100vh;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.3) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        #__next, .MuiContainer-root {
          position: relative;
          z-index: 1;
        }

        .sparkle-dot {
          position: fixed;
          width: 4px;
          height: 4px;
          background: gold;
          border-radius: 50%;
          animation: sparkle 2s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Các chấm lấp lánh - chỉ render sau khi mount ở client */}
      {isMounted && sparkleElements.map((sparkle) => (
        <Box
          key={`sparkle-${sparkle.id}`}
          className="sparkle-dot"
          sx={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}

      {/* App Bar với màu Tết */}
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(90deg, #8B0000 0%, #DC143C 50%, #B22222 100%)',
          boxShadow: '0 4px 20px rgba(139, 0, 0, 0.4)',
          borderBottom: '3px solid #FFD700',
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
              }
            }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            🏮 Phần mềm quản lý 24h Billiard 🏮
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            sx={{
              border: '1px solid #FFD700',
              borderRadius: '20px',
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                borderColor: '#FFF',
              }
            }}
          >
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer với theme Tết */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box
          sx={{
            width: 280,
            height: '100%',
            background: 'linear-gradient(180deg, #8B0000 0%, #DC143C 100%)',
            color: '#FFF',
          }}
          role="presentation"
          onClick={toggleDrawer}
        >
          {/* Header Drawer */}
          <Box sx={{
            p: 3,
            textAlign: 'center',
            borderBottom: '2px solid #FFD700',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
              🧧 Menu 🧧
            </Typography>
            <Typography variant="body2" sx={{ color: '#FFB6C1', mt: 1 }}>
              Chúc Mừng Năm Mới 2026
            </Typography>
          </Box>
          <List>
            <ListItem sx={{ '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' } }}>
              <ListItemIcon sx={{ color: '#FFD700' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" sx={{ color: '#FFF' }} />
            </ListItem>
            <ListItem sx={{ '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' } }}>
              <ListItemIcon sx={{ color: '#FFD700' }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" sx={{ color: '#FFF' }} />
            </ListItem>
            <Divider sx={{ backgroundColor: 'rgba(255, 215, 0, 0.3)', my: 1 }} />
            <ListItem sx={{ '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' } }}>
              <ListItemIcon sx={{ color: '#FFD700' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Đăng nhập" sx={{ color: '#FFF' }} />
            </ListItem>
            <ListItem sx={{ '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' } }}>
              <ListItemIcon sx={{ color: '#FFD700' }}>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Đăng ký" sx={{ color: '#FFF' }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        {/* Hero Section với theme Tết */}
        <Box
          sx={{
            textAlign: 'center',
            padding: { xs: '20px', md: '50px' },
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.95) 100%)',
            borderRadius: '20px',
            border: '4px solid #FFD700',
            boxShadow: '0 10px 40px rgba(139, 0, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.1)',
            animation: 'glow 3s ease-in-out infinite',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '700px',
            width: '100%',
          }}
        >
          {/* Decorative corners */}
          <Box sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: '2rem',
            animation: 'sway 3s ease-in-out infinite',
          }}>
            🌸
          </Box>
          <Box sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: '2rem',
            animation: 'sway 3s ease-in-out infinite',
            animationDelay: '1.5s',
          }}>
            🌸
          </Box>
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            fontSize: '2rem',
            animation: 'sway 3s ease-in-out infinite',
            animationDelay: '0.5s',
          }}>
            🏮
          </Box>
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            fontSize: '2rem',
            animation: 'sway 3s ease-in-out infinite',
            animationDelay: '2s',
          }}>
            🧧
          </Box>

          {/* Lời chúc Tết */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: '#DC143C',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(220, 20, 60, 0.2)',
              mb: 1,
            }}
          >
            🎊 Chúc Mừng Năm Mới 2026 🎊
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#B22222',
              fontStyle: 'italic',
              mb: 2,
            }}
          >
            ✨ An Khang Thịnh Vượng - Vạn Sự Như Ý ✨
          </Typography>

          <Divider sx={{
            my: 2,
            backgroundColor: '#FFD700',
            height: 2,
            width: '60%',
            mx: 'auto',
          }} />

          <Typography
            variant="h5"
            component="h5"
            gutterBottom
            sx={{ color: '#8B4513' }}
          >
            Chào mừng đến với
          </Typography>

          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #8B0000, #DC143C, #FF4500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 'bold',
              fontSize: { xs: '1.8rem', md: '2.5rem' },
            }}
          >
            Phần mềm quản lý 24h Billiard
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <DotLottieReact src="/ai-powered.lottie" style={{ width: 250, height: 250 }} />
          </Box>

          <Typography
            variant="h6"
            paragraph
            sx={{
              color: '#696969',
              mt: 2,
            }}
          >
            🎱 Quản lý giờ chơi, bàn, món ăn, đồ uống và tính toán tiền
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              onClick={() => router.push('/playtime')}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #DC143C 0%, #FF4500 50%, #FFD700 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease infinite',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                px: 5,
                py: 1.5,
                borderRadius: '30px',
                border: '2px solid #FFD700',
                boxShadow: '0 4px 15px rgba(220, 20, 60, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(220, 20, 60, 0.5)',
                },
              }}
            >
              🚀 Bắt Đầu Năm Mới
            </Button>
          </Box>

          {/* Footer message */}
          <Typography
            variant="body2"
            sx={{
              mt: 4,
              color: '#8B0000',
              fontWeight: 500,
            }}
          >
            Năm 2026 - Phát Lộc Phát Tài
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
