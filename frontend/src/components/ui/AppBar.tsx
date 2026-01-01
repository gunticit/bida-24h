'use client'

import { useState } from 'react'
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
} from '@mui/material'
import {
  Widgets as WidgetsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
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
const drawerWidth = 240

interface StyledAppBarProps extends MuiAppBarProps {
  open?: boolean
}

const CustomAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<StyledAppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: 'linear-gradient(90deg, #8B0000 0%, #DC143C 50%, #FF4500 100%)',
  borderBottom: '3px solid #FFD700',
  boxShadow: '0 4px 20px rgba(139, 0, 0, 0.3)',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
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
    </CustomAppBar>
  )
}

