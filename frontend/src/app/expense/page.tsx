'use client'

import React, { useState, useEffect, useCallback } from 'react';
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
  Stack
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { apiService } from '@/lib/api';
import { Expense, ExpenseSummary } from '@/types/api';
import { useRouter } from 'next/navigation';

interface ApiError {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const ExpensePage = () => {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form states
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'other'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { value: 'food', label: 'Nguyên liệu thực phẩm' },
    { value: 'utilities', label: 'Tiền điện, nước' },
    { value: 'rent', label: 'Tiền thuê mặt bằng' },
    { value: 'staff', label: 'Lương nhân viên' },
    { value: 'equipment', label: 'Thiết bị, sửa chữa' },
    { value: 'marketing', label: 'Quảng cáo, marketing' },
    { value: 'maintenance', label: 'Bảo trì, vệ sinh' },
    { value: 'other', label: 'Khác' }
  ];

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = apiService.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const [expenseResponse, summaryResponse] = await Promise.all([
        apiService.getExpenses(page),
        apiService.getExpenseSummary()
      ]);
      
      setExpenses(expenseResponse.data);
      setTotalPages(expenseResponse.last_page);
      setSummary(summaryResponse);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      
      // If unauthorized, redirect to login
      const apiError = error as ApiError;
      if (apiError?.message?.includes('Unauthenticated') || 
          apiError?.response?.status === 401) {
        apiService.clearToken();
        router.push('/login');
        return;
      }
      
      setError('Không thể tải dữ liệu chi phí phát sinh');
    } finally {
      setLoading(false);
    }
  }, [page, router]);

  useEffect(() => {
    // Check authentication first
    const token = apiService.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchExpenses();
  }, [fetchExpenses, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await apiService.updateExpense(editingExpense.id, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      } else {
        await apiService.createExpense({
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }

      setSuccess(editingExpense ? 'Cập nhật chi phí phát sinh thành công!' : 'Thêm chi phí phát sinh thành công!');
      setOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí phát sinh này?')) return;
    
    try {
      await apiService.deleteExpense(id);
      
      setSuccess('Xóa chi phí thành công!');
      fetchExpenses();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa chi phí';
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      expense_date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: 'other'
    });
    setEditingExpense(null);
    setError('');
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      expense_date: expense.expense_date,
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category
    });
    setOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const getCategoryColor = (category: string): "primary" | "secondary" | "error" | "warning" | "info" | "success" | "default" => {
    const colors: { [key: string]: "primary" | "secondary" | "error" | "warning" | "info" | "success" | "default" } = {
      food: 'primary',
      utilities: 'secondary',
      rent: 'error',
      staff: 'warning',
      equipment: 'info',
      marketing: 'success',
      maintenance: 'default',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Đang tải...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

      {/* Summary Cards */}
      {summary && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Hôm nay
                </Typography>
                <Typography variant="h6" component="div">
                  {formatCurrency(summary.today)}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tháng này
                </Typography>
                <Typography variant="h6" component="div">
                  {formatCurrency(summary.this_month)}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Năm này
                </Typography>
                <Typography variant="h6" component="div">
                  {formatCurrency(summary.this_year)}
                </Typography>
              </CardContent>
            </Card>
            
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
              resetForm();
              setOpen(true);
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
          <DialogTitle>
            {editingExpense ? 'Sửa chi phí' : 'Thêm chi phí mới'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Ngày"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                  fullWidth
                  required
                />
                
                <TextField
                  label="Số tiền"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Stack>
              
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  label="Danh mục"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                required
                multiline
                rows={3}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="contained">
              {editingExpense ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ExpensePage;
