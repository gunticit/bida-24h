'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Pagination,
  Stack,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
} from '@mui/icons-material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { apiService, User } from '@/lib/api'
import { Expense, ExpenseSummary } from '@/types/api'
import { useRouter } from 'next/navigation'
import SideBar from '@/app/SideBar'

interface ApiError {
  message?: string
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

const ExpensePage = () => {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Date filter states
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    return (
      firstDay.getFullYear() +
      '-' +
      String(firstDay.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(firstDay.getDate()).padStart(2, '0')
    )
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    return (
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0')
    )
  })

  // Form states
  const [open, setOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'other',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<User | null>(null)

  const categories = [
    { value: 'food', label: 'Nguyên liệu thực phẩm' },
    { value: 'utilities', label: 'Tiền điện, nước' },
    { value: 'rent', label: 'Tiền thuê mặt bằng' },
    { value: 'staff', label: 'Lương nhân viên' },
    { value: 'equipment', label: 'Thiết bị, sửa chữa' },
    { value: 'marketing', label: 'Quảng cáo, marketing' },
    { value: 'maintenance', label: 'Bảo trì, vệ sinh' },
    { value: 'other', label: 'Khác' },
  ]

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      const token = apiService.getToken()
      if (!token) {
        router.push('/login')
        return
      }

      const [expenseResponse, summaryResponse] = await Promise.all([
        apiService.getExpenses({}, page),
        apiService.getExpenseSummary(startDate, endDate),
      ])

      setExpenses(expenseResponse.data)
      setTotalPages(expenseResponse.last_page)
      setSummary(summaryResponse)
    } catch (error) {
      console.error('Failed to fetch expenses:', error)

      // If unauthorized, redirect to login
      const apiError = error as ApiError
      if (apiError?.message?.includes('Unauthenticated') || apiError?.response?.status === 401) {
        apiService.clearToken()
        router.push('/login')
        return
      }

      setError('Không thể tải dữ liệu chi phí phát sinh')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, router])

  const fetchExpensesWithDateFilter = useCallback(async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      const token = apiService.getToken()
      if (!token) {
        router.push('/login')
        return
      }

      const [expenseResponse, summaryResponse] = await Promise.all([
        apiService.getExpenses({ start_date: startDate, end_date: endDate }, page),
        apiService.getExpenseSummary(startDate, endDate),
      ])

      setExpenses(expenseResponse.data)
      setTotalPages(expenseResponse.last_page)
      setSummary(summaryResponse)
    } catch (error) {
      console.error('Failed to fetch expenses with date filter:', error)

      // If unauthorized, redirect to login
      const apiError = error as ApiError
      if (apiError?.message?.includes('Unauthenticated') || apiError?.response?.status === 401) {
        apiService.clearToken()
        router.push('/login')
        return
      }

      setError('Không thể tải dữ liệu chi phí phát sinh')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, page, router])

  useEffect(() => {
    // Check authentication first
    const token = apiService.getToken()
    if (!token) {
      router.push('/login')
      return
    }

    fetchExpenses()
  }, [fetchExpenses, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingExpense) {
        await apiService.updateExpense(editingExpense.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        })
      } else {
        await apiService.createExpense({
          ...formData,
          amount: parseFloat(formData.amount),
        })
      }

      setSuccess(
        editingExpense
          ? 'Cập nhật chi phí phát sinh thành công!'
          : 'Thêm chi phí phát sinh thành công!',
      )
      setOpen(false)
      resetForm()
      fetchExpenses()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
      setError(errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí phát sinh này?')) return

    try {
      await apiService.deleteExpense(id)

      setSuccess('Xóa chi phí thành công!')
      fetchExpenses()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa chi phí'
      setError(errorMessage)
    }
  }

  const resetForm = () => {
    const today = new Date()
    const formattedDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0')

    setFormData({
      expense_date: formattedDate,
      amount: '',
      description: '',
      category: 'other',
    })
    setEditingExpense(null)
    setError('')
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)

    // Đảm bảo format ngày đúng cho input date field (YYYY-MM-DD)
    let formattedDate = expense.expense_date
    try {
      // Nếu expense_date là timestamp hoặc format khác, chuyển về YYYY-MM-DD
      const dateObj = new Date(expense.expense_date)
      if (!isNaN(dateObj.getTime())) {
        formattedDate =
          dateObj.getFullYear() +
          '-' +
          String(dateObj.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(dateObj.getDate()).padStart(2, '0')
      }
    } catch (error) {
      console.error('Error formatting expense date:', error)
      // Fallback về ngày hiện tại nếu có lỗi
      const today = new Date()
      formattedDate =
        today.getFullYear() +
        '-' +
        String(today.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(today.getDate()).padStart(2, '0')
    }

    setFormData({
      expense_date: formattedDate,
      amount: expense.amount.toString(),
      description: expense.description || '',
      category: expense.category,
    })
    setOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getCategoryLabel = (category: string) => {
    return categories.find((cat) => cat.value === category)?.label || category
  }

  const getCategoryColor = (
    category: string,
  ): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default' => {
    const colors: {
      [key: string]: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default'
    } = {
      food: 'primary',
      utilities: 'secondary',
      rent: 'error',
      staff: 'warning',
      equipment: 'info',
      marketing: 'success',
      maintenance: 'default',
      other: 'default',
    }
    return colors[category] || 'default'
  }

  useEffect(() => {
    const token = apiService.getToken()
    if (!token) {
      router.push('/login')
      return
    }

    loadUser()
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Đang tải...</Typography>
      </Container>
    )
  }

  return (
    <SideBar
        title="Quản lý chi phí phát sinh"
        href="/dashboard"
        user={user}
        icon={<BarChartIcon />}
      >
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Date Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lọc theo ngày
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Button variant="contained" onClick={fetchExpensesWithDateFilter} disabled={loading}>
              Lọc dữ liệu
            </Button>
          </Box>
        </Paper>

        {/* Summary Cards */}
        {summary && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng cộng
                  </Typography>
                  <Typography variant="h6" component="div">
                    {formatCurrency(summary.total)}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        )}

        {/* Main Content */}
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h1">
              Quản lý Chi phí phát sinh
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetForm()
                setOpen(true)
              }}
            >
              Thêm chi phí
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Người tạo</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.expense_date).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error">
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(expense.category)}
                        color={getCategoryColor(expense.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{expense.user.name}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(expense)}
                        sx={{ mr: 1 }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(expense.id)}
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Paper>

        {/* Form Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>{editingExpense ? 'Sửa chi phí' : 'Thêm chi phí mới'}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    label="Danh mục"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Ngày"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expense_date: e.target.value }))
                    }
                    fullWidth
                    required
                  />

                  <TextField
                    label="Số tiền"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    fullWidth
                    required
                    inputProps={{ min: 0, max: 999999999, step: 1000, pattern: '[0-9]*' }}
                    helperText="Lưu ý: Nhập chia hết cho 1000, ví dụ: 100000"
                  />
                </Stack>

                <TextField
                  label="Mô tả (không bắt buộc)"
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" variant="contained">
                {editingExpense ? 'Cập nhật' : 'Thêm'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </SideBar>
  )
}

export default ExpensePage
