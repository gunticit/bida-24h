import {
  Widgets as WidgetsIcon,
  Settings as SettingsIcon,
  AccessTime as AccessTimeIcon,
  BarChart as BarChartIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material'

export const dashboardMenuItems = [
  { text: 'Bảng điều khiển', icon: <WidgetsIcon />, path: '/dashboard' },
  { text: 'Quản lý giờ chơi', icon: <AccessTimeIcon />, path: '/playtime' },
  { text: 'Thống kê', icon: <BarChartIcon />, path: '/revenue', admin: true },
  { text: 'Chi phí', icon: <AttachMoneyIcon />, path: '/expense', admin: true },
  { text: 'Cài đặt', icon: <SettingsIcon />, path: '/setting', admin: true },
]
