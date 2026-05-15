import {
  Dashboard as DashboardIcon,
  AccessTime as AccessTimeIcon,
  Analytics as AnalyticsIcon,
  AccountBalanceWallet as WalletIcon,
  Tune as TuneIcon,
} from '@mui/icons-material'

export const dashboardMenuItems = [
  { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Quản lý giờ chơi', icon: <AccessTimeIcon />, path: '/playtime' },
  { text: 'Thống kê doanh thu', icon: <AnalyticsIcon />, path: '/revenue', admin: true },
  { text: 'Chi phí', icon: <WalletIcon />, path: '/expense', admin: true },
  { text: 'Cài đặt', icon: <TuneIcon />, path: '/setting', admin: true },
]
