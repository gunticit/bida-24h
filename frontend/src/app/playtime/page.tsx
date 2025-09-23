'use client'

import { useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
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
  MenuItem,
  Chip,
  IconButton as MuiIconButton,
  Alert,
  Snackbar,
  Autocomplete,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Restaurant as FoodIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  TakeoutDining as TakeawayIcon,
  RestaurantMenu as RestaurantIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material'
import { apiService } from '@/lib/api'
import { StatisticsCards } from '@/components/playtime'
import { formatDateTime, formatMoney, calculatePlayTime, formatCurrency } from '@/utils/formatters'
import { getStatusText } from '@/utils/sessionHelpers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import SideBar from '@/app/SideBar'
import usePlaytime from '@/hook/playtime'
import Loading from '@/components/loading'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function PlaytimePage() {
  const {
    router,
    user,
    loading,
    sessions,
    tables,
    openDialog,
    editingSession,
    formData,
    menus,
    openFoodDialog,
    openFoodListDialog,
    selectedSession,
    foodFormData,
    sessionOrders,
    openInvoiceDialog,
    invoiceData,
    snackbar,
    viewMode,
    setViewMode,
    loadUser,
    loadSessions,
    loadTables,
    loadMenus,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleStatusChange,
    handleOpenFoodDialog,
    handleCloseFoodDialog,
    handleAddFood,
    handleViewFoodList,
    handleCloseFoodListDialog,
    setSnackbar,
    getStatusColorLocal,
    getCategoryChipLocal,
    handleDeleteFood,
    handleOpenInvoiceDialog,
    handleCloseInvoiceDialog,
    handlePrintInvoice,
    showSnackbar,
    handleRedirectTakeAway,
    handleRedirectDineIn,
    setFormData,
    setFoodFormData,
    recalculateFoodTotal,
    handleExportExcel,
  } = usePlaytime()

  useEffect(() => {
    const token = apiService.getToken()
    if (!token) {
      router.push('/login')
      return
    }

    loadUser()
    loadSessions()
    loadTables()
    loadMenus()
  }, [router])

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Loading />
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1, position: 'relative'}}>
      <SideBar title="Quản lý Giờ chơi" href="/playtime" user={user} icon={<CalendarIcon />}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h6" gutterBottom>
              Quản lý Giờ chơi
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RestaurantIcon />}
                onClick={() => handleRedirectDineIn()}
              >
                Đặt đồ ăn tại chỗ
              </Button>
              <Button
                variant="outlined"
                startIcon={<TakeawayIcon />}
                onClick={() => handleRedirectTakeAway()}
              >
                Đặt đồ ăn mang về
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Tạo giờ chơi mới
              </Button>
            </Box>
          </Box>

          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button
              variant={viewMode === 'todayOrPlaying' ? 'contained' : 'outlined'}
              onClick={() => {
                setViewMode('todayOrPlaying')
                loadSessions('todayOrPlaying')
              }}
              size="small"
            >
              Hôm nay + Đang chơi
            </Button>
            <Button
              variant={viewMode === 'playingOrLast7Days' ? 'contained' : 'outlined'}
              onClick={() => {
                setViewMode('playingOrLast7Days')
                loadSessions('playingOrLast7Days')
              }}
              size="small"
            >
              Đang chơi + 7 ngày qua
            </Button>
          </Box>

          {/* Statistics Cards */}
          <StatisticsCards sessions={sessions} />

          {/* Sessions Table */}
          <Card>
            <CardContent sx={{ p: 0, m: 0, pb: '0!important' }}>
              <TableContainer component={Paper}>
                <MuiTable>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Bàn</TableCell>
                      <TableCell>Thời gian bắt đầu</TableCell>
                      <TableCell>Thời gian kết thúc</TableCell>
                      <TableCell>Thời gian chơi</TableCell>
                      <TableCell>Giá/giờ</TableCell>
                      <TableCell>Tiền bàn</TableCell>
                      <TableCell>Tiền đồ ăn</TableCell>
                      <TableCell>Tổng tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Chưa có session nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.id}</TableCell>
                          <TableCell>{session.table?.name || `Bàn ${session.table_id}`}</TableCell>
                          <TableCell>{formatDateTime(session.start_time)}</TableCell>
                          <TableCell>
                            {session.end_time ? formatDateTime(session.end_time) : '-'}
                          </TableCell>
                          <TableCell>
                            {session.total_time
                              ? `${Math.floor(session.total_time / 60)}h ${session.total_time % 60}p`
                              : '-'}
                          </TableCell>
                          <TableCell>{formatMoney(session.hour_price)}</TableCell>
                          <TableCell>{formatMoney(session.total_money_table)}</TableCell>
                          <TableCell>{formatMoney(session.total_money_food)}</TableCell>
                          <TableCell>{formatMoney(session.total_money)}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(session.status)}
                              color={getStatusColorLocal(session.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <MuiIconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleViewFoodList(session)}
                                title="Xem món ăn"
                              >
                                <ViewIcon />
                              </MuiIconButton>
                              <MuiIconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(session)}
                                title="Chỉnh sửa"
                              >
                                <EditIcon />
                              </MuiIconButton>
                              {user?.role === 'admin' && (
                                <MuiIconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(session.id)}
                                  title="Xóa"
                                >
                                  <DeleteIcon />
                                </MuiIconButton>
                              )}
                              {session.status === 'playing' && (
                                <>
                                  <MuiIconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleStatusChange(session, 'finished')}
                                    title="Kết thúc"
                                  >
                                    <CheckCircleIcon />
                                  </MuiIconButton>
                                  <MuiIconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handleStatusChange(session, 'canceled')}
                                    title="Hủy"
                                  >
                                    <CancelIcon />
                                  </MuiIconButton>
                                  <MuiIconButton
                                    size="small"
                                    color="info"
                                    onClick={() => handleOpenFoodDialog(session)}
                                    title="Thêm món ăn"
                                  >
                                    <FoodIcon />
                                  </MuiIconButton>
                                </>
                              )}
                              <MuiIconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenInvoiceDialog(session)}
                                title="In hóa đơn"
                              >
                                <PrintIcon />
                              </MuiIconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </MuiTable>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingSession ? 'Chỉnh sửa giờ chơi' : 'Thêm giờ chơi mới'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Chọn bàn</InputLabel>
                <Select
                  value={formData.table_id}
                  label="Chọn bàn"
                  onChange={(e) => {
                    const tableId = e.target.value as number
                    const selectedTable = tables.find((t) => t.id === tableId)
                    setFormData({
                      ...formData,
                      table_id: tableId,
                      hour_price: selectedTable?.price_per_hour || formData.hour_price,
                    })
                  }}
                >
                  {tables.map((table) => (
                    <MenuItem
                      disabled={table.status !== 'available'}
                      key={table.id}
                      value={table.id}
                    >
                      {table.name} -{' '}
                      {table.status === 'available'
                        ? 'Sẵn sàng'
                        : table.status === 'playing'
                          ? 'Đang chơi'
                          : 'Bảo trì'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={'Thời gian bắt đầu (GMT+7)' + formData.start_time}
                type="datetime-local"
                value={
                  formData.start_time
                    ? (() => {
                        // Nếu là dạng ISO, chuyển sang yyyy-MM-ddTHH:mm
                        const d = new Date(formData.start_time)
                        const year = d.getFullYear()
                        const month = String(d.getMonth() + 1).padStart(2, '0')
                        const day = String(d.getDate()).padStart(2, '0')
                        const hour = String(d.getHours()).padStart(2, '0')
                        const minute = String(d.getMinutes()).padStart(2, '0')
                        return `${year}-${month}-${day}T${hour}:${minute}`
                      })()
                    : ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    start_time: e.target.value,
                  })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Giá/giờ (đ)"
                type="number"
                value={parseInt(formData.hour_price.toString()).toLocaleString('vi-VN')}
                onChange={(e) => setFormData({ ...formData, hour_price: parseInt(e.target.value) })}
                fullWidth
                InputProps={{ readOnly: true, disabled: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingSession ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Food Dialog */}
        <Dialog open={openFoodDialog} onClose={handleCloseFoodDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Thêm món ăn cho giờ chơi #{selectedSession?.id}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Autocomplete
                options={menus}
                getOptionLabel={(option) =>
                  `${option.name} - ${parseInt(option?.price?.toString()).toLocaleString('vi-VN')} đ`
                }
                value={menus.find((menu) => menu.id === foodFormData.menu_id) || null}
                onChange={(_, newValue) => {
                  setFoodFormData({
                    ...foodFormData,
                    menu_id: newValue ? newValue.id : 0,
                  })
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Chọn món ăn" placeholder="Tìm kiếm món ăn..." />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {getCategoryChipLocal(option.category)}
                        <span style={{ flex: 1 }}>
                          {option.name} - {formatCurrency(option?.price)}
                        </span>
                        {option.quantity <= 5 && (
                          <Chip
                            label={`Còn ${option.quantity}`}
                            size="small"
                            color={option.quantity === 0 ? 'error' : 'warning'}
                          />
                        )}
                      </Box>
                    </Box>
                  )
                }}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(
                    (option) =>
                      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.category.toLowerCase().includes(inputValue.toLowerCase()),
                  )
                }}
                noOptionsText="Không tìm thấy món ăn"
                fullWidth
              />

              <TextField
                label="Số lượng"
                type="number"
                value={foodFormData.quantity}
                onChange={(e) =>
                  setFoodFormData({ ...foodFormData, quantity: parseInt(e.target.value) || 1 })
                }
                fullWidth
                inputProps={{ min: 1 }}
              />

              {foodFormData.menu_id > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Tổng tiền:{' '}
                  {(() => {
                    const selectedMenu = menus.find((menu) => menu.id === foodFormData.menu_id)
                    return selectedMenu
                      ? (selectedMenu.price * foodFormData.quantity).toLocaleString('vi-VN') + ' đ'
                      : '0 đ'
                  })()}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFoodDialog}>Hủy</Button>
            <Button
              onClick={handleAddFood}
              variant="contained"
              disabled={foodFormData.menu_id === 0 || foodFormData.quantity <= 0}
            >
              Thêm món ăn
            </Button>
          </DialogActions>
        </Dialog>

        {/* Food List Dialog */}
        <Dialog
          open={openFoodListDialog}
          onClose={handleCloseFoodListDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Danh sách món ăn - Giờ chơi #{selectedSession?.id}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {sessionOrders.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  Chưa có món ăn nào được đặt
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <MuiTable>
                    <TableHead>
                      <TableRow>
                        <TableCell>Món ăn</TableCell>
                        <TableCell>Số lượng</TableCell>
                        <TableCell>Đơn giá</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                        <TableCell>Thời gian đặt</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessionOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            {menus.find((menu) => menu.id === order.menu_id)?.name ||
                              `Món ${order.menu_id}`}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            {parseFloat(order.unit_price.toString()).toLocaleString('vi-VN')} đ
                          </TableCell>
                          <TableCell>
                            {parseFloat(order.total_price.toString()).toLocaleString('vi-VN')} đ
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            <MuiIconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteFood(order.id, order.session_id)}
                              title="Xóa món ăn"
                            >
                              <DeleteIcon />
                            </MuiIconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </MuiTable>
                </TableContainer>
              )}

              {sessionOrders.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Tổng kết
                  </Typography>
                  <Typography variant="body1">
                    Tổng tiền đồ ăn:{' '}
                    <strong>
                      {sessionOrders
                        .reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0)
                        .toLocaleString('vi-VN')}{' '}
                      đ
                    </strong>
                  </Typography>
                  <Typography variant="body1">
                    Số món đã đặt: <strong>{sessionOrders.length}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={async () => {
                if (selectedSession) {
                  const newTotal = await recalculateFoodTotal(selectedSession.id)
                  showSnackbar(
                    `Đã tính lại tổng tiền đồ ăn: ${parseFloat(newTotal.toString()).toLocaleString('vi-VN')} đ`,
                    'success',
                  )
                  loadSessions() // Reload để cập nhật dữ liệu
                }
              }}
              variant="outlined"
              color="primary"
            >
              Tính lại tổng tiền
            </Button>
            <Button onClick={handleCloseFoodListDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={openInvoiceDialog} onClose={handleCloseInvoiceDialog} maxWidth="md" fullWidth>
          <DialogTitle>Hóa đơn - Giờ chơi #{invoiceData.session?.id}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ mb: 1, flex: '0 0 48%', boxSizing: 'border-box' }}>
                  <strong>Bàn:</strong>{' '}
                  {tables.find((t) => t.id === invoiceData.session?.table_id)?.name || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, flex: '0 0 48%', boxSizing: 'border-box' }}>
                  <strong>Giá/giờ:</strong>{' '}
                  {parseInt(invoiceData.session?.hour_price.toString() || '0').toLocaleString(
                    'vi-VN',
                  )}{' '}
                  đ
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, flex: '0 0 48%', boxSizing: 'border-box' }}>
                  <strong>Thời gian bắt đầu:</strong>{' '}
                  {invoiceData.session?.start_time
                    ? new Date(invoiceData.session.start_time).toLocaleString('vi-VN')
                    : 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, flex: '0 0 48%', boxSizing: 'border-box' }}>
                  <strong>Thời gian kết thúc:</strong>{' '}
                  {invoiceData.session?.end_time
                    ? new Date(invoiceData.session.end_time).toLocaleString('vi-VN')
                    : 'Đang chơi'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, flex: '0 0 48%', boxSizing: 'border-box' }}>
                  <strong>Thời gian chơi:</strong>{' '}
                  {invoiceData.session ? calculatePlayTime(invoiceData.session) : 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, flex: '0 0 48%', boxSizing: 'border-box' }}>
                  <strong>Tiền bàn:</strong>{' '}
                  {parseInt(invoiceData.totalTableMoney.toString()).toLocaleString('vi-VN')} đ
                </Typography>
              </Box>

              {invoiceData.orders.length > 0 && (
                <>
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <MuiTable>
                      <TableHead>
                        <TableRow>
                          <TableCell>Món ăn</TableCell>
                          <TableCell>Số lượng</TableCell>
                          <TableCell>Đơn giá</TableCell>
                          <TableCell>Thành tiền</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoiceData.orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              {menus.find((menu) => menu.id === order.menu_id)?.name ||
                                `Món ${order.menu_id}`}
                            </TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>
                              {parseFloat(order.unit_price.toString()).toLocaleString('vi-VN')} đ
                            </TableCell>
                            <TableCell>
                              {parseFloat(order.total_price.toString()).toLocaleString('vi-VN')} đ
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </MuiTable>
                  </TableContainer>
                </>
              )}

              <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Typography variant="body1" sx={{ mb: 1, flex: '0 0 50%', borderRight: '1px solid #ccc' }}>
                    Tiền bàn:{' '}
                    <strong style={{ color: '#1976d2' }}>
                      {parseInt(invoiceData.totalTableMoney.toString()).toLocaleString('vi-VN')} đ
                    </strong>
                  </Typography>
                  {invoiceData.orders.length > 0 && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Tiền đồ ăn:{' '}
                      <strong style={{ color: '#1976d2' }}>
                        {parseInt(invoiceData.totalFoodMoney.toString()).toLocaleString('vi-VN')} đ
                      </strong>
                    </Typography>
                  )}
                </Box>
                <Box sx={{ mt: 1, pt: 2, borderTop: '2px solid #1976d2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="h6"  >
                    TỔNG CỘNG:{' '}
                    <strong style={{ color: '#1976d2' }}>
                      {parseInt(invoiceData.totalMoney.toString()).toLocaleString('vi-VN')} đ
                    </strong>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInvoiceDialog}>Đóng</Button>
            <Button onClick={handlePrintInvoice} variant="contained" color="primary">
              In hóa đơn
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
              severity: snackbar.severity === 'warning' ? 'info' : snackbar.severity,
            })
          }
        >
          <Alert
            onClose={() =>
              setSnackbar({
                ...snackbar,
                open: false,
                severity: snackbar.severity === 'warning' ? 'info' : snackbar.severity,
              })
            }
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </SideBar>
      <Box sx={{ position: 'fixed', display: 'flex', flexDirection: 'column', bottom: '50%', right: 16, zIndex: 10, gap: 2 }}>
        <Button 
            variant="outlined"
            onClick={handleExportExcel}
            sx={{ width: { sm: 'auto', xs: '100%' }, p: 1 }}
            title="Xuất Excel"
        >
          <CloudDownloadIcon />
        </Button>
      </Box>
    </Box>
  )
}
