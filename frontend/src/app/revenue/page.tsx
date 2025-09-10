'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
} from '@mui/material';
import {
  TrendingUp,
  Restaurant,
  AccessTime,
  AttachMoney,
  CalendarToday,
  BarChart,
} from '@mui/icons-material';
import { apiService, User } from '@/lib/api';
import { AppBar } from '@/components/ui';

interface RevenueData {
  total_revenue: number;
  table_revenue: number;
  food_revenue: number;
  session_count: number;
  date?: string;
  year?: number;
  month?: number;
  month_name?: string;
  daily_breakdown?: any[];
  monthly_breakdown?: any[];
  sessions?: any[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`revenue-tabpanel-${index}`}
      aria-labelledby={`revenue-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RevenuePage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Daily data
  const [dailyData, setDailyData] = useState<RevenueData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Monthly data
  const [monthlyData, setMonthlyData] = useState<RevenueData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Yearly data
  const [yearlyData, setYearlyData] = useState<RevenueData | null>(null);
  const [selectedYearForYearly, setSelectedYearForYearly] = useState(new Date().getFullYear());
  
  // Top tables
  const [topTables, setTopTables] = useState<any[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const loadDailyRevenue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDailyRevenue(selectedDate);
      setDailyData(data);
    } catch (err) {
      setError('Không thể tải doanh thu ngày');
      console.error('Error loading daily revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyRevenue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMonthlyRevenue(selectedYear, selectedMonth);
      setMonthlyData(data);
    } catch (err) {
      setError('Không thể tải doanh thu tháng');
      console.error('Error loading monthly revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyRevenue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getYearlyRevenue(selectedYearForYearly);
      setYearlyData(data);
    } catch (err) {
      setError('Không thể tải doanh thu năm');
      console.error('Error loading yearly revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopTables = async () => {
    try {
      const data = await apiService.getTopTables(5, 'this_month');
      setTopTables(data);
    } catch (err) {
      console.error('Error loading top tables:', err);
    }
  };

  useEffect(() => {
    loadUser();
    loadDailyRevenue();
    loadTopTables();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      loadDailyRevenue();
    } else if (tabValue === 1) {
      loadMonthlyRevenue();
    } else if (tabValue === 2) {
      loadYearlyRevenue();
    }
  }, [tabValue, selectedDate, selectedYear, selectedMonth, selectedYearForYearly]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const RevenueCard = ({ title, value, icon, color = 'primary' }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {formatCurrency(value)}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDailyTab = () => (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <TextField
          label="Chọn ngày"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={loadDailyRevenue} disabled={loading}>
          Tải lại
        </Button>
      </Box>

      {dailyData && (
        <>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Tổng doanh thu"
                value={dailyData.total_revenue}
                icon={<AttachMoney sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Doanh thu bàn"
                value={dailyData.table_revenue}
                icon={<AccessTime sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Doanh thu thức ăn"
                value={dailyData.food_revenue}
                icon={<Restaurant sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Số session"
                value={dailyData.session_count}
                icon={<BarChart sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
          </Grid>

          {dailyData.sessions && dailyData.sessions.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chi tiết session ngày {selectedDate}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bàn</TableCell>
                        <TableCell>Thời gian bắt đầu</TableCell>
                        <TableCell>Thời gian kết thúc</TableCell>
                        <TableCell>Thời gian chơi (phút)</TableCell>
                        <TableCell>Tiền bàn</TableCell>
                        <TableCell>Tiền thức ăn</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dailyData.sessions.map((session: any) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.table_name}</TableCell>
                          <TableCell>{session.start_time}</TableCell>
                          <TableCell>{session.end_time || '-'}</TableCell>
                          <TableCell>{session.total_time || '-'}</TableCell>
                          <TableCell>{formatCurrency(session.table_revenue)}</TableCell>
                          <TableCell>{formatCurrency(session.food_revenue)}</TableCell>
                          <TableCell>
                            <Chip
                              label={formatCurrency(session.total_revenue)}
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );

  const renderMonthlyTab = () => (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Năm</InputLabel>
          <Select
            value={selectedYear}
            label="Năm"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Tháng</InputLabel>
          <Select
            value={selectedMonth}
            label="Tháng"
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <MenuItem key={month} value={month}>
                Tháng {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={loadMonthlyRevenue} disabled={loading}>
          Tải lại
        </Button>
      </Box>

      {monthlyData && (
        <>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Tổng doanh thu"
                value={monthlyData.total_revenue}
                icon={<AttachMoney sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Doanh thu bàn"
                value={monthlyData.table_revenue}
                icon={<AccessTime sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Doanh thu thức ăn"
                value={monthlyData.food_revenue}
                icon={<Restaurant sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Số session"
                value={monthlyData.session_count}
                icon={<BarChart sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
          </Grid>

          {monthlyData.daily_breakdown && monthlyData.daily_breakdown.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Doanh thu theo ngày trong tháng
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ngày</TableCell>
                        <TableCell>Tổng doanh thu</TableCell>
                        <TableCell>Doanh thu bàn</TableCell>
                        <TableCell>Doanh thu thức ăn</TableCell>
                        <TableCell>Số session</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyData.daily_breakdown.map((day: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{day.date}</TableCell>
                          <TableCell>{formatCurrency(day.total_revenue)}</TableCell>
                          <TableCell>{formatCurrency(day.table_revenue)}</TableCell>
                          <TableCell>{formatCurrency(day.food_revenue)}</TableCell>
                          <TableCell>{day.session_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );

  const renderYearlyTab = () => (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Năm</InputLabel>
          <Select
            value={selectedYearForYearly}
            label="Năm"
            onChange={(e) => setSelectedYearForYearly(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={loadYearlyRevenue} disabled={loading}>
          Tải lại
        </Button>
      </Box>

      {yearlyData && (
        <>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Tổng doanh thu"
                value={yearlyData.total_revenue}
                icon={<AttachMoney sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Doanh thu bàn"
                value={yearlyData.table_revenue}
                icon={<AccessTime sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Doanh thu thức ăn"
                value={yearlyData.food_revenue}
                icon={<Restaurant sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RevenueCard
                title="Số session"
                value={yearlyData.session_count}
                icon={<BarChart sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
          </Grid>

          {yearlyData.monthly_breakdown && yearlyData.monthly_breakdown.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Doanh thu theo tháng trong năm
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tháng</TableCell>
                        <TableCell>Tổng doanh thu</TableCell>
                        <TableCell>Doanh thu bàn</TableCell>
                        <TableCell>Doanh thu thức ăn</TableCell>
                        <TableCell>Số session</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yearlyData.monthly_breakdown.map((month: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{month.month_name}</TableCell>
                          <TableCell>{formatCurrency(month.total_revenue)}</TableCell>
                          <TableCell>{formatCurrency(month.table_revenue)}</TableCell>
                          <TableCell>{formatCurrency(month.food_revenue)}</TableCell>
                          <TableCell>{month.session_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        title="Thống kê doanh thu"
        user={user}
        onLogout={handleLogout}
        icon={<BarChart />}
      />
      
      <Box sx={{ p: 3 }}>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="revenue tabs">
          <Tab label="Doanh thu ngày" />
          <Tab label="Doanh thu tháng" />
          <Tab label="Doanh thu năm" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          renderDailyTab()
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          renderMonthlyTab()
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          renderYearlyTab()
        )}
      </TabPanel>

      {/* Top Tables Section */}
      {topTables.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top 5 bàn có doanh thu cao nhất tháng này
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bàn</TableCell>
                    <TableCell>Tổng doanh thu</TableCell>
                    <TableCell>Doanh thu bàn</TableCell>
                    <TableCell>Doanh thu thức ăn</TableCell>
                    <TableCell>Số session</TableCell>
                    <TableCell>Doanh thu TB/session</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topTables.map((table: any) => (
                    <TableRow key={table.table_id}>
                      <TableCell>
                        <Chip label={table.table_name} color="primary" />
                      </TableCell>
                      <TableCell>{formatCurrency(table.total_revenue)}</TableCell>
                      <TableCell>{formatCurrency(table.table_revenue)}</TableCell>
                      <TableCell>{formatCurrency(table.food_revenue)}</TableCell>
                      <TableCell>{table.session_count}</TableCell>
                      <TableCell>{formatCurrency(table.avg_revenue_per_session)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      </Box>
    </Box>
  );
}
