'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Paper,
  Chip,
  IconButton,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon,
  ShoppingCart as CartIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { apiService, User, MenuItem as MenuItemType, TakeawayOrder } from '@/lib/api'
import { AppBar } from '@/components/ui'
import { formatMoney, formatDateTime } from '@/utils/formatters'
import { generateTakeawayInvoiceContent, printTakeawayInvoice } from '@/utils/takeawayInvoiceUtils'
import { printTakeawayReport } from '@/utils/takeawayReportUtils'
import { useRouter } from 'next/navigation'
import { CreateTakeawayOrderData } from '@/lib/api'

interface CartItem {
  menu_id: number
  menu_name: string
  price: number
  quantity: number
}

interface ApiError {
  response?: {
    data?: {
      error?: string
      message?: string
    }
  }
  message?: string
}

export default function TakeawayPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [takeawayMenus, setTakeawayMenus] = useState<MenuItemType[]>([])
  const [takeawayOrders, setTakeawayOrders] = useState<TakeawayOrder[]>([])
  const [filteredMenus, setFilteredMenus] = useState<MenuItemType[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Date range states for report
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().slice(0, 16)
  })
  const [toDate, setToDate] = useState(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return today.toISOString().slice(0, 16)
  })
  const [reportLoading, setReportLoading] = useState(false)

  // Form states
  const [openDialog, setOpenDialog] = useState(false)
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<TakeawayOrder | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const router = useRouter()

  useEffect(() => {
    loadUserData()
    loadTakeawayMenus()
    loadTakeawayOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter menus based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMenus(takeawayMenus)
    } else {
      const filtered = takeawayMenus.filter((menu) =>
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredMenus(filtered)
    }
  }, [takeawayMenus, searchQuery])

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const loadUserData = async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user data:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadTakeawayMenus = async () => {
    try {
      const menusData = await apiService.getAvailableMenus()
      const takeawayItems = menusData.filter((menu) => menu.category === 'takeaway')
      setTakeawayMenus(takeawayItems)
    } catch (error) {
      console.error('Failed to load takeaway menus:', error)
      showSnackbar('Không thể tải danh sách món mang về', 'error')
    }
  }

  const loadTakeawayOrders = async () => {
    try {
      const ordersData = await apiService.getTodayTakeawayOrders()
      setTakeawayOrders(ordersData)
    } catch (error) {
      console.error('Failed to load takeaway orders:', error)
      showSnackbar('Không thể tải danh sách đơn hàng mang về', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const addToCart = (menu: MenuItemType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menu_id === menu.id)
      if (existing) {
        return prev.map((item) =>
          item.menu_id === menu.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        return [
          ...prev,
          {
            menu_id: menu.id,
            menu_name: menu.name,
            price: menu.price,
            quantity: 1,
          },
        ]
      }
    })
  }

  const removeFromCart = (menu_id: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menu_id === menu_id)
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.menu_id === menu_id ? { ...item, quantity: item.quantity - 1 } : item,
        )
      } else {
        return prev.filter((item) => item.menu_id !== menu_id)
      }
    })
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleOpenDialog = () => {
    if (cart.length === 0) {
      showSnackbar('Vui lòng thêm ít nhất 1 món vào giỏ hàng', 'error')
      return
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCustomerName('')
    setCustomerPhone('')
    setNotes('')
  }

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      showSnackbar('Giỏ hàng trống', 'error')
      return
    }

    try {
      const orderData: CreateTakeawayOrderData = {
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
        })),
        status: 'completed',
      }

      await apiService.createTakeawayOrder(orderData)
      showSnackbar('Tạo đơn hàng thành công!')

      // Reset form
      handleCloseDialog()
      clearCart()

      // Reload orders and menus to get updated quantities
      await Promise.all([loadTakeawayOrders(), loadTakeawayMenus()])
    } catch (error) {
      console.error('Failed to create takeaway order:', error)

      // Extract error message from backend response
      let errorMessage = 'Không thể tạo đơn hàng'
      const apiError = error as ApiError

      if (apiError?.response?.data?.error) {
        errorMessage = apiError.response.data.error
      } else if (apiError?.response?.data?.message) {
        errorMessage = apiError.response.data.message
      } else if (apiError?.message) {
        errorMessage = apiError.message
      }

      showSnackbar(errorMessage, 'error')
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: TakeawayOrder['status']) => {
    try {
      await apiService.updateTakeawayOrderStatus(orderId, newStatus)
      showSnackbar('Cập nhật trạng thái thành công!')
      await loadTakeawayOrders()
    } catch (error) {
      console.error('Failed to update order status:', error)
      const apiError = error as ApiError
      const errorMessage =
        apiError?.response?.data?.error ||
        apiError?.response?.data?.message ||
        apiError?.message ||
        'Không thể cập nhật trạng thái'
      showSnackbar(errorMessage, 'error')
    }
  }

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return

    try {
      await apiService.deleteTakeawayOrder(orderId)
      showSnackbar('Xóa đơn hàng thành công!')
      await Promise.all([loadTakeawayOrders(), loadTakeawayMenus()]) // Reload menus to update quantities
    } catch (error) {
      console.error('Failed to delete order:', error)
      const apiError = error as ApiError
      const errorMessage =
        apiError?.response?.data?.error ||
        apiError?.response?.data?.message ||
        apiError?.message ||
        'Không thể xóa đơn hàng'
      showSnackbar(errorMessage, 'error')
    }
  }

  const getStatusColor = (status: TakeawayOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'preparing':
        return 'info'
      case 'ready':
        return 'success'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: TakeawayOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý'
      case 'preparing':
        return 'Đang chuẩn bị'
      case 'ready':
        return 'Sẵn sàng'
      case 'completed':
        return 'Hoàn thành'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  const handleOpenInvoiceDialog = (order: TakeawayOrder) => {
    setSelectedOrder(order)
    setOpenInvoiceDialog(true)
  }

  const handleCloseInvoiceDialog = () => {
    setOpenInvoiceDialog(false)
    setSelectedOrder(null)
  }

  const handlePrintTakeawayInvoice = async () => {
    if (!selectedOrder) return

    try {
      const content = await generateTakeawayInvoiceContent(selectedOrder)
      printTakeawayInvoice(content)
    } catch (error) {
      console.error('Lỗi tạo hóa đơn:', error)
      showSnackbar('Không thể tạo hóa đơn', 'error')
    }
  }

  // Handle download report
  const handleDownloadReport = async () => {
    if (!fromDate || !toDate) {
      showSnackbar('Vui lòng chọn khoảng thời gian', 'error')
      return
    }

    const from = new Date(fromDate)
    const to = new Date(toDate)
    
    if (from > to) {
      showSnackbar('Ngày bắt đầu phải nhỏ hơn ngày kết thúc', 'error')
      return
    }

    setReportLoading(true)
    try {
      await apiService.downloadTakeawayReport(fromDate, toDate)
      showSnackbar('Tải báo cáo thành công!')
    } catch (error) {
      console.error('Failed to download report:', error)
      const apiError = error as ApiError
      const errorMessage = apiError?.response?.data?.error || 
                          apiError?.response?.data?.message || 
                          apiError?.message || 
                          'Không thể tải báo cáo'
      showSnackbar(errorMessage, 'error')
    } finally {
      setReportLoading(false)
    }
  }

  // Handle print report
  const handlePrintReport = async () => {
    if (!fromDate || !toDate) {
      showSnackbar('Vui lòng chọn khoảng thời gian', 'error')
      return
    }

    const from = new Date(fromDate)
    const to = new Date(toDate)
    
    if (from > to) {
      showSnackbar('Ngày bắt đầu phải nhỏ hơn ngày kết thúc', 'error')
      return
    }

    setReportLoading(true)
    try {
      const reportData = await apiService.getTakeawayReportData(fromDate, toDate)
      printTakeawayReport(reportData)
      showSnackbar('In báo cáo thành công!')
    } catch (error) {
      console.error('Failed to print report:', error)
      const apiError = error as ApiError
      const errorMessage = apiError?.response?.data?.error || 
                          apiError?.response?.data?.message || 
                          apiError?.message || 
                          'Không thể in báo cáo'
      showSnackbar(errorMessage, 'error')
    } finally {
      setReportLoading(false)
    }
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar title="Đặt hàng mang về" user={user} onLogout={handleLogout} />
      
      {/*Date Range Filter and Download Buttons*/}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'white', borderBottom: '1px solid #ddd' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            type="datetime-local"
            label="Từ ngày giờ"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ m: 3, width: '250px' }}
          />  
          <TextField
            type="datetime-local"
            label="Đến ngày giờ"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ m: 3, width: '250px' }}
          />  
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ m: 3 }}
            onClick={handleDownloadReport}
            disabled={reportLoading || !fromDate || !toDate}
          >
            {reportLoading ? 'Đang tải...' : 'Tải báo cáo Excel'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            sx={{ m: 3 }}
            onClick={handlePrintReport}
            disabled={reportLoading || !fromDate || !toDate}
          >
            In báo cáo
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ReplyIcon />}
            onClick={() => router.push('/playtime')}
          >
            Quay lại
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Menu Section */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '80vh', overflowY: 'auto' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <FoodIcon sx={{ mr: 1 }} />
                  Thực đơn mang về
                </Typography>

                {/* Search Box */}
                <Box>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Tìm kiếm món ăn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    height: '60vh',
                    overflowY: 'auto',
                  }}
                >
                  {filteredMenus.map((menu) => (
                    <Box key={menu.id} sx={{ minWidth: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {menu.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formatMoney(menu.price)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={menu.quantity > 0 ? 'success.main' : 'error.main'}
                          >
                            Còn lại: {menu.quantity}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => addToCart(menu)}
                              disabled={menu.quantity <= 0}
                              startIcon={<AddIcon />}
                            >
                              Thêm
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Cart Section */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: '80vh', overflowY: 'auto' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CartIcon sx={{ mr: 1 }} />
                    Giỏ hàng ({cart.length})
                  </Typography>
                  {cart.length > 0 && (
                    <Button size="small" onClick={clearCart} color="error">
                      Xóa tất cả
                    </Button>
                  )}
                </Box>

                {cart.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Giỏ hàng trống
                  </Typography>
                ) : (
                  <>
                    <List>
                      {cart.map((item) => (
                        <React.Fragment key={item.menu_id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={item.menu_name}
                              secondary={`${formatMoney(item.price)} x ${item.quantity} = ${formatMoney(item.price * item.quantity)}`}
                            />
                            <Box>
                              <IconButton size="small" onClick={() => removeFromCart(item.menu_id)}>
                                <RemoveIcon />
                              </IconButton>
                              <Typography component="span" sx={{ mx: 1 }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  addToCart(takeawayMenus.find((m) => m.id === item.menu_id)!)
                                }
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>

                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="h6" textAlign="center">
                        Tổng cộng: {formatMoney(getTotalAmount())}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleOpenDialog}
                      sx={{ mt: 2 }}
                    >
                      Đặt hàng
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Orders Section */}
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Đơn hàng hôm nay
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đơn</TableCell>
                      <TableCell>Chi tiết</TableCell>
                      <TableCell>Tổng tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thời gian đặt</TableCell>
                      <TableCell>Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {takeawayOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>
                          {order.items?.map((item, index) => (
                            <Typography key={index} variant="caption" display="block">
                              {item.menu?.name} x{item.quantity}
                            </Typography>
                          ))}
                        </TableCell>
                        <TableCell>{formatMoney(order.total_amount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(order.status)}
                            color={
                              getStatusColor(order.status) as
                                | 'success'
                                | 'error'
                                | 'warning'
                                | 'info'
                                | 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDateTime(order.order_date)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {order.status === 'pending' && (
                              <Button
                                size="small"
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                              >
                                Chuẩn bị
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="small"
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                              >
                                Sẵn sàng
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="small"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                              >
                                Hoàn thành
                              </Button>
                            )}
                            {['pending', 'cancelled'].includes(order.status) && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteOrder(order.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                            {order.status === 'completed' && (
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => handleOpenInvoiceDialog(order)}
                                title="In hóa đơn"
                              >
                                <PrintIcon />
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Order Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thông tin khách hàng</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên khách hàng"
            fullWidth
            variant="outlined"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Số điện thoại"
            fullWidth
            variant="outlined"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Ghi chú"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleCreateOrder} variant="contained">
            Tạo đơn hàng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={openInvoiceDialog} onClose={handleCloseInvoiceDialog} maxWidth="md" fullWidth>
        <DialogTitle>Hóa đơn mang về - Đơn #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Thời gian đặt:</strong> {formatDateTime(selectedOrder.order_date)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Khách hàng:</strong> {selectedOrder.customer_name || 'Không có thông tin'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Số điện thoại:</strong>{' '}
                  {selectedOrder.customer_phone || 'Không có thông tin'}
                </Typography>
                {selectedOrder.notes && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Ghi chú:</strong> {selectedOrder.notes}
                  </Typography>
                )}
                <Typography variant="body1">
                  <strong>Trạng thái:</strong> {getStatusText(selectedOrder.status)}
                </Typography>
              </Box>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Chi tiết đơn hàng
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Món</TableCell>
                          <TableCell align="center">Số lượng</TableCell>
                          <TableCell align="right">Đơn giá</TableCell>
                          <TableCell align="right">Thành tiền</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.menu?.name || `Món ${item.menu_id}`}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">{formatMoney(item.price)}</TableCell>
                            <TableCell align="right">{formatMoney(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  TỔNG CỘNG: {formatMoney(selectedOrder.total_amount)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvoiceDialog}>Đóng</Button>
          <Button onClick={handlePrintTakeawayInvoice} variant="contained" color="primary">
            In hóa đơn
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
