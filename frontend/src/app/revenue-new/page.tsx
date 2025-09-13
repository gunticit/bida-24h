'use client'

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Button,
  Stack,
  Chip
} from '@mui/material';
import { apiService } from '@/lib/api';
import { 
  RevenueSummaryResponse
} from '@/types/api';

const RevenuePage = () => {
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const summaryData = await apiService.getRevenueSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load revenue summary:', error);
      setError('Không thể tải tóm tắt doanh thu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
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

      <Typography variant="h4" gutterBottom>
        Báo cáo Doanh thu & Lợi nhuận (Mới)
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={loadSummary} disabled={loading}>
          Tải lại dữ liệu
        </Button>
      </Stack>

      {summary && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Hôm nay */}
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hôm nay
              </Typography>
              <Typography variant="h6" color="primary">
                Doanh thu: {formatCurrency(summary.today.revenue)}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Chi phí nguồn hàng: {formatCurrency(summary.today.cost_of_goods_sold)}
              </Typography>
              <Typography variant="body2" color="error">
                Chi phí phát sinh: {formatCurrency(summary.today.expenses)}
              </Typography>
              <Typography variant="body2" color="success.main">
                Lợi nhuận: {formatCurrency(summary.today.profit)}
              </Typography>
              <Chip
                label={formatPercent(summary.today.profit_margin)}
                color={summary.today.profit_margin >= 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>

          {/* Tháng này */}
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tháng này
              </Typography>
              <Typography variant="h6" color="primary">
                Doanh thu: {formatCurrency(summary.this_month.revenue)}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Chi phí nguồn hàng: {formatCurrency(summary.this_month.cost_of_goods_sold)}
              </Typography>
              <Typography variant="body2" color="error">
                Chi phí phát sinh: {formatCurrency(summary.this_month.expenses)}
              </Typography>
              <Typography variant="body2" color="success.main">
                Lợi nhuận: {formatCurrency(summary.this_month.profit)}
              </Typography>
              <Chip
                label={formatPercent(summary.this_month.profit_margin)}
                color={summary.this_month.profit_margin >= 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>

          {/* Năm này */}
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Năm này
              </Typography>
              <Typography variant="h6" color="primary">
                Doanh thu: {formatCurrency(summary.this_year.revenue)}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Chi phí nguồn hàng: {formatCurrency(summary.this_year.cost_of_goods_sold)}
              </Typography>
              <Typography variant="body2" color="error">
                Chi phí phát sinh: {formatCurrency(summary.this_year.expenses)}
              </Typography>
              <Typography variant="body2" color="success.main">
                Lợi nhuận: {formatCurrency(summary.this_year.profit)}
              </Typography>
              <Chip
                label={formatPercent(summary.this_year.profit_margin)}
                color={summary.this_year.profit_margin >= 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>

          {/* Tổng cộng */}
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng cộng
              </Typography>
              <Typography variant="h6" color="primary">
                Doanh thu: {formatCurrency(summary.total.revenue)}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Chi phí nguồn hàng: {formatCurrency(summary.total.cost_of_goods_sold)}
              </Typography>
              <Typography variant="body2" color="error">
                Chi phí phát sinh: {formatCurrency(summary.total.expenses)}
              </Typography>
              <Typography variant="body2" color="success.main">
                Lợi nhuận: {formatCurrency(summary.total.profit)}
              </Typography>
              <Chip
                label={formatPercent(summary.total.profit_margin)}
                color={summary.total.profit_margin >= 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Box>
      )}

      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Giải thích tính toán:
        </Typography>
        <Typography variant="body2" paragraph>
          • <strong>Chi phí nguồn hàng</strong>: Được tính từ giá vốn của các sản phẩm bán ra (nếu không có giá vốn thì tính = 60% giá bán)
        </Typography>
        <Typography variant="body2" paragraph>
          • <strong>Chi phí phát sinh</strong>: Tổng các chi phí khác được nhập vào hệ thống (điện nước, thuê mặt bằng, lương, v.v.)
        </Typography>
        <Typography variant="body2">
          • <strong>Lợi nhuận</strong> = Doanh thu - Chi phí nguồn hàng - Chi phí phát sinh
        </Typography>
      </Paper>
    </Container>
  );
};

export default RevenuePage;
