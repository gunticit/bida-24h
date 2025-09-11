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
  MenuItem,
  Table as MuiTable,
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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TableRestaurant as TableIcon,
} from '@mui/icons-material'
import { apiService, User, Table } from '@/lib/api'
import { AppBar } from '@/components/ui'

interface TableFormData {
  name: string
  status: 'available' | 'playing' | 'maintenance'
  price_per_hour: number | string
}

export default function TableSettingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<Table[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState<TableFormData>({
    name: '',
    status: 'available',
    price_per_hour: 0,
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
    loadTables()
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

  const loadTables = async () => {
    try {
      const tablesData = await apiService.getTables()
      setTables(tablesData)
    } catch (error) {
      console.error('Failed to load tables:', error)
      showSnackbar('Không thể tải danh sách bàn', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table)
      setFormData({
        name: table.name,
        status: table.status,
        price_per_hour: table.price_per_hour,
      })
    } else {
      setEditingTable(null)
      setFormData({
        name: '',
        status: 'available',
        price_per_hour: 0,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingTable(null)
    setFormData({
      name: '',
      status: 'available',
      price_per_hour: 0,
    })
  }

  const handleInputChange = (field: keyof TableFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      if (editingTable) {
        // Update existing table
        await apiService.updateTable(editingTable.id, formData)
        showSnackbar('Cập nhật bàn thành công!', 'success')
      } else {
        // Create new table
        await apiService.createTable(formData)
        showSnackbar('Thêm bàn mới thành công!', 'success')
      }

      handleCloseDialog()
      loadTables()
    } catch (error) {
      console.error('Failed to save table:', error)
      showSnackbar('Có lỗi xảy ra khi lưu bàn', 'error')
    }
  }

  const handleDeleteTable = async (tableId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      try {
        await apiService.deleteTable(tableId)
        showSnackbar('Xóa bàn thành công!', 'success')
        loadTables()
      } catch (error) {
        console.error('Failed to delete table:', error)
        showSnackbar('Có lỗi xảy ra khi xóa bàn', 'error')
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
      <AppBar
        title="Quản lý cài đặt bàn"
        user={user}
        onLogout={handleLogout}
        icon={<TableIcon />}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Quản lý cài đặt bàn</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Thêm bàn mới
          </Button>
        </Box>

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <MuiTable>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tên bàn</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Giá theo giờ (VNĐ)</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell>{table.id}</TableCell>
                      <TableCell>{table.name}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            backgroundColor:
                              table.status === 'available'
                                ? '#e8f5e8'
                                : table.status === 'playing'
                                  ? '#fff3e0'
                                  : '#ffebee',
                            color:
                              table.status === 'available'
                                ? '#2e7d32'
                                : table.status === 'playing'
                                  ? '#f57c00'
                                  : '#c62828',
                          }}
                        >
                          {table.status === 'available'
                            ? 'Sẵn sàng'
                            : table.status === 'playing'
                              ? 'Đang chơi'
                              : 'Bảo trì'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {parseFloat(table.price_per_hour.toString()).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {new Date(table.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Sửa bàn">
                            <MuiIconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(table)}
                            >
                              <EditIcon />
                            </MuiIconButton>
                          </Tooltip>
                          <Tooltip title="Xóa bàn">
                            <MuiIconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTable(table.id)}
                            >
                              <DeleteIcon />
                            </MuiIconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </MuiTable>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTable ? 'Sửa bàn' : 'Thêm bàn mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tên bàn"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="available">Sẵn sàng</MenuItem>
                <MenuItem value="playing">Đang chơi</MenuItem>
                <MenuItem value="maintenance">Bảo trì</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Giá theo giờ (VNĐ)"
              type="number"
              value={
                typeof formData.price_per_hour === 'number'
                  ? parseInt(formData.price_per_hour.toString()).toString()
                  : formData.price_per_hour
              }
              onChange={(e) => handleInputChange('price_per_hour', parseInt(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0, step: 10000 }}
            />
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
            disabled={!formData.name || formData.price_per_hour <= 0}
          >
            {editingTable ? 'Cập nhật' : 'Thêm mới'}
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
