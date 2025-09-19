'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Box,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
} from '@mui/icons-material'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

interface User {
  id: number
  name: string
  role?: string
  email: string
}

interface AppBarProps {
  title: string
  user: User | null
  onLogout: () => void
  icon?: React.ReactNode
  open?: boolean
  handleDrawerOpen: () => void
}
import { styled } from '@mui/material/styles'
const drawerWidth = 240

interface StyledAppBarProps extends MuiAppBarProps {
  open?: boolean;
}
 
const CustomAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<StyledAppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
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
}));

export default function AppBar({
  title,
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
          sx={{ marginRight: 5, ...(open && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
        {icon && <Box sx={{ mr: 2 }}>{icon}</Box>}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton size="large" edge="end" color="inherit" onClick={handleMenuOpen}>
          <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.charAt(0) || 'U'}</Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => router.push('/dashboard')}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            Dashboard
          </MenuItem>
          {user?.role === 'admin' && (
            <MenuItem
              onClick={() => {
                handleMenuClose()
                router.push('/revenue')
              }}
            >
              <ListItemIcon>
                <BarChartIcon fontSize="small" />
              </ListItemIcon>
              Thống kê doanh thu
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              handleMenuClose()
              router.push('/setting/profile')
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Hồ sơ
          </MenuItem>
          <MenuItem onClick={() => router.push('/setting')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Cài đặt
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Đăng xuất
          </MenuItem>
        </Menu>
      </Toolbar>
    </CustomAppBar>
  )
}
