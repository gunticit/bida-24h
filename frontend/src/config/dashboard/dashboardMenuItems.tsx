import InboxIcon from '@mui/icons-material/MoveToInbox'
import MailIcon from '@mui/icons-material/Mail'

export const dashboardMenuItems = [
  { text: 'Dashboard', icon: <InboxIcon />, path: '/dashboard' },
  { text: 'Quản lý giờ chơi', icon: <MailIcon />, path: '/playtime' },
  { text: 'Thống kê', icon: <InboxIcon />, path: '/revenue', admin: true },
  { text: 'Chi phí', icon: <MailIcon />, path: '/expense', admin: true },
  { text: 'Cài đặt', icon: <InboxIcon />, path: '/setting', admin: true },
]
