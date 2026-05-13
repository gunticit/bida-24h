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
  QrCode2 as QrCodeIcon,
} from '@mui/icons-material'
import { apiService, User, Table } from '@/lib/api'
import SideBar from '@/app/SideBar'
import { formatMoney } from '@/utils/formatters'
import { QRCodeSVG } from 'qrcode.react'
import ConfirmDialog from '@/components/playtime/ConfirmDialog'

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
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrTable, setQrTable] = useState<Table | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
    severity?: 'warning' | 'error' | 'info'
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => { },
    severity: 'warning',
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
      // Đảm bảo price_per_hour là number
      const price = typeof formData.price_per_hour === 'string' ? parseInt(formData.price_per_hour) : formData.price_per_hour
      const dataToSend = {
        ...formData,
        price_per_hour: price,
      }
      if (editingTable) {
        await apiService.updateTable(editingTable.id, dataToSend)
        showSnackbar('Cập nhật bàn thành công!', 'success')
      } else {
        await apiService.createTable(dataToSend)
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
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa bàn',
      message: 'Bạn có chắc chắn muốn xóa bàn này? Hành động này không thể hoàn tác.',
      severity: 'error',
      onConfirm: async () => {
        try {
          await apiService.deleteTable(tableId)
          showSnackbar('Xóa bàn thành công!', 'success')
          loadTables()
        } catch (error) {
          console.error('Failed to delete table:', error)
          showSnackbar('Có lỗi xảy ra khi xóa bàn', 'error')
        }
        closeConfirmDialog()
      },
    })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      onConfirm: () => { },
      severity: 'warning',
    })
  }

  const handleShowQrCode = async (table: Table) => {
    setQrTable(table)
    setQrDialogOpen(true)
  }
  const handleCloseQrDialog = () => {
    setQrDialogOpen(false)
    setQrTable(null)
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
      <SideBar title="Cài đặt" href="/setting" user={user} icon={<TableIcon />}>
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
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
                        <TableCell>{formatMoney(table.price_per_hour)}</TableCell>
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
                            <Tooltip title="Mã QR bàn">
                              <MuiIconButton
                                size="small"
                                color="success"
                                onClick={() => handleShowQrCode(table)}
                              >
                                <QrCodeIcon />
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
              disabled={!formData.name || Number(formData.price_per_hour) <= 0}
            >
              {editingTable ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog hiển thị QR code */}
        <Dialog open={qrDialogOpen} onClose={handleCloseQrDialog} maxWidth="xs" fullWidth>
          <DialogTitle>Mã QR bàn: {qrTable?.name}</DialogTitle>
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            {qrTable ? (
              <Box sx={{ textAlign: 'center' }}>
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/qr/${qrTable.qr_token}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <a href={`/qr/${qrTable.qr_token}`} target="_blank" rel="noopener noreferrer">
                    Nhấp vào đây để mở trang đặt món (Test trên máy tính)
                  </a>
                </Typography>
              </Box>
            ) : (
              <Typography>Đang tải mã QR...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQrDialog}>Đóng</Button>
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

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          severity={confirmDialog.severity}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmDialog}
        />
      </SideBar>
    </Box>
  )
}
