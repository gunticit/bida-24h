'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
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
} from '@mui/material';
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
  LocalBar as DrinkIcon,
  SmokingRooms as TobaccoIcon,
  TakeoutDining as TakeawayIcon,
} from '@mui/icons-material';
import { apiService, User, Session, CreateSessionData, UpdateSessionData, Table, MenuItem as MenuItemType, Order } from '@/lib/api';
import { AppBar } from '@/components/ui';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";       
import timezone from "dayjs/plugin/timezone"; 

dayjs.extend(utc);
dayjs.extend(timezone);

export default function PlaytimePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<CreateSessionData>({
    table_id: 1,
    start_time: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
    hour_price: 50000,
  });
  const [menus, setMenus] = useState<MenuItemType[]>([]);
  const [openFoodDialog, setOpenFoodDialog] = useState(false);
  const [openFoodListDialog, setOpenFoodListDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [foodFormData, setFoodFormData] = useState({
    menu_id: 0,
    quantity: 1,
  });
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    session: Session | null;
    orders: Order[];
    totalFoodMoney: number;
    totalTableMoney: number;
    totalMoney: number;
  }>({
    session: null,
    orders: [],
    totalFoodMoney: 0,
    totalTableMoney: 0,
    totalMoney: 0,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const token = apiService.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadUser();
    loadSessions();
    loadTables();
    loadMenus();
  }, [router]);

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      console.log(userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const sessionsData = await apiService.getSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      showSnackbar('Không thể tải danh sách session', 'error');
    }
  };

  const loadTables = async () => {
    try {
      const tablesData = await apiService.getTables();
      setTables(tablesData);
      if (tablesData.length > 0) {
        setFormData(prev => ({ ...prev, table_id: tablesData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
      showSnackbar('Không thể tải danh sách bàn', 'error');
    }
  };

  const loadMenus = async () => {
    try {
      const menusData = await apiService.getMenus();
      setMenus(menusData.filter(menu => menu.is_active));
      if (menusData.length > 0) {
        setFoodFormData(prev => ({ ...prev, menu_id: menusData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
      showSnackbar('Không thể tải danh sách thực đơn', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOpenDialog = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        table_id: session.table_id,
        start_time: dayjs(session.start_time).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        hour_price: session.hour_price,
      });
    } else {
      setEditingSession(null);
      setFormData({
        table_id: tables.length > 0 ? tables[0].id : 1,
        start_time: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
        hour_price: tables.length > 0 ? tables[0].price_per_hour : 50000,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSession(null);
    setFormData({
      table_id: tables.length > 0 ? tables[0].id : 1,
      start_time: dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm'),
      hour_price: tables.length > 0 ? tables[0].price_per_hour : 50000,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingSession) {
        await apiService.updateSession(editingSession.id, formData);
        showSnackbar('Cập nhật session thành công', 'success');
      } else {
        await apiService.createSession(formData);
        showSnackbar('Tạo session mới thành công', 'success');
      }
      handleCloseDialog();
      loadSessions();
    } catch (error) {
      console.error('Failed to save session:', error);
      showSnackbar('Không thể lưu session', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa session này?')) {
      try {
        await apiService.deleteSession(id);
        showSnackbar('Xóa session thành công', 'success');
        loadSessions();
      } catch (error) {
        console.error('Failed to delete session:', error);
        showSnackbar('Không thể xóa session', 'error');
      }
    }
  };

  const handleStatusChange = async (session: Session, newStatus: 'playing' | 'finished' | 'canceled') => {
    try {
      const updateData: UpdateSessionData = { status: newStatus };
      if (newStatus === 'finished' && !session.end_time) {
        updateData.end_time = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm');
      }
      await apiService.updateSession(session.id, updateData);
      showSnackbar('Cập nhật trạng thái thành công', 'success');
      loadSessions();
    } catch (error) {
      console.error('Failed to update status:', error);
      showSnackbar('Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleOpenFoodDialog = (session: Session) => {
    setSelectedSession(session);
    setFoodFormData({
      menu_id: menus.length > 0 ? menus[0].id : 0,
      quantity: 1,
    });
    setOpenFoodDialog(true);
  };

  const handleCloseFoodDialog = () => {
    setOpenFoodDialog(false);
    setSelectedSession(null);
    setFoodFormData({
      menu_id: 0,
      quantity: 1,
    });
  };

  const handleAddFood = async () => {
    if (!selectedSession || foodFormData.menu_id === 0 || foodFormData.quantity <= 0) {
      showSnackbar('Vui lòng chọn món ăn và số lượng', 'error');
      return;
    }

    try {
      const selectedMenu = menus.find(menu => menu.id === foodFormData.menu_id);
      if (!selectedMenu) {
        showSnackbar('Không tìm thấy món ăn', 'error');
        return;
      }

      // Tạo order mới
      await apiService.createOrder({
        session_id: selectedSession.id,
        menu_id: foodFormData.menu_id,
        quantity: foodFormData.quantity,
        unit_price: selectedMenu.price,
        total_price: selectedMenu.price * foodFormData.quantity,
      });

      // Tính toán tổng tiền đồ ăn mới
      const orderTotal = parseInt(selectedMenu?.price?.toString() || '0') * parseInt(foodFormData?.quantity?.toString() || '0');
      const currentFoodTotal = parseInt(selectedSession?.total_money_food?.toString() || '0');
      const newFoodTotal = currentFoodTotal + orderTotal;
      
      // Tính tổng tiền mới (tiền bàn + tiền đồ ăn)
      const currentTableMoney = selectedSession.total_money_table || 0;
      const newTotalMoney = currentTableMoney + newFoodTotal;
      
      // Cập nhật session với tổng tiền mới
      await apiService.updateSession(selectedSession.id, {
        total_money_food: newFoodTotal,
        total_money: newTotalMoney,
      });

      showSnackbar(`Thêm món ăn thành công! Tổng tiền đồ ăn: ${newFoodTotal.toLocaleString('vi-VN')} đ`, 'success');
      handleCloseFoodDialog();
      loadSessions(); // Reload để cập nhật tổng tiền
    } catch (error) {
      console.error('Failed to add food:', error);
      showSnackbar('Không thể thêm món ăn', 'error');
    }
  };

  const handleViewFoodList = async (session: Session) => {
    try {
      setSelectedSession(session);
      // Lấy danh sách orders của session này
      const orders = await apiService.getOrders();
      const sessionOrders = orders.filter(order => order.session_id === session.id);
      setSessionOrders(sessionOrders);
      setOpenFoodListDialog(true);
    } catch (error) {
      console.error('Failed to load food list:', error);
      showSnackbar('Không thể tải danh sách món ăn', 'error');
    }
  };

  const handleCloseFoodListDialog = () => {
    setOpenFoodListDialog(false);
    setSelectedSession(null);
    setSessionOrders([]);
  };

  // Hàm tính toán lại tổng tiền đồ ăn từ orders
  const recalculateFoodTotal = async (sessionId: number) => {
    try {
      const orders = await apiService.getOrders();
      const sessionOrders = orders.filter(order => order.session_id === sessionId);
      const totalFoodMoney = sessionOrders.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
      
      // Cập nhật session với tổng tiền đồ ăn mới
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        const currentTableMoney = parseFloat(session?.total_money_table?.toString() || '0');
        const newTotalMoney = currentTableMoney + totalFoodMoney;
        await apiService.updateSession(sessionId, {
          total_money_food: totalFoodMoney,
          total_money: newTotalMoney,
        });
      }
      
      return totalFoodMoney;
    } catch (error) {
      console.error('Failed to recalculate food total:', error);
      return 0;
    }
  };

  const getCategoryChip = (category: string) => {
    const getCategoryInfo = (cat: string) => {
      switch (cat) {
        case 'food':
          return { icon: <FoodIcon />, label: 'Đồ ăn', color: 'primary' as const };
        case 'drink':
          return { icon: <DrinkIcon />, label: 'Đồ uống', color: 'secondary' as const };
        case 'tobacco':
          return { icon: <TobaccoIcon />, label: 'Thuốc lá', color: 'warning' as const };
        case 'takeaway':
          return { icon: <TakeawayIcon />, label: 'Mang về', color: 'info' as const };
        default:
          return { icon: <FoodIcon />, label: 'Không xác định', color: 'default' as const };
      }
    };

    const categoryInfo = getCategoryInfo(category);
    return (
      <Chip
        icon={categoryInfo.icon}
        label={categoryInfo.label}
        color={categoryInfo.color}
        variant="outlined"
        size="small"
      />
    );
  };

  // Hàm xóa món ăn và cập nhật tổng tiền
  const handleDeleteFood = async (orderId: number, sessionId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      try {
        await apiService.deleteOrder(orderId);
        
        // Tính toán lại tổng tiền đồ ăn sau khi xóa
        const newTotal = await recalculateFoodTotal(sessionId);
        
        showSnackbar('Xóa món ăn thành công!', 'success');
        
        // Reload dữ liệu
        loadSessions();
        if (selectedSession && selectedSession.id === sessionId) {
          const orders = await apiService.getOrders();
          const sessionOrders = orders.filter(order => order.session_id === sessionId);
          setSessionOrders(sessionOrders);
        }
      } catch (error) {
        console.error('Failed to delete food:', error);
        showSnackbar('Không thể xóa món ăn', 'error');
      }
    }
  };

  // Hàm mở dialog in hóa đơn
  const handleOpenInvoiceDialog = async (session: Session) => {
    try {
      // Lấy danh sách orders của session này
      const orders = await apiService.getOrders();
      const sessionOrders = orders.filter(order => order.session_id === session.id);
      
      // Tính toán tổng tiền
      const totalFoodMoney = sessionOrders.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
      const totalTableMoney = parseFloat(session?.total_money_table?.toString() || '0');
      const totalMoney = totalTableMoney + totalFoodMoney;
      
      setInvoiceData({
        session,
        orders: sessionOrders,
        totalFoodMoney,
        totalTableMoney,
        totalMoney,
      });
      
      setOpenInvoiceDialog(true);
    } catch (error) {
      console.error('Failed to load invoice data:', error);
      showSnackbar('Không thể tải dữ liệu hóa đơn', 'error');
    }
  };

  // Hàm đóng dialog in hóa đơn
  const handleCloseInvoiceDialog = () => {
    setOpenInvoiceDialog(false);
    setInvoiceData({
      session: null,
      orders: [],
      totalFoodMoney: 0,
      totalTableMoney: 0,
      totalMoney: 0,
    });
  };

  // Hàm in hóa đơn
  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const invoiceContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hóa đơn - Session #${invoiceData.session?.id}</title>
          <style>
            @page {
              size: 80mm auto; /* Chiều ngang 80mm, chiều dọc tự co */
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 15px;
              margin: 0;
              padding: 4px;
              width: 80mm; /* khổ giấy */
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            .header h1 {
              font-size: 15px;
              margin: 0;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 6px 0;
              font-size: 14px;
            }
            .table th, .table td {
              border: 1px solid #000;
              padding: 2px 4px;
              text-align: left;
              word-break: break-word;
            }
            .table th {
              background-color: #f9f9f9;
            }
            .total {
              font-weight: bold;
              font-size: 15px;
              margin-top: 6px;
              padding: 4px 0;
              border-top: 1px dashed #000;
              text-right: right;
            }
            .footer {
              margin-top: 10px;
              text-align: center;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size:20px;">24H BILLIARDS & COFFEE</h1>
            <p style="font-size:15px; margin: 3px 0;">Địa chỉ: <b>Cổng chào thôn văn hoá Eanur, Pơngđrang, Đăk Lăk</b></p>
            <p style="font-size:15px; margin: 3px 0;">Hotline: <b>096 718 13 03</b></p>
            <p style="font-size:14px; margin: 3px 0;">Giờ bắt đầu: <b>${invoiceData.session ? new Date(invoiceData.session.start_time).toLocaleString('vi-VN') : 'N/A'}</b></p>
            <p style="font-size:14px; margin: 3px 0;">Giờ kết thúc: <b>${invoiceData.session?.end_time ? new Date(invoiceData.session.end_time).toLocaleString('vi-VN') : 'Đang chơi'}</b></p>
          </div>
          
          <h3 style="font-size:15px; margin:4px 0;">Thông tin giờ chơi:</h3>
          <table class="table">
            <tr>
              <th>Bàn</th>
              <th>Giá/giờ</th>
              <th>Thời gian</th>
              <th>Tiền bàn</th>
            </tr>
            <tr>
              <td>${tables.find(t => t.id === invoiceData.session?.table_id)?.name || 'N/A'}</td>
              <td>${parseInt(invoiceData?.session?.hour_price?.toString() || '0').toLocaleString('vi-VN')} đ</td>
              <td>${invoiceData.session ? calculatePlayTime(invoiceData.session) : 'N/A'}</td>
              <td>${invoiceData.totalTableMoney.toLocaleString('vi-VN')} đ</td>
            </tr>
          </table>
          
          ${invoiceData.orders.length > 0 ? `
          <h3 style="font-size:15px; margin:4px 0;">Thực đơn:</h3>
          <table class="table">
            <tr>
              <th>Món</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
            ${invoiceData.orders.map(order => `
              <tr>
                <td>${menus.find(menu => menu.id === order.menu_id)?.name || `Món ${order.menu_id}`}</td>
                <td>${order.quantity}</td>
                <td>${parseInt(order.unit_price.toString()).toLocaleString('vi-VN')} đ</td>
                <td>${parseInt(order.total_price.toString()).toLocaleString('vi-VN')} đ</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}
          
          <div class="total">
            <h3 style="font-size:15px; margin:4px 0; text-align: right;">Tiền bàn: ${parseInt(invoiceData.totalTableMoney.toString()).toLocaleString('vi-VN')} đ</h3>
            ${invoiceData.orders.length > 0 ? `<h3 style="font-size:15px; margin:4px 0; text-align: right;">Tiền đồ ăn: ${invoiceData.totalFoodMoney.toLocaleString('vi-VN')} đ</h3>` : ''}
            <h1 style="font-size:20px; margin:4px 0; text-align: right;">Tổng tiền: ${parseInt(invoiceData.totalMoney.toString()).toLocaleString('vi-VN')} đ</h1>
          </div>
          
          <div class="footer">
            <p style="font-size:15px; margin: 3px 0;">Cảm ơn quý khách đã luôn ủng hộ <br/> 24h Billiards Coffee!</p>
            <p style="font-size:15px; margin: 3px 0;">In lúc: ${dayjs().tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY')}</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      // printWindow.close();
    }
  };

  // Hàm tính thời gian chơi
  const calculatePlayTime = (session: Session) => {
    if (!session.end_time) return 'Đang chơi';
    
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const diffTime = Math.abs(endTime.getTime() - startTime.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'playing':
        return 'primary';
      case 'finished':
        return 'success';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'playing':
        return 'Đang chơi';
      case 'finished':
        return 'Đã kết thúc';
      case 'canceled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const formatMoney = (amount: number | null) => {
    if (amount === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar 
        title="Quản lý Giờ chơi"
        user={user}
        onLogout={handleLogout}
        icon={<CalendarIcon />}
      />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quản lý Giờ chơi
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm Session mới
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tổng số Session
                </Typography>
                <Typography variant="h4">
                  {sessions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Đang chơi
                </Typography>
                <Typography variant="h4" color="primary">
                  {sessions.filter(s => s.status === 'playing').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Đã kết thúc
                </Typography>
                <Typography variant="h4" color="success.main">
                  {sessions.filter(s => s.status === 'finished').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Đã hủy
                </Typography>
                <Typography variant="h4" color="error.main">
                  {sessions.filter(s => s.status === 'canceled').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sessions Table */}
        <Card>
          <CardContent>
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
                        <TableCell>
                          {session.table?.name || `Bàn ${session.table_id}`}
                        </TableCell>
                        <TableCell>{formatDateTime(session.start_time)}</TableCell>
                        <TableCell>
                          {session.end_time ? formatDateTime(session.end_time) : '-'}
                        </TableCell>
                        <TableCell>
                          {session.total_time ? `${Math.floor(session.total_time / 60)}h ${session.total_time % 60}p` : '-'}
                        </TableCell>
                        <TableCell>{formatMoney(session.hour_price)}</TableCell>
                        <TableCell>{formatMoney(session.total_money_table)}</TableCell>
                        <TableCell>{formatMoney(session.total_money_food)}</TableCell>
                        <TableCell>{formatMoney(session.total_money)}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(session.status)}
                            color={getStatusColor(session.status) as any}
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
                            <MuiIconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(session.id)}
                              title="Xóa"
                            >
                              <DeleteIcon />
                            </MuiIconButton>
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
        <DialogTitle>
          {editingSession ? 'Chỉnh sửa Session' : 'Thêm Session mới'}
        </DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
              <InputLabel>Chọn bàn</InputLabel>
              <Select
                value={formData.table_id}
                label="Chọn bàn"
                onChange={(e) => {
                const tableId = e.target.value as number;
                const selectedTable = tables.find(t => t.id === tableId);
                setFormData({ 
                  ...formData, 
                  table_id: tableId,
                  hour_price: selectedTable?.price_per_hour || formData.hour_price
                });
                }}
              >
                {tables.map((table) => (
                <MenuItem key={table.id} value={table.id}>
                  {table.name} - {table.status === 'available' ? 'Sẵn sàng' : 
                  table.status === 'playing' ? 'Đang chơi' : 'Bảo trì'}
                </MenuItem>
                ))}
              </Select>
              </FormControl>
              <TextField
              label={"Thời gian bắt đầu (GMT+7)" + formData.start_time}
              type="datetime-local"
              value={
                formData.start_time
                ? (() => {
                  // Nếu là dạng ISO, chuyển sang yyyy-MM-ddTHH:mm
                  const d = new Date(formData.start_time);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  const hour = String(d.getHours()).padStart(2, '0');
                  const minute = String(d.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hour}:${minute}`;
                  })()
                : ''
              }
              onChange={e =>
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
        <DialogTitle>
          Thêm món ăn cho Session #{selectedSession?.id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Chọn món ăn</InputLabel>
              <Select
                value={foodFormData.menu_id}
                label="Chọn món ăn"
                onChange={(e) => setFoodFormData({ ...foodFormData, menu_id: e.target.value as number })}
              >
                {menus.map((menu) => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {
                      getCategoryChip(menu.category)
                    }
                    : {menu.name} - {parseInt(menu?.price?.toString()).toLocaleString('vi-VN')} đ
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Số lượng"
              type="number"
              value={foodFormData.quantity}
              onChange={(e) => setFoodFormData({ ...foodFormData, quantity: parseInt(e.target.value) || 1 })}
              fullWidth
              inputProps={{ min: 1 }}
            />
            
            {foodFormData.menu_id > 0 && (
              <Typography variant="body2" color="text.secondary">
                Tổng tiền: {(() => {
                  const selectedMenu = menus.find(menu => menu.id === foodFormData.menu_id);
                  return selectedMenu ? (selectedMenu.price * foodFormData.quantity).toLocaleString('vi-VN') + ' đ' : '0 đ';
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
      <Dialog open={openFoodListDialog} onClose={handleCloseFoodListDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Danh sách món ăn - Session #{selectedSession?.id}
        </DialogTitle>
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
                            {menus.find(menu => menu.id === order.menu_id)?.name || `Món ${order.menu_id}`}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{parseFloat(order.unit_price.toString()).toLocaleString('vi-VN')} đ</TableCell>
                          <TableCell>{parseFloat(order.total_price.toString()).toLocaleString('vi-VN')} đ</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleString('vi-VN')}</TableCell>
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
                  Tổng tiền đồ ăn: <strong>{sessionOrders.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0).toLocaleString('vi-VN')} đ</strong>
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
                const newTotal = await recalculateFoodTotal(selectedSession.id);
                showSnackbar(`Đã tính lại tổng tiền đồ ăn: ${parseFloat(newTotal.toString()).toLocaleString('vi-VN')} đ`, 'success');
                loadSessions(); // Reload để cập nhật dữ liệu
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
        <DialogTitle>
          Hóa đơn - Session #{invoiceData.session?.id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin giờ chơi
            </Typography>
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body1">
                <strong>Bàn:</strong> {tables.find(t => t.id === invoiceData.session?.table_id)?.name || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Thời gian bắt đầu:</strong> {invoiceData.session?.start_time ? new Date(invoiceData.session.start_time).toLocaleString('vi-VN') : 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Thời gian kết thúc:</strong> {invoiceData.session?.end_time ? new Date(invoiceData.session.end_time).toLocaleString('vi-VN') : 'Đang chơi'}
              </Typography>
              <Typography variant="body1">
                <strong>Giá/giờ:</strong> {parseInt(invoiceData.session?.hour_price.toString() || '0').toLocaleString('vi-VN')} đ
              </Typography>
              <Typography variant="body1">
                <strong>Thời gian chơi:</strong> {invoiceData.session ? calculatePlayTime(invoiceData.session) : 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Tiền bàn:</strong> {parseInt(invoiceData.totalTableMoney.toString()).toLocaleString('vi-VN')} đ
              </Typography>
            </Box>

            {invoiceData.orders.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Thực đơn đã đặt
                </Typography>
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
                            {menus.find(menu => menu.id === order.menu_id)?.name || `Món ${order.menu_id}`}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{parseFloat(order.unit_price.toString()).toLocaleString('vi-VN')} đ</TableCell>
                          <TableCell>{parseFloat(order.total_price.toString()).toLocaleString('vi-VN')} đ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </MuiTable>
                </TableContainer>
              </>
            )}

            <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Tổng kết
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Tiền bàn: <strong>{parseInt(invoiceData.totalTableMoney.toString()).toLocaleString('vi-VN')} đ</strong>
              </Typography>
              {invoiceData.orders.length > 0 && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Tiền đồ ăn: <strong>{parseInt(invoiceData.totalFoodMoney.toString()).toLocaleString('vi-VN')} đ</strong>
                </Typography>
              )}
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                TỔNG CỘNG: <strong>{parseInt(invoiceData.totalMoney.toString()).toLocaleString('vi-VN')} đ</strong>
              </Typography>
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
