import { useState } from 'react'
import { Chip } from '@mui/material'
import {
  Restaurant as FoodIcon,
  LocalBar as DrinkIcon,
  SmokingRooms as TobaccoIcon,
  TakeoutDining as TakeawayIcon,
} from '@mui/icons-material'
import type {
  User,
  GameSession,
  CreateSessionData,
  UpdateSessionData,
  Table,
  Order,
  FoodData,
  MenuItem as MenuItemType,
} from '@/types/api'
import { apiService } from '@/lib/api'
import { generateInvoiceContent } from '@/utils/invoiceUtils'
import { printInvoice } from '@/utils/printHelpers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useRouter } from 'next/navigation'
import { IUserPlayTime, InvoiceData, ISeverity, CategoryChipInfo } from '@/types/playtime'

const usePlaytime = (): IUserPlayTime => {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [editingSession, setEditingSession] = useState<GameSession | null>(null)
  const [formData, setFormData] = useState<CreateSessionData>({
    table_id: 1,
    start_time: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
    hour_price: 50000,
  })
  const [menus, setMenus] = useState<MenuItemType[]>([])
  const [openFoodDialog, setOpenFoodDialog] = useState<boolean>(false)
  const [openFoodListDialog, setOpenFoodListDialog] = useState<boolean>(false)
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null)
  const [openModel, setOpenModel] = useState<boolean>(false)
  const [foodFormData, setFoodFormData] = useState<FoodData>({
    menu_id: 0,
    quantity: 1,
  })
  const [sessionOrders, setSessionOrders] = useState<Order[]>([])
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState<boolean>(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    session: null,
    orders: [],
    totalFoodMoney: 0,
    totalTableMoney: 0,
    totalMoney: 0,
  })
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })
  const [viewMode, setViewMode] = useState<'todayOrPlaying' | 'playingOrLast7Days'>(
    'playingOrLast7Days',
  )
  const [reportLoading, setReportLoading] = useState<boolean>(false)

  const handleDownloadReport = async (fromDate: string, toDate: string) => {
    setReportLoading(true)
    try {
      const response = await apiService.downloadReport(fromDate, toDate)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report_${fromDate}_to_${toDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (error) {
      console.error('Failed to download report:', error)
      showSnackbar('Không thể tải báo cáo', 'error')
    } finally {
      setReportLoading(false)
    }
  }
  
  const handlePrintReport = async (fromDate: string, toDate: string) => {
    setReportLoading(true)
    try {
      const response = await apiService.downloadReport(fromDate, toDate)
      const url = window.URL.createObjectURL(new Blob([response]))
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.focus()
        printWindow.print()
      } else {
        showSnackbar('Không thể mở cửa sổ in', 'error')
      }
    } catch (error) {
      console.error('Failed to print report:', error)
      showSnackbar('Không thể in báo cáo', 'error')
    } finally {
      setReportLoading(false)
    }
  }

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

  const loadSessions = async (mode?: 'todayOrPlaying' | 'playingOrLast7Days') => {
    try {
      const currentMode = mode || viewMode
      let sessionsData

      if (currentMode === 'todayOrPlaying') {
        sessionsData = await apiService.getSessionsTodayOrPlaying()
      } else {
        sessionsData = await apiService.getSessionsPlayingOrLast7Days()
      }

      setSessions(sessionsData)
    } catch (error) {
      console.error('Failed to load sessions:', error)
      showSnackbar('Không thể tải danh sách session', 'error')
    }
  }

  const loadTables = async () => {
    try {
      const tablesData = await apiService.getTables()
      setTables(tablesData)
      if (tablesData.length > 0) {
        setFormData((prev) => ({ ...prev, table_id: tablesData[0].id }))
      }
    } catch (error) {
      console.error('Failed to load tables:', error)
      showSnackbar('Không thể tải danh sách bàn', 'error')
    }
  }

  const loadMenus = async () => {
    try {
      const menusData = await apiService.getAvailableMenus()
      setMenus(menusData)
      if (menusData.length > 0) {
        setFoodFormData((prev) => ({ ...prev, menu_id: menusData[0].id }))
      }
    } catch (error) {
      console.error('Failed to load menus:', error)
      showSnackbar('Không thể tải danh sách thực đơn', 'error')
    }
  }

  const handleOpenDialog = (session?: GameSession) => {
    if (session) {
      setEditingSession(session)
      setFormData({
        table_id: session.table_id,
        start_time: dayjs(session.start_time).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        hour_price: session.hour_price,
      })
    } else {
      setEditingSession(null)
      setFormData({
        table_id: tables.length > 0 ? tables[0].id : 1,
        start_time: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        hour_price: tables.length > 0 ? tables[0].price_per_hour : 50000,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingSession(null)
    setFormData({
      table_id: tables.length > 0 ? tables[0].id : 1,
      start_time: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
      hour_price: tables.length > 0 ? tables[0].price_per_hour : 50000,
    })
  }

  const handleSubmit = async () => {
    try {
      if (editingSession) {
        await apiService.updateSession(editingSession.id, formData)
        showSnackbar('Cập nhật session thành công', 'success')
      } else {
        await apiService.createSession(formData)
        showSnackbar('Tạo session mới thành công', 'success')
      }
      handleCloseDialog()
      loadSessions()
    } catch (error) {
      console.error('Failed to save session:', error)
      showSnackbar('Không thể lưu session', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa session này?')) {
      try {
        await apiService.deleteSession(id)
        showSnackbar('Xóa session thành công', 'success')
        loadSessions()
      } catch (error) {
        console.error('Failed to delete session:', error)
        showSnackbar('Không thể xóa session', 'error')
      }
    }
  }

  const handleStatusChange = async (
    session: GameSession,
    newStatus: 'playing' | 'finished' | 'canceled',
  ) => {
    try {
      const updateData: UpdateSessionData = { status: newStatus }
      if (newStatus === 'finished' && !session.end_time) {
        updateData.end_time = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm')
      }
      await apiService.updateSession(session.id, updateData)
      showSnackbar('Cập nhật trạng thái thành công', 'success')
      loadSessions()
    } catch (error) {
      console.error('Failed to update status:', error)
      showSnackbar('Không thể cập nhật trạng thái', 'error')
    }
  }

  const handleOpenFoodDialog = (session: GameSession) => {
    setSelectedSession(session)
    setFoodFormData({
      menu_id: menus.length > 0 ? menus[0].id : 0,
      quantity: 1,
    })
    setOpenFoodDialog(true)
  }

  const handleCloseFoodDialog = () => {
    setOpenFoodDialog(false)
    setSelectedSession(null)
    setFoodFormData({
      menu_id: 0,
      quantity: 1,
    })
  }

  const handleAddFood = async () => {
    if (!selectedSession || foodFormData.menu_id === 0 || foodFormData.quantity <= 0) {
      showSnackbar('Vui lòng chọn món ăn và số lượng', 'error')
      return
    }

    try {
      const selectedMenu = menus.find((menu) => menu.id === foodFormData.menu_id)
      if (!selectedMenu) {
        showSnackbar('Không tìm thấy món ăn', 'error')
        return
      }

      // Tạo order mới
      const response = await apiService.createOrder({
        session_id: selectedSession.id,
        menu_id: foodFormData.menu_id,
        quantity: foodFormData.quantity,
        unit_price: selectedMenu.price,
        total_price: selectedMenu.price * foodFormData.quantity,
      })

      // Tính toán lại tổng tiền đồ ăn từ tất cả orders
      await recalculateFoodTotal(selectedSession.id)

      showSnackbar(
        `${response.message}. Còn lại: ${response.remaining_quantity} sản phẩm`,
        'success',
      )
      handleCloseFoodDialog()
      loadSessions() // Reload để cập nhật tổng tiền
      loadMenus() // Reload để cập nhật số lượng menu
    } catch (error: unknown) {
      console.error('Failed to add food:', error)

      // Hiển thị lỗi chi tiết từ backend
      const errorMessage = error instanceof Error ? error.message : 'Không thể thêm món ăn'
      showSnackbar(errorMessage, 'error')
    }
  }

  const handleViewFoodList = async (session: GameSession) => {
    try {
      setSelectedSession(session)
      // Lấy danh sách orders của session này
      const orders = await apiService.getOrders()
      const sessionOrders = orders.filter((order) => order.session_id === session.id)
      setSessionOrders(sessionOrders)
      setOpenFoodListDialog(true)
    } catch (error) {
      console.error('Failed to load food list:', error)
      showSnackbar('Không thể tải danh sách món ăn', 'error')
    }
  }

  const handleCloseFoodListDialog = () => {
    setOpenFoodListDialog(false)
    setSelectedSession(null)
    setSessionOrders([])
  }

  // Hàm tính toán lại tổng tiền đồ ăn từ orders
  const recalculateFoodTotal = async (sessionId: number): number => {
    try {
      const orders = await apiService.getOrders()
      const sessionOrders = orders.filter((order) => order.session_id === sessionId)
      const totalFoodMoney = sessionOrders.reduce(
        (sum, order) => sum + parseFloat(order.total_price.toString()),
        0,
      )

      // Cập nhật session với tổng tiền đồ ăn mới
      const session = sessions.find((s) => s.id === sessionId)
      if (session) {
        const currentTableMoney = parseFloat(session?.total_money_table?.toString() || '0')
        const newTotalMoney = currentTableMoney + totalFoodMoney
        await apiService.updateSession(sessionId, {
          total_money_food: totalFoodMoney,
          total_money: newTotalMoney,
        })
      }

      return Number(totalFoodMoney)
    } catch (error) {
      console.error('Failed to recalculate food total:', error)
      return 0
    }
  }

  // Local status color helper
  const getStatusColorLocal = (
    status: string,
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'playing':
        return 'success'
      case 'finished':
        return 'primary'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  // Local category chip helper
  const getCategoryChipLocal = (category: string) => {
    const getCategoryInfo = (cat: string): CategoryChipInfo => {
      switch (cat) {
        case 'food':
          return { icon: <FoodIcon />, label: 'Đồ ăn', color: 'primary' as const }
        case 'drink':
          return { icon: <DrinkIcon />, label: 'Đồ uống', color: 'secondary' as const }
        case 'tobacco':
          return { icon: <TobaccoIcon />, label: 'Thuốc lá', color: 'warning' as const }
        case 'takeaway':
          return { icon: <TakeawayIcon />, label: 'Mang về', color: 'info' as const }
        default:
          return { icon: <FoodIcon />, label: 'Không xác định', color: 'default' as const }
      }
    }

    const categoryInfo = getCategoryInfo(category)
    return (
      <Chip
        icon={categoryInfo.icon as React.ReactElement}
        label={categoryInfo.label}
        color={categoryInfo.color}
        variant="outlined"
        size="small"
      />
    )
  }

  // Hàm xóa món ăn và cập nhật tổng tiền
  const handleDeleteFood = async (orderId: number, sessionId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      try {
        await apiService.deleteOrder(orderId)

        // Tính toán lại tổng tiền đồ ăn sau khi xóa
        await recalculateFoodTotal(sessionId)

        showSnackbar('Xóa món ăn thành công!', 'success')

        // Reload dữ liệu
        loadSessions()
        if (selectedSession && selectedSession.id === sessionId) {
          const orders = await apiService.getOrders()
          const sessionOrders = orders.filter((order) => order.session_id === sessionId)
          setSessionOrders(sessionOrders)
        }
      } catch (error) {
        console.error('Failed to delete food:', error)
        showSnackbar('Không thể xóa món ăn', 'error')
      }
    }
  }

  // Hàm mở dialog in hóa đơn
  const handleOpenInvoiceDialog = async (session: GameSession) => {
    try {
      // Lấy danh sách orders của session này
      const orders = await apiService.getOrders()
      const sessionOrders = orders.filter((order) => order.session_id === session.id)

      // Tính toán tổng tiền
      const totalFoodMoney = sessionOrders.reduce(
        (sum, order) => sum + parseFloat(order.total_price.toString()),
        0,
      )
      const totalTableMoney = parseFloat(session?.total_money_table?.toString() || '0')
      const totalMoney = totalTableMoney + totalFoodMoney

      setInvoiceData({
        session,
        orders: sessionOrders,
        totalFoodMoney,
        totalTableMoney,
        totalMoney,
      })

      setOpenInvoiceDialog(true)
    } catch (error) {
      console.error('Failed to load invoice data:', error)
      showSnackbar('Không thể tải dữ liệu hóa đơn', 'error')
    }
  }

  // Hàm đóng dialog in hóa đơn
  const handleCloseInvoiceDialog = () => {
    setOpenInvoiceDialog(false)
    setInvoiceData({
      session: null,
      orders: [],
      totalFoodMoney: 0,
      totalTableMoney: 0,
      totalMoney: 0,
    })
  }

  // Hàm in hóa đơn
  const handlePrintInvoice = async () => {
    if (!invoiceData.session) return

    try {
      const content = await generateInvoiceContent(
        invoiceData.session,
        invoiceData.orders,
        tables,
        menus,
        invoiceData.totalTableMoney,
        invoiceData.totalFoodMoney,
        invoiceData.totalMoney,
      )
      printInvoice(content)
    } catch (error) {
      console.error('Lỗi tạo hóa đơn:', error)
      showSnackbar('Không thể tạo hóa đơn', 'error')
    }
  }

  const showSnackbar = (message: string, severity: ISeverity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const handleRedirectTakeAway = () => {
    router.push('/takeaway')
  }

  const handleRedirectDineIn = () => {
    router.push('/dine-in')
  }

  const handleExportExcel = () => {
    setOpenModel(true)
  }

  return {
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
    openModel,
    setOpenModel,
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
    handleDownloadReport,
    reportLoading,
    handlePrintReport,
  }
}

export default usePlaytime
