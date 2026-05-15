import * as React from 'react'
import { useState } from 'react'
import { styled, useTheme, alpha } from '@mui/material'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { AppBar as AppBarDOM } from '@/components/ui'
import { dashboardMenuItems } from '@/config/dashboard/dashboardMenuItems'
import { apiService } from '@/lib/api'
import { useRouter } from 'next/navigation'
import LogoutIcon from '@mui/icons-material/Logout'

const drawerWidth = 260

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

  const handleDrawerOpen = () => setOpen(true)
  const handleDrawerClose = () => setOpen(false)

  const router = useRouter()
  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isExpanded = isMobile ? true : open
  const collapsedWidth = 72

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
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? 0 : open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? drawerWidth : (open ? drawerWidth : collapsedWidth),
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            background: '#fff',
            borderRight: '1px solid #e8e8e8',
          },
        }}
      >
        {/* Brand Header */}
        <DrawerHeader
          sx={{
            minHeight: '64px !important',
            px: isExpanded ? 2 : 1,
            justifyContent: isExpanded ? 'space-between' : 'center',
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          {isExpanded && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  boxShadow: '0 2px 8px rgba(220, 20, 60, 0.25)',
                  flexShrink: 0,
                }}
              >
                🎱
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography
                  sx={{
                    color: '#8B0000',
                    fontWeight: 800,
                    fontSize: '14px',
                    letterSpacing: '0.5px',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  24H BILLIARDS
                </Typography>
                <Typography
                  sx={{
                    color: '#999',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  COFFEE & MORE
                </Typography>
              </Box>
            </Box>
          )}
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              color: '#999',
              '&:hover': {
                color: '#8B0000',
                backgroundColor: 'rgba(220, 20, 60, 0.05)',
              },
            }}
          >
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>

        {/* Navigation */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 64px)',
            pt: 1.5,
          }}
        >
          {/* Menu Items */}
          <Box sx={{ flexGrow: 1, px: 1 }}>
            {dashboardMenuItems.map((item) => {
              if (item.admin && user?.role !== 'admin') return null

              const isActive = href === item.path

              const button = (
                <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => item.path && router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      px: isExpanded ? 2 : 0,
                      py: 1.2,
                      borderRadius: '12px',
                      justifyContent: isExpanded ? 'initial' : 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      // Active state
                      ...(isActive
                        ? {
                            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.08) 0%, rgba(255, 69, 0, 0.04) 100%)',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '3px',
                              height: '60%',
                              borderRadius: '0 4px 4px 0',
                              background: 'linear-gradient(180deg, #DC143C 0%, #8B0000 100%)',
                            },
                          }
                        : {}),
                      '&:hover': {
                        backgroundColor: isActive
                          ? 'rgba(220, 20, 60, 0.12)'
                          : 'rgba(0, 0, 0, 0.03)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        mr: isExpanded ? 2 : 0,
                        color: isActive ? '#DC143C' : '#888',
                        transition: 'color 0.2s ease',
                        '& .MuiSvgIcon-root': {
                          fontSize: 22,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {isExpanded && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          sx: {
                            color: isActive ? '#8B0000' : '#444',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '14px',
                            transition: 'color 0.2s ease',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              )

              // Wrap with Tooltip when collapsed
              if (!isExpanded) {
                return (
                  <Tooltip key={item.text} title={item.text} placement="right" arrow>
                    {button}
                  </Tooltip>
                )
              }

              return button
            })}
          </Box>

          {/* User info + Logout */}
          <Box
            sx={{
              borderTop: '1px solid #e8e8e8',
              px: 1,
              py: 1.5,
            }}
          >
            {/* User avatar row */}
            {isExpanded && user && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  mb: 1,
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#8B0000',
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Box>
                <Box sx={{ overflow: 'hidden', flex: 1 }}>
                  <Typography
                    sx={{
                      color: '#333',
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#999',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {user.role === 'admin' ? '👑 Quản trị viên' : '👤 Nhân viên'}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Logout button */}
            <Tooltip title={isExpanded ? '' : 'Đăng xuất'} placement="right" arrow>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 44,
                  borderRadius: '12px',
                  justifyContent: isExpanded ? 'initial' : 'center',
                  px: isExpanded ? 2 : 0,
                  '&:hover': {
                    backgroundColor: 'rgba(220, 20, 60, 0.15)',
                    '& .logout-icon': { color: '#ff4444' },
                    '& .logout-text': { color: '#ff4444' },
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  className="logout-icon"
                  sx={{
                    minWidth: 0,
                    justifyContent: 'center',
                    mr: isExpanded ? 2 : 0,
                    color: '#999',
                    transition: 'color 0.2s ease',
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText
                    className="logout-text"
                    primary="Đăng xuất"
                    primaryTypographyProps={{
                      sx: {
                        color: '#666',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'color 0.2s ease',
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </Box>
        </Box>
      </MuiDrawer>
      <Main
        open={open}
        sx={{
          flexGrow: 1,
          p: 3,
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
