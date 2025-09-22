'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
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
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Restaurant as FoodIcon,
  LocalBar as DrinkIcon,
  SmokingRooms as TobaccoIcon,
  TakeoutDining as TakeawayIcon,
} from '@mui/icons-material'
import { apiService, User } from '@/lib/api'
import SideBar from '@/app/SideBar'

interface MenuItem {
  id: number
  name: string
  price: number
  cost_price?: number
  quantity: number
  category: 'food' | 'drink' | 'tobacco' | 'takeaway'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MenuFormData {
  name: string
  price: number
  cost_price?: number
  quantity: number
  category: 'food' | 'drink' | 'tobacco' | 'takeaway'
  is_active: boolean
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function MenuSettingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    price: 0,
    cost_price: undefined,
    quantity: 0,
    category: 'food',
    is_active: true,
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

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
      setSnackbar({
        open: true,
        message,
        severity,
      })
    },
    [],
  )

  const loadUser = useCallback(async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const loadMenus = useCallback(async () => {
    try {
      const menusData = await apiService.getMenus()
      setMenus(menusData)
    } catch (error) {
      console.error('Failed to load menus:', error)
      showSnackbar('Không thể tải danh sách thực đơn', 'error')
    }
  }, [showSnackbar])

  useEffect(() => {
    const token = apiService.getToken()
    if (!token) {
      router.push('/login')
      return
    }

    loadUser()
    loadMenus()
  }, [router, loadUser, loadMenus])

  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleOpenDialog = (menu?: MenuItem) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        name: menu.name,
        price: menu.price,
        cost_price: menu.cost_price,
        quantity: menu.quantity,
        category: menu.category,
        is_active: menu.is_active,
      })
    } else {
      setEditingMenu(null)
      setFormData({
        name: '',
        price: 0,
        cost_price: undefined,
        quantity: 0,
        category: 'food',
        is_active: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingMenu(null)
    setFormData({
      name: '',
      price: 0,
      cost_price: undefined,
      quantity: 0,
      category: 'food',
      is_active: true,
    })
  }

  const handleInputChange = (
    field: keyof MenuFormData,
    value: string | number | boolean | undefined,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || formData.price <= 0 || formData.quantity < 0) {
      showSnackbar(
        'Vui lòng điền đầy đủ thông tin bắt buộc, giá phải lớn hơn 0 và số lượng không được âm',
        'error',
      )
      return
    }

    try {
      if (editingMenu) {
        // Update existing menu
        await apiService.updateMenu(editingMenu.id, formData)
        showSnackbar('Cập nhật món ăn thành công!', 'success')
      } else {
        // Create new menu
        await apiService.createMenu(formData)
        showSnackbar('Thêm món ăn mới thành công!', 'success')
      }

      handleCloseDialog()
      loadMenus()
    } catch (error) {
      console.error('Failed to save menu:', error)
      showSnackbar('Có lỗi xảy ra khi lưu món ăn', 'error')
    }
  }

  const handleDeleteMenu = async (menuId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      try {
        await apiService.deleteMenu(menuId)
        showSnackbar('Xóa món ăn thành công!', 'success')
        loadMenus()
      } catch (error) {
        console.error('Failed to delete menu:', error)
        showSnackbar('Có lỗi xảy ra khi xóa món ăn', 'error')
      }
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const getCategoryChip = (category: string) => {
    const getCategoryInfo = (cat: string) => {
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
        icon={categoryInfo.icon}
        label={categoryInfo.label}
        color={categoryInfo.color}
        variant="outlined"
        size="small"
      />
    )
  }

  const getStatusChip = (isActive: boolean) => {
    return (
      <Chip
        label={isActive ? 'Hoạt động' : 'Không hoạt động'}
        color={isActive ? 'success' : 'default'}
        variant="outlined"
        size="small"
      />
    )
  }

  const filteredMenus = menus.filter((menu) => {
    if (tabValue === 0) return menu.category === 'food'
    if (tabValue === 1) return menu.category === 'drink'
    if (tabValue === 2) return menu.category === 'tobacco'
    if (tabValue === 3) return menu.category === 'takeaway'
    return true
  })

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
      <SideBar title="Thiết lập thực đơn" href="/setting/menus" user={user} icon={<TakeawayIcon />}>
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h6">Thiết lập thực đơn</Typography>
            {user && user.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Thêm món mới
              </Button>
            )}
          </Box>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="menu categories">
                  <Tab label="Đồ ăn" icon={<FoodIcon />} iconPosition="start" />
                  <Tab label="Đồ uống" icon={<DrinkIcon />} iconPosition="start" />
                  <Tab label="Thuốc" icon={<TobaccoIcon />} iconPosition="start" />
                  <Tab label="Mang về" icon={<TakeawayIcon />} iconPosition="start" />
                  <Tab label="Tất cả" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <MenuTable
                  menus={filteredMenus}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteMenu}
                  getCategoryChip={getCategoryChip}
                  getStatusChip={getStatusChip}
                  user={user}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <MenuTable
                  menus={filteredMenus}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteMenu}
                  getCategoryChip={getCategoryChip}
                  getStatusChip={getStatusChip}
                  user={user}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <MenuTable
                  menus={filteredMenus}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteMenu}
                  getCategoryChip={getCategoryChip}
                  getStatusChip={getStatusChip}
                  user={user}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <MenuTable
                  menus={filteredMenus}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteMenu}
                  getCategoryChip={getCategoryChip}
                  getStatusChip={getStatusChip}
                  user={user}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                <MenuTable
                  menus={menus}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteMenu}
                  getCategoryChip={getCategoryChip}
                  getStatusChip={getStatusChip}
                  user={user}
                />
              </TabPanel>
            </CardContent>
          </Card>
        </Container>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingMenu ? 'Sửa món ăn' : 'Thêm món mới'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Tên món"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Giá bán (VNĐ)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                fullWidth
                required
                inputProps={{ min: 0, step: 1000 }}
              />

              <TextField
                label="Giá vốn (VNĐ)"
                type="number"
                value={formData.cost_price || ''}
                onChange={(e) =>
                  handleInputChange('cost_price', parseFloat(e.target.value) || undefined)
                }
                fullWidth
                inputProps={{ min: 0, step: 1000 }}
                helperText="Để trống nếu muốn tự động tính 60% giá bán"
              />

              <TextField
                label="Số lượng tồn kho"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />

              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  label="Danh mục"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <MenuItem value="food">Đồ ăn</MenuItem>
                  <MenuItem value="drink">Đồ uống</MenuItem>
                  <MenuItem value="tobacco">Thuốc lá</MenuItem>
                  <MenuItem value="takeaway">Mang về</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Món ăn đang hoạt động"
              />
            </Box>
          </DialogContent>
          {user && user.role === 'admin' && (
            <DialogActions>
              <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!formData.name || formData.price <= 0 || formData.quantity < 0}
              >
                {editingMenu ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogActions>
          )}
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

// Menu Table Component
function MenuTable({
  menus,
  user,
  onEdit,
  onDelete,
  getCategoryChip,
  getStatusChip,
}: {
  menus: MenuItem[]
  user: User | null
  onEdit: (menu: MenuItem) => void
  onDelete: (id: number) => void
  getCategoryChip: (category: string) => React.ReactNode
  getStatusChip: (isActive: boolean) => React.ReactNode
}) {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tên món</TableCell>
            <TableCell>Danh mục</TableCell>
            <TableCell>Giá bán (VNĐ)</TableCell>
            <TableCell>Giá vốn (VNĐ)</TableCell>
            <TableCell>Tỷ lệ lợi nhuận</TableCell>
            <TableCell>Số lượng</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Ngày tạo</TableCell>
            {user && user.role === 'admin' && <TableCell>Thao tác</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {menus.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center">
                <Typography variant="body2" color="text.secondary">
                  Không có món ăn nào
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            menus.map((menu) => {
              const costPrice = menu.cost_price || menu.price * 0.6
              const profitMargin =
                menu.price > 0 ? ((menu.price - costPrice) / menu.price) * 100 : 0

              return (
                <TableRow key={menu.id}>
                  <TableCell>{menu.id}</TableCell>
                  <TableCell>{menu.name}</TableCell>
                  <TableCell>{getCategoryChip(menu.category)}</TableCell>
                  <TableCell>{menu.price.toLocaleString('vi-VN')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{costPrice.toLocaleString('vi-VN')}</Typography>
                      {!menu.cost_price && (
                        <Chip label="Tự động" size="small" variant="outlined" color="info" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${profitMargin.toFixed(1)}%`}
                      color={
                        profitMargin >= 40 ? 'success' : profitMargin >= 20 ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={menu.quantity}
                      color={menu.quantity > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(menu.is_active)}</TableCell>
                  <TableCell>{new Date(menu.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  {user && user.role === 'admin' && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Sửa món ăn">
                          <MuiIconButton size="small" color="primary" onClick={() => onEdit(menu)}>
                            <EditIcon />
                          </MuiIconButton>
                        </Tooltip>
                        <Tooltip title="Xóa món ăn">
                          <MuiIconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(menu.id)}
                          >
                            <DeleteIcon />
                          </MuiIconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
