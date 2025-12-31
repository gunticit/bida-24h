'use client'

import React, { useState, useEffect } from 'react'
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Divider,
    IconButton,
    Grid,
    Tooltip,
    SelectChangeEvent,
} from '@mui/material'
import {
    TrendingUp as TrendingUpIcon,
    TableRestaurant as TableIcon,
    Restaurant as FoodIcon,
    AccessTime as TimeIcon,
    Close as CloseIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    CalendarMonth as CalendarMonthIcon,
    BarChart as ChartIcon,
} from '@mui/icons-material'
import { apiService } from '@/lib/api'
import { formatMoney } from '@/utils/formatters'
import { printPlaytimeReport } from '@/utils/playtimeReportUtils'
import { PlaytimeReportData } from '@/types/api'

interface MonthlyStatisticsDialogProps {
    open: boolean
    onClose: () => void
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info') => void
}

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    subtitle?: string
}

interface TableStatItem {
    table_name: string
    sessions_count: number
    total_hours: number
    table_revenue: number
    food_revenue: number
    total_revenue: number
}

interface FoodStatItem {
    menu_name: string
    category: string
    total_quantity: number
    unit_price: number
    total_amount: number
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
    <Card
        sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            border: `1px solid ${color}30`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${color}20`,
            }
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: color }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${color}20`,
                        color: color,
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
)

export const MonthlyStatisticsDialog: React.FC<MonthlyStatisticsDialogProps> = ({
    open,
    onClose,
    showSnackbar,
}) => {
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear())
    const [loading, setLoading] = useState<boolean>(false)
    const [reportData, setReportData] = useState<PlaytimeReportData | null>(null)
    const [downloadLoading, setDownloadLoading] = useState<boolean>(false)

    // Generate month and year options
    const months = [
        { value: 1, label: 'Tháng 1' },
        { value: 2, label: 'Tháng 2' },
        { value: 3, label: 'Tháng 3' },
        { value: 4, label: 'Tháng 4' },
        { value: 5, label: 'Tháng 5' },
        { value: 6, label: 'Tháng 6' },
        { value: 7, label: 'Tháng 7' },
        { value: 8, label: 'Tháng 8' },
        { value: 9, label: 'Tháng 9' },
        { value: 10, label: 'Tháng 10' },
        { value: 11, label: 'Tháng 11' },
        { value: 12, label: 'Tháng 12' },
    ]

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

    // Calculate date range for selected month
    const getDateRange = () => {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0)
        const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59)

        const formatDate = (date: Date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hour = String(date.getHours()).padStart(2, '0')
            const minute = String(date.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hour}:${minute}`
        }

        return {
            from: formatDate(startDate),
            to: formatDate(endDate),
        }
    }

    // Load report data when month/year changes
    const loadReportData = async () => {
        setLoading(true)
        try {
            const { from, to } = getDateRange()
            const data = await apiService.getPlaytimeReportData(from, to)
            setReportData(data)
        } catch (error) {
            console.error('Failed to load monthly report:', error)
            showSnackbar('Không thể tải thống kê tháng', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Auto load when dialog opens or month/year changes
    useEffect(() => {
        if (open) {
            loadReportData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, selectedMonth, selectedYear])

    // Handle download Excel
    const handleDownloadExcel = async () => {
        setDownloadLoading(true)
        try {
            const { from, to } = getDateRange()
            await apiService.downloadPlaytimeReport(from, to)
            showSnackbar('Tải báo cáo thành công!', 'success')
        } catch (error) {
            console.error('Failed to download report:', error)
            showSnackbar('Không thể tải báo cáo', 'error')
        } finally {
            setDownloadLoading(false)
        }
    }

    // Handle print report
    const handlePrintReport = async () => {
        if (reportData) {
            printPlaytimeReport(reportData)
            showSnackbar('In báo cáo thành công!', 'success')
        }
    }

    const handleMonthChange = (e: SelectChangeEvent<number>) => {
        setSelectedMonth(e.target.value as number)
    }

    const handleYearChange = (e: SelectChangeEvent<number>) => {
        setSelectedYear(e.target.value as number)
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 2,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                        Thống kê theo tháng
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {/* Month/Year Selector */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Tháng</InputLabel>
                        <Select
                            value={selectedMonth}
                            label="Tháng"
                            onChange={handleMonthChange}
                        >
                            {months.map((month) => (
                                <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Năm</InputLabel>
                        <Select
                            value={selectedYear}
                            label="Năm"
                            onChange={handleYearChange}
                        >
                            {years.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Chip
                        icon={<ChartIcon />}
                        label={`Tháng ${selectedMonth}/${selectedYear}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : reportData ? (
                    <>
                        {/* Statistics Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="Tổng doanh thu"
                                    value={formatMoney(reportData.total_revenue)}
                                    icon={<TrendingUpIcon />}
                                    color="#2196f3"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="Doanh thu bàn"
                                    value={formatMoney(reportData.total_table_revenue)}
                                    icon={<TableIcon />}
                                    color="#4caf50"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="Doanh thu đồ ăn"
                                    value={formatMoney(reportData.total_food_revenue)}
                                    icon={<FoodIcon />}
                                    color="#ff9800"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <StatCard
                                    title="Tổng sessions"
                                    value={reportData.total_sessions}
                                    icon={<TimeIcon />}
                                    color="#9c27b0"
                                    subtitle={`${reportData.summary.total_play_hours.toFixed(1)} giờ chơi`}
                                />
                            </Grid>
                        </Grid>

                        {/* Summary Info */}
                        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Thời gian TB/session
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        {reportData.summary.avg_session_duration.toFixed(1)} phút
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Doanh thu TB/session
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        {formatMoney(reportData.summary.avg_revenue_per_session)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tổng món ăn bán ra
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        {reportData.summary.total_food_items_sold} món
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Divider sx={{ my: 2 }} />

                        {/* Table Statistics */}
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            📊 Thống kê theo bàn
                        </Typography>
                        {reportData.table_stats.length > 0 ? (
                            <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Tên bàn</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Sessions</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Giờ chơi</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>DT Bàn</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>DT Đồ ăn</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Tổng DT</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData.table_stats.map((table: TableStatItem, index: number) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <Chip label={table.table_name} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="center">{table.sessions_count}</TableCell>
                                                <TableCell align="right">{table.total_hours.toFixed(1)}h</TableCell>
                                                <TableCell align="right">{formatMoney(table.table_revenue)}</TableCell>
                                                <TableCell align="right">{formatMoney(table.food_revenue)}</TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight={600} color="primary">
                                                        {formatMoney(table.total_revenue)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
                                <Typography color="text.secondary">
                                    Không có dữ liệu thống kê bàn trong tháng này
                                </Typography>
                            </Paper>
                        )}

                        {/* Food Statistics */}
                        {reportData.food_stats.length > 0 && (
                            <>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                                    🍽️ Thống kê đồ ăn/uống
                                </Typography>
                                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Tên món</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>SL bán</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Đơn giá</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Tổng tiền</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reportData.food_stats.map((food: FoodStatItem, index: number) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>{food.menu_name}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={
                                                                food.category === 'food' ? 'Đồ ăn' :
                                                                    food.category === 'drink' ? 'Đồ uống' : 'Thuốc lá'
                                                            }
                                                            size="small"
                                                            color={
                                                                food.category === 'food' ? 'primary' :
                                                                    food.category === 'drink' ? 'secondary' : 'warning'
                                                            }
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">{food.total_quantity}</TableCell>
                                                    <TableCell align="right">{formatMoney(food.unit_price)}</TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight={600} color="success.main">
                                                            {formatMoney(food.total_amount)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">
                            Không có dữ liệu thống kê cho tháng này
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} color="inherit">
                    Đóng
                </Button>
                <Tooltip title="In báo cáo">
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintReport}
                        disabled={!reportData || loading}
                    >
                        In báo cáo
                    </Button>
                </Tooltip>
                <Tooltip title="Tải Excel">
                    <Button
                        variant="contained"
                        startIcon={downloadLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                        onClick={handleDownloadExcel}
                        disabled={!reportData || loading || downloadLoading}
                    >
                        {downloadLoading ? 'Đang tải...' : 'Tải Excel'}
                    </Button>
                </Tooltip>
            </DialogActions>
        </Dialog>
    )
}

export default MonthlyStatisticsDialog
