'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  OutlinedInput,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert as MuiAlert,
} from '@mui/material'
import {
  AdminPanelSettings as AdminIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  PersonOutline as StaffIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { apiService, User, UpdateProfileData } from '@/lib/api'
import { AppBar } from '@/components/ui'

type Severity = 'success' | 'error' | 'warning' | 'info'

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: 'error' | 'warning' | 'info' | 'success'
}

function evaluatePassword(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '', color: 'error' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const map: Record<number, PasswordStrength> = {
    0: { score: 0, label: 'Quá yếu', color: 'error' },
    1: { score: 1, label: 'Yếu', color: 'error' },
    2: { score: 2, label: 'Trung bình', color: 'warning' },
    3: { score: 3, label: 'Khá mạnh', color: 'info' },
    4: { score: 4, label: 'Rất mạnh', color: 'success' },
  }
  return map[score] ?? map[4]
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    severity: Severity
    message: string
  }>({ open: false, severity: 'info', message: '' })

  const isChangingPassword = !!(
    formData.currentPassword ||
    formData.newPassword ||
    formData.confirmPassword
  )

  const passwordStrength = useMemo(
    () => evaluatePassword(formData.newPassword),
    [formData.newPassword],
  )

  const passwordsMatch =
    formData.newPassword !== '' && formData.newPassword === formData.confirmPassword

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const userData = await apiService.getCurrentUser()
      setUser(userData)
      setFormData({
        name: userData.name,
        email: userData.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      showSnackbar('Không thể tải thông tin người dùng', 'error')
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange =
    (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const showSnackbar = (message: string, severity: Severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      showSnackbar('Tên không được để trống', 'error')
      return
    }
    if (!formData.email.trim()) {
      showSnackbar('Email không được để trống', 'error')
      return
    }

    if (isChangingPassword) {
      if (!formData.currentPassword) {
        showSnackbar('Vui lòng nhập mật khẩu hiện tại', 'error')
        return
      }
      if (!formData.newPassword) {
        showSnackbar('Vui lòng nhập mật khẩu mới', 'error')
        return
      }
      if (formData.newPassword.length < 8) {
        showSnackbar('Mật khẩu mới phải có ít nhất 8 ký tự', 'error')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        showSnackbar('Mật khẩu xác nhận không khớp', 'error')
        return
      }
      if (formData.newPassword === formData.currentPassword) {
        showSnackbar('Mật khẩu mới phải khác mật khẩu hiện tại', 'error')
        return
      }
    }

    try {
      setUpdating(true)

      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
      }

      if (isChangingPassword) {
        updateData.current_password = formData.currentPassword
        updateData.password = formData.newPassword
        updateData.password_confirmation = formData.confirmPassword
      }

      const response = await apiService.updateProfile(updateData)
      setUser(response.user)
      showSnackbar(response.message || 'Cập nhật thông tin thành công', 'success')

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin'
      showSnackbar(message, 'error')
      console.error('Error updating profile:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar title="Hồ sơ tài khoản" user={user} onLogout={handleLogout} icon={<PersonIcon />} />

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Profile hero */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 3,
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          <Avatar
            sx={{
              width: { xs: 64, md: 88 },
              height: { xs: 64, md: 88 },
              fontSize: { xs: 24, md: 32 },
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '3px solid rgba(255,255,255,0.35)',
            }}
          >
            {getInitials(user?.name || '')}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              {user?.email}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={isAdmin ? <AdminIcon /> : <StaffIcon />}
                label={isAdmin ? 'Quản trị viên' : 'Nhân viên'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: 'common.white',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: 'common.white' },
                }}
              />
              {user?.id && (
                <Chip
                  icon={<BadgeIcon />}
                  label={`ID #${user.id}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: 'common.white',
                    '& .MuiChip-icon': { color: 'common.white' },
                  }}
                />
              )}
              {user?.created_at && (
                <Chip
                  icon={<CalendarIcon />}
                  label={`Tạo ${new Date(user.created_at).toLocaleDateString('vi-VN')}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: 'common.white',
                    '& .MuiChip-icon': { color: 'common.white' },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
            }}
          >
            {/* Basic info card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Thông tin cơ bản
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tên hiển thị và email đăng nhập
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Paper>

            {/* Password card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'warning.main',
                    color: 'common.white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Đổi mật khẩu
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bỏ trống nếu không muốn thay đổi
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Mật khẩu hiện tại</InputLabel>
                  <OutlinedInput
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleInputChange('currentPassword')}
                    autoComplete="current-password"
                    label="Mật khẩu hiện tại"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                          size="small"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <Box>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Mật khẩu mới</InputLabel>
                    <OutlinedInput
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleInputChange('newPassword')}
                      autoComplete="new-password"
                      label="Mật khẩu mới"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                            size="small"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                  {formData.newPassword && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Độ mạnh
                        </Typography>
                        <Typography
                          variant="caption"
                          color={`${passwordStrength.color}.main`}
                          sx={{ fontWeight: 600 }}
                        >
                          {passwordStrength.label}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(passwordStrength.score / 4) * 100}
                        color={passwordStrength.color}
                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      />
                      <Typography
                        variant="caption"
                        color={
                          formData.newPassword.length < 8 ? 'error.main' : 'text.secondary'
                        }
                        sx={{ display: 'block', mt: 0.75 }}
                      >
                        Tối thiểu 8 ký tự, nên kèm chữ hoa, số và ký tự đặc biệt.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    error={!!formData.confirmPassword && !passwordsMatch}
                  >
                    <InputLabel>Xác nhận mật khẩu mới</InputLabel>
                    <OutlinedInput
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      autoComplete="new-password"
                      label="Xác nhận mật khẩu mới"
                      endAdornment={
                        <InputAdornment position="end">
                          {formData.confirmPassword && passwordsMatch && (
                            <CheckCircleIcon
                              fontSize="small"
                              color="success"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                  {formData.confirmPassword && !passwordsMatch && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.75, ml: 1.5 }}>
                      Mật khẩu xác nhận không khớp
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Save action */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {isChangingPassword
                ? 'Sau khi đổi mật khẩu, các phiên đăng nhập khác sẽ bị đăng xuất.'
                : 'Các trường có dấu * là bắt buộc.'}
            </Typography>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={updating}
              startIcon={updating ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              sx={{ minWidth: 180, fontWeight: 600 }}
            >
              {updating ? 'Đang lưu...' : 'Cập nhật thông tin'}
            </Button>
          </Paper>
        </form>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}
