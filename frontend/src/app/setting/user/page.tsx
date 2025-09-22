'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  IconButton as MuiIconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import {
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
  Person as StaffIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
} from '@mui/icons-material'
import { apiService, User } from '@/lib/api'
import SideBar from '@/app/SideBar'

interface UserFormData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'admin' | 'staff'
}

interface ExtendedUser extends User {
  role?: 'admin' | 'staff'
}

export default function UserSettingPage() {
  const router = useRouter()
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'staff',
  })
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  useEffect(() => {
    const token = apiService.getToken()
    if (!token) {
      router.push('/login')
      return
    }

    loadUser()
    loadUsers()
  }, [router])

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getUsers()
      setUsers(usersData.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      showSnackbar('Không thể tải danh sách người dùng', 'error')
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleOpenDialog = (user?: ExtendedUser) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role || 'staff',
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'staff',
      })
    }
    setOpenDialog(true)
    setShowPassword(false)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'staff',
    })
    setShowPassword(false)
  }

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email) {
      showSnackbar('Vui lòng điền đầy đủ thông tin bắt buộc', 'error')
      return
    }

    if (!editingUser && !formData.password) {
      showSnackbar('Vui lòng nhập mật khẩu cho người dùng mới', 'error')
      return
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      showSnackbar('Mật khẩu xác nhận không khớp', 'error')
      return
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData: Partial<UserFormData> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }

        if (formData.password) {
          updateData.password = formData.password
        }

        await apiService.updateUser(editingUser.id, updateData)
        showSnackbar('Cập nhật người dùng thành công!', 'success')
      } else {
        // Create new user
        await apiService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        })
        showSnackbar('Thêm người dùng mới thành công!', 'success')
      }

      handleCloseDialog()
      loadUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
      showSnackbar('Có lỗi xảy ra khi lưu người dùng', 'error')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (userId === user?.id) {
      showSnackbar('Không thể xóa tài khoản của chính mình', 'warning')
      return
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await apiService.deleteUser(userId)
        showSnackbar('Xóa người dùng thành công!', 'success')
        loadUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
        showSnackbar('Có lỗi xảy ra khi xóa người dùng', 'error')
      }
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

  const getRoleChip = (role: string) => {
    const isAdmin = role === 'admin'
    return (
      <Chip
        icon={isAdmin ? <AdminIcon /> : <StaffIcon />}
        label={isAdmin ? 'Quản trị viên' : 'Nhân viên'}
        color={isAdmin ? 'primary' : 'default'}
        variant="outlined"
        size="small"
      />
    )
  }

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Typography>Đang tải...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <SideBar title="Cài đặt hệ thống" href="/setting" user={user} icon={<PersonIcon />}>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Quản lý người dùng</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Thêm người dùng mới
          </Button>
        </Box>

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>{userItem.id}</TableCell>
                      <TableCell>{userItem.name}</TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>{getRoleChip(userItem.role || 'staff')}</TableCell>
                      <TableCell>
                        {new Date(userItem.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Sửa người dùng">
                            <MuiIconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(userItem)}
                            >
                              <EditIcon />
                            </MuiIconButton>
                          </Tooltip>
                          <Tooltip title="Xóa người dùng">
                            <span>
                              <MuiIconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(userItem.id)}
                                disabled={userItem.id === user?.id}
                              >
                                <DeleteIcon />
                              </MuiIconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tên người dùng"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={formData.role}
                label="Vai trò"
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <MenuItem value="staff">Nhân viên</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
              </Select>
            </FormControl>

            {!editingUser && (
              <>
                <TextField
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <HideIcon /> : <ViewIcon />}
                      </IconButton>
                    ),
                  }}
                />

                <TextField
                  label="Xác nhận mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                  fullWidth
                  required
                />
              </>
            )}

            {editingUser && (
              <TextField
                label="Mật khẩu mới (để trống nếu không thay đổi)"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <HideIcon /> : <ViewIcon />}
                    </IconButton>
                  ),
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.email}
          >
            {editingUser ? 'Cập nhật' : 'Thêm mới'}
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
      </SideBar>
    </Box>
  )
}
