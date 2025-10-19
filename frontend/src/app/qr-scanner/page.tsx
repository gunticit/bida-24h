'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material'
import {
  QrCodeScanner as QrCodeScannerIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { QRTableScanResponse } from '@/types/api'
import { formatMoney } from '@/utils/formatters'
import { apiService, User } from '@/lib/api'

export default function QRScannerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableId = searchParams.get('table')

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState<QRTableScanResponse | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  const loadUser = useCallback(async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      // Don't redirect to login for QR scanner - allow guest access
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    if (tableId) {
      handleScanTable(parseInt(tableId))
    }
  }, [tableId])

  // Auto refresh scan result every 30 seconds if there's an active session
  useEffect(() => {
    if (scanResult?.active_session && tableId) {
      const interval = setInterval(() => {
        handleScanTable(parseInt(tableId))
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [scanResult?.active_session, tableId])

  const handleScanTable = async (tableId: number) => {
    setLoading(true)
    try {
      const result = await apiService.scanQRTable(tableId)
      setScanResult(result)
      showSnackbar(`Đã quét thành công mã QR bàn ${result.table.name}`, 'success')
    } catch (error) {
      console.error('QR scan failed:', error)
      showSnackbar('Có lỗi xảy ra khi quét mã QR', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoBook = async () => {
    if (!scanResult) return
    
    setLoading(true)
    try {
      const result = await apiService.autoBookTable(scanResult.table.id)
      showSnackbar(result.message, 'success')
      
      // Refresh scan result to update status
      await handleScanTable(scanResult.table.id)
      
      // Redirect to playtime management
      setTimeout(() => {
        router.push('/playtime')
      }, 2000)
    } catch (error) {
      console.error('Auto booking failed:', error)
      showSnackbar('Có lỗi xảy ra khi đặt bàn tự động', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestBooking = async () => {
    if (!scanResult) return

    setLoading(true)
    try {
      const result = await apiService.requestTableBooking(scanResult.table.id)
      showSnackbar(result.message, 'success')
      setShowRequestDialog(false)
    } catch (error) {
      console.error('Booking request failed:', error)
      showSnackbar('Có lỗi xảy ra khi gửi yêu cầu đặt bàn', 'error')
    } finally {
      setLoading(false)
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

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes || minutes < 0) return '0h 0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <QrCodeScannerIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            QR Code Scanner
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quét mã QR trên bàn để kiểm tra trạng thái và đặt bàn
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {scanResult && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                  {scanResult.table.name}
                </Typography>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleScanTable(scanResult.table.id)}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Làm mới
                </Button>
                <Chip
                  icon={
                    scanResult.is_available ? (
                      <CheckCircleIcon />
                    ) : (
                      <ErrorIcon />
                    )
                  }
                  label={
                    scanResult.table.status === 'available'
                      ? 'Sẵn sàng'
                      : scanResult.table.status === 'playing'
                        ? 'Đang chơi'
                        : 'Bảo trì'
                  }
                  color={
                    scanResult.table.status === 'available'
                      ? 'success'
                      : scanResult.table.status === 'playing'
                        ? 'warning'
                        : 'error'
                  }
                />
              </Box>

              <Typography variant="body1" gutterBottom>
                <strong>Giá:</strong> {formatMoney(scanResult.table.price_per_hour)}/giờ
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Trạng thái:</strong> {scanResult.is_available ? 'Có thể đặt bàn' : 'Không thể đặt bàn'}
              </Typography>

              {scanResult.active_session && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Phiên chơi hiện tại
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body2">
                      Thời gian chơi: {scanResult.active_session.duration_minutes ? formatDuration(scanResult.active_session.duration_minutes) : 'Đang tính...'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Bắt đầu: {new Date(scanResult.active_session.start_time).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              )}

              {scanResult.user && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Thông tin người dùng
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="body2">
                      {scanResult.user.name} ({scanResult.user.role})
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                {scanResult.can_auto_book && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAutoBook}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    Đặt bàn ngay
                  </Button>
                )}

                {scanResult.can_request_booking && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<NotificationsIcon />}
                    onClick={() => setShowRequestDialog(true)}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    Thông báo nhân viên
                  </Button>
                )}

                {!scanResult.is_available && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => router.push('/playtime')}
                    sx={{ flex: 1 }}
                  >
                    Xem quản lý bàn
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {!scanResult && !loading && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Chưa có dữ liệu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng quét mã QR trên bàn hoặc truy cập link từ mã QR
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Simple Request Confirmation Dialog */}
      <Dialog open={showRequestDialog} onClose={() => setShowRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon color="primary" />
            Thông báo nhân viên
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn muốn thông báo cho nhân viên để được hỗ trợ đặt bàn <strong>{scanResult?.table.name}</strong>?
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'info.light', 
            borderRadius: 1,
            color: 'info.contrastText'
          }}>
            <Typography variant="body2">
              💡 Nhân viên sẽ nhận được thông báo realtime và đến hỗ trợ bạn ngay lập tức.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRequestDialog(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleRequestBooking}
            variant="contained"
            color="primary"
            startIcon={<NotificationsIcon />}
            disabled={loading}
          >
            Gửi thông báo
          </Button>
        </DialogActions>
      </Dialog>

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