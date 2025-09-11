'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { apiService, User, UpdateProfileData } from '@/lib/api'
import { AppBar } from '@/components/ui'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

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
      setError('Không thể tải thông tin người dùng')
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.name.trim()) {
      setError('Tên không được để trống')
      return
    }

    if (!formData.email.trim()) {
      setError('Email không được để trống')
      return
    }

    // Check if password is being changed
    const isChangingPassword =
      formData.newPassword || formData.confirmPassword || formData.currentPassword

    if (isChangingPassword) {
      if (!formData.currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại')
        return
      }

      if (!formData.newPassword) {
        setError('Vui lòng nhập mật khẩu mới')
        return
      }

      if (formData.newPassword.length < 8) {
        setError('Mật khẩu mới phải có ít nhất 8 ký tự')
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp')
        return
      }
    }

    try {
      setUpdating(true)

      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
      }

      // Only include password fields if password is being changed
      if (isChangingPassword) {
        updateData.current_password = formData.currentPassword
        updateData.password = formData.newPassword
        updateData.password_confirmation = formData.confirmPassword
      }

      const response = await apiService.updateProfile(updateData)

      setUser(response.user)
      setSuccess(response.message)

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin'
      setError(errorMessage)
      console.error('Error updating profile:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar title="Hồ sơ tài khoản" user={user} onLogout={handleLogout} icon={<PersonIcon />} />

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 4,
          backgroundImage: 'url(/public/bg-bida.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PersonIcon />
          Hồ sơ tài khoản
        </Typography>

        <Paper sx={{ p: 3, mt: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Information */}
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PersonIcon />
                  Thông tin cơ bản
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
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
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Password Section */}
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
                >
                  <LockIcon />
                  Thay đổi mật khẩu (tùy chọn)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Để thay đổi mật khẩu, vui lòng điền đầy đủ các trường bên dưới. Nếu không muốn
                  thay đổi mật khẩu, bạn có thể bỏ qua phần này.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Mật khẩu hiện tại</InputLabel>
                    <OutlinedInput
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={handleInputChange('currentPassword')}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Mật khẩu hiện tại"
                    />
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Mật khẩu mới</InputLabel>
                    <OutlinedInput
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleInputChange('newPassword')}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Mật khẩu mới"
                    />
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Xác nhận mật khẩu mới</InputLabel>
                    <OutlinedInput
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Xác nhận mật khẩu mới"
                    />
                  </FormControl>
                </Box>
              </Box>

              {/* Messages */}
              {error && (
                <Box>
                  <Alert severity="error">{error}</Alert>
                </Box>
              )}

              {success && (
                <Box>
                  <Alert severity="success">{success}</Alert>
                </Box>
              )}

              {/* Submit Button */}
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={updating}
                  sx={{ minWidth: 150 }}
                >
                  {updating ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật thông tin'
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}
