import * as React from 'react'
import { useState, useEffect } from 'react'
import { styled, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import useMediaQuery from '@mui/material/useMediaQuery'
import { AppBar as AppBarDOM } from '@/components/ui'
import { dashboardMenuItems } from '@/config/dashboard/dashboardMenuItems'
import Button from '@mui/material/Button'
import { apiService } from '@/lib/api'
import { useRouter } from 'next/navigation'
import LogoutIcon from '@mui/icons-material/Logout'

const drawerWidth = 240

interface User {
  id: number
  name: string
  email: string
  role?: string
  [key: string]: unknown
}

interface SideBarProps {
  title: string
  href?: string
  icon?: React.ReactNode
  user?: User | null
  children?: React.ReactNode
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}))

export default function SideBar({ title, href, icon, user, children }: SideBarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  const handleDrawerOpen = () => {
    console.log('Opening drawer, isMobile:', isMobile)
    setOpen(true)
  }
  const handleDrawerClose = () => {
    console.log('Closing drawer')
    setOpen(false)
  }

  const router = useRouter()
  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBarDOM
        title={title}
        user={user || null}
        onLogout={handleLogout}
        icon={icon}
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        href={href}
      />
      <MuiDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={handleDrawerClose}
        anchor="left"
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: isMobile ? 0 : open ? drawerWidth : theme.spacing(8),
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            ...(isMobile
              ? {}
              : {
                  width: open ? drawerWidth : theme.spacing(8),
                }),
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {dashboardMenuItems.map((item) => {
              if (item.admin && user?.role !== 'admin') return null

              const isExpanded = isMobile ? true : open
              const isActive = href === item.path

              return (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    sx={{
                      height: 70,
                      px: 2.5,
                      justifyContent: isExpanded ? 'initial' : 'center',
                      backgroundColor: isActive ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                      color: isActive ? 'primary.main' : 'inherit',
                      '&:hover': {
                        backgroundColor: isActive
                          ? 'rgba(25, 118, 210, 0.2)'
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                      borderRight: isActive ? `3px solid ${theme.palette.primary.main}` : 'none',
                    }}
                    onClick={() => item.path && router.push(item.path)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        mr: isExpanded ? 3 : 'auto',
                        color: isActive ? 'primary.main' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: isExpanded ? 1 : 0,
                        color: isActive ? 'primary.main' : 'inherit',
                        fontWeight: isActive ? 'bold' : 'normal',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </Box>
          <Button
            onClick={handleLogout}
            sx={{
              height: 70,
              display: 'flex',
              px: 2.5,
              justifyContent: 'center',
              textAlign: 'center',
              width: 'calc(100% - 16px)',
              borderTop: '1px solid',
            }}
          >
            <LogoutIcon fontSize="small" />
            {open && 'Đăng xuất'}
          </Button>
        </Box>
      </MuiDrawer>
      <Main
        open={open}
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: isMobile ? 0 : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  )
}
