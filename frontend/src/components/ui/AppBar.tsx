'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Toolbar,
  Link,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Box,
  Typography,
  Badge,
  Tooltip,
  Snackbar,
  Popover,
  Alert,
} from '@mui/material'
import {
  Widgets as WidgetsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'

interface User {
  id: number
  name: string
  role?: string
  email: string
}

interface AppBarProps {
  title: string
  href?: string
  user: User | null
  onLogout: () => void
  icon?: React.ReactNode
  open?: boolean
  handleDrawerOpen: () => void
}
import { styled } from '@mui/material/styles'
const collapsedWidth = 72
const expandedWidth = 260

interface StyledAppBarProps extends MuiAppBarProps {
  open?: boolean
}

const CustomAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<StyledAppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer - 1,
  background: 'linear-gradient(90deg, #8B0000 0%, #DC143C 50%, #FF4500 100%)',
  borderBottom: '3px solid #FFD700',
  boxShadow: '0 4px 20px rgba(139, 0, 0, 0.3)',
  marginLeft: open ? expandedWidth : collapsedWidth,
  width: `calc(100% - ${open ? expandedWidth : collapsedWidth}px)`,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
  },
}))

export default function AppBar({
  title,
  href,
  user,
  onLogout,
  icon,
  open,
  handleDrawerOpen,
}: AppBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    onLogout()
  }

  // === Notification polling for new QR orders ===
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [notifToast, setNotifToast] = useState({ open: false, msg: '' });
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const prevCountRef = useRef(0);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (startTime: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      };
      playBeep(ctx.currentTime, 880);
      playBeep(ctx.currentTime + 0.35, 1100);
      playBeep(ctx.currentTime + 0.7, 1320);
    } catch (e) { console.warn('Audio not supported', e); }
  }, []);

  useEffect(() => {
    const API_BASE = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL || 'https://api.24hbilliardscoffee.com/api'
      : 'http://localhost:8001/api';

    const checkOrders = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        if (!res.ok) return;
        const orders = await res.json();
        const pending = (orders as any[]).filter((o: any) => o.status === 'pending');
        const newCount = pending.length;

        if (newCount > prevCountRef.current && prevCountRef.current >= 0) {
          const diff = newCount - prevCountRef.current;
          if (prevCountRef.current > 0 || pendingCount > 0) {
            playNotificationSound();
            setNotifToast({ open: true, msg: `🔔 Có ${diff} đơn hàng mới từ khách! Vui lòng kiểm tra.` });
          }
        }
        prevCountRef.current = newCount;
        setPendingCount(newCount);
        setPendingOrders(pending);
      } catch (e) { /* ignore */ }
    };

    checkOrders();
    const interval = setInterval(checkOrders, 10000);
    return () => clearInterval(interval);
  }, [playNotificationSound]);

  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  // Group pending orders by session_id
  const groupedOrders = pendingOrders.reduce((acc: Record<number, any[]>, o: any) => {
    const sid = o.session_id;
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(o);
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <CustomAppBar position="fixed" open={open}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            borderRight: '2px solid #FFD700',
            borderColor: '#FFD700',
            pr: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
            },
            ...(open && { display: 'none' }),
          }}
        >
          <MenuIcon sx={{ color: '#FFD700' }} />
        </IconButton>
        <Link
          href={href}
          sx={{
            color: '#FFD700',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            '&:hover': {
              color: '#FFF',
            },
          }}
        >
          {icon && <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>{icon}</Box>}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🏮</span>
            <span>{title}</span>
            <span>🏮</span>
          </Box>
        </Link>

        {/* Tet greeting - hidden on mobile */}

        {/* Notification Bell */}
        <Tooltip title={pendingCount > 0 ? `${pendingCount} đơn hàng chờ xác nhận` : 'Không có thông báo'}>
          <IconButton
            color="inherit"
            onClick={handleNotifOpen}
            sx={{ mr: 1, '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' } }}
          >
            <Badge
              badgeContent={pendingCount}
              sx={{
                '& .MuiBadge-badge': {
                  background: pendingCount > 0 ? '#ff1744' : 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  ...(pendingCount > 0 && {
                    animation: 'pulse 1.5s infinite',
                  }),
                },
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.15)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              <NotificationsIcon sx={{ color: '#FFD700', fontSize: 26 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Notification Popover */}
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 360,
              maxHeight: 420,
              borderRadius: 3,
              border: '2px solid #FFD700',
              boxShadow: '0 8px 32px rgba(0,0,0,.2)',
              overflow: 'hidden',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, background: 'linear-gradient(90deg, #8B0000, #DC143C)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#FFD700', fontWeight: 700, fontSize: 15 }}>🔔 Thông báo đơn hàng</Typography>
            <Typography sx={{ color: 'rgba(255,215,0,.7)', fontSize: 12 }}>{pendingCount} đang chờ</Typography>
          </Box>
          <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
            {pendingCount === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 40, color: '#ddd', mb: 1 }} />
                <Typography sx={{ color: '#999', fontSize: 14 }}>Không có đơn hàng nào đang chờ</Typography>
              </Box>
            ) : (
              Object.entries(groupedOrders).map(([sessionId, orders]) => {
                const firstOrder = (orders as any[])[0];
                const tableName = firstOrder?.session?.table?.name || `Bàn ?`;
                const createdAt = firstOrder?.created_at ? new Date(firstOrder.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <Box
                    key={sessionId}
                    onClick={() => { handleNotifClose(); router.push('/playtime'); }}
                    sx={{
                      px: 2, py: 1.5,
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      '&:hover': { background: 'rgba(220,20,60,.05)' },
                      transition: 'background .15s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: .5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#8B0000' }}>
                        🍽 {tableName} - Giờ chơi #{sessionId}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#999' }}>{createdAt}</Typography>
                    </Box>
                    {(orders as any[]).map((o: any) => (
                      <Box key={o.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 1, py: .3 }}>
                        <Typography sx={{ fontSize: 13, color: '#333' }}>
                          {o.menu?.name || `Món #${o.menu_id}`} <span style={{ color: '#999' }}>x{o.quantity}</span>
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#ff9800', fontWeight: 600, background: 'rgba(255,152,0,.1)', px: 1, py: .2, borderRadius: 1 }}>Chờ</Typography>
                      </Box>
                    ))}
                  </Box>
                );
              })
            )}
          </Box>
          {pendingCount > 0 && (
            <Box sx={{ borderTop: '1px solid #eee', px: 2, py: 1 }}>
              <Typography
                onClick={() => { handleNotifClose(); router.push('/playtime'); }}
                sx={{ color: '#DC143C', fontWeight: 600, fontSize: 13, textAlign: 'center', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Xem tất cả tại trang Giờ chơi →
              </Typography>
            </Box>
          )}
        </Popover>

        <IconButton
          size="large"
          edge="end"
          color="inherit"
          onClick={handleMenuOpen}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: '2px solid #FFD700',
              color: '#8B0000',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.5)',
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: 'linear-gradient(145deg, #FFF 0%, #FFF8DC 100%)',
              border: '2px solid #FFD700',
              borderRadius: '12px',
              boxShadow: 'unset',
              minWidth: 200,
              paddingTop: '0 !important'
            },
          }}
        >
          {/* User info header */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: '#8B0000', fontWeight: 'bold' }}>
              👋 Xin chào, {user?.name}!
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {user?.email}
            </Typography>
          </Box>
          <Divider sx={{ backgroundColor: '#FFD700' }} />

          <MenuItem
            onClick={() => router.push('/dashboard')}
            sx={{
              '&:hover': { backgroundColor: 'rgba(220, 20, 60, 0.1)' },
            }}
          >
            <ListItemIcon>
              <WidgetsIcon fontSize="small" sx={{ color: '#fffff' }} />
            </ListItemIcon>
            <Typography sx={{ color: '#8B0000' }}>Bảng điều khiển</Typography>
          </MenuItem>
          {user?.role === 'admin' && (
            <MenuItem
              onClick={() => {
                handleMenuClose()
                router.push('/revenue')
              }}
              sx={{
                '&:hover': { backgroundColor: 'rgba(220, 20, 60, 0.1)' },
              }}
            >
              <ListItemIcon>
                <BarChartIcon fontSize="small" sx={{ color: '#FF4500' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#8B0000' }}>Thống kê doanh thu</Typography>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              handleMenuClose()
              router.push('/setting/profile')
            }}
            sx={{
              '&:hover': { backgroundColor: 'rgba(220, 20, 60, 0.1)' },
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: '#8B4513' }} />
            </ListItemIcon>
            <Typography sx={{ color: '#8B0000' }}>Hồ sơ</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => router.push('/setting')}
            sx={{
              '&:hover': { backgroundColor: 'rgba(220, 20, 60, 0.1)' },
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: '#666' }} />
            </ListItemIcon>
            <Typography sx={{ color: '#8B0000' }}>Cài đặt</Typography>
          </MenuItem>
          <Divider sx={{ backgroundColor: '#FFD700' }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              '&:hover': { backgroundColor: 'rgba(220, 20, 60, 0.15)' },
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#DC143C' }} />
            </ListItemIcon>
            <Typography sx={{ color: '#DC143C', fontWeight: 'bold' }}>Đăng xuất</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Notification Toast */}
      <Snackbar
        open={notifToast.open}
        autoHideDuration={6000}
        onClose={() => setNotifToast({ ...notifToast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 7 }}
      >
        <Alert
          onClose={() => setNotifToast({ ...notifToast, open: false })}
          severity="info"
          variant="filled"
          sx={{ fontWeight: 600, fontSize: 14, borderRadius: 3 }}
        >
          {notifToast.msg}
        </Alert>
      </Snackbar>
    </CustomAppBar>
  )
}

