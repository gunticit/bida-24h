'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { apiService } from '@/lib/api'
import { NotificationData } from '@/types/api'

interface RealtimeNotificationsProps {
  onNotificationCount?: (count: number) => void
}

export default function RealtimeNotifications({ onNotificationCount }: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await apiService.getNotifications()
      setNotifications(response.notifications)
      onNotificationCount?.(response.count)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      showSnackbar('Không thể tải thông báo', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      onNotificationCount?.(notifications.length - 1)
      showSnackbar('Đã đánh dấu thông báo đã đọc', 'success')
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      showSnackbar('Có lỗi xảy ra', 'error')
    }
  }

  // Clear all notifications
  const clearAll = async () => {
    try {
      await apiService.clearAllNotifications()
      setNotifications([])
      onNotificationCount?.(0)
      showSnackbar('Đã xóa tất cả thông báo', 'success')
    } catch (error) {
      console.error('Failed to clear notifications:', error)
      showSnackbar('Có lỗi xảy ra', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} ngày trước`
  }

  // Auto refresh every 10 seconds
  useEffect(() => {
    fetchNotifications()
    
    const interval = setInterval(() => {
      fetchNotifications()
    }, 10000) // Refresh every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
              <Typography variant="h6">
                Thông báo realtime
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={fetchNotifications}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
              
              {notifications.length > 0 && (
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={clearAll}
                  color="error"
                  variant="outlined"
                >
                  Xóa tất cả
                </Button>
              )}
            </Box>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!loading && notifications.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có thông báo mới
              </Typography>
            </Box>
          )}

          {!loading && notifications.length > 0 && (
            <List dense>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {notification.message}
                          </Typography>
                          <Chip 
                            label={notification.status} 
                            size="small" 
                            color="warning"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.requested_at)} - Bàn #{notification.table_id}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                        color="success"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}