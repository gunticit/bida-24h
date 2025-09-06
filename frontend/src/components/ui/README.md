# UI Components

## AppBar Component

Component AppBar dùng chung cho toàn bộ ứng dụng với menu người dùng.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Tiêu đề hiển thị trên AppBar |
| `user` | `User \| null` | ✅ | Thông tin người dùng hiện tại |
| `onLogout` | `() => void` | ✅ | Function xử lý đăng xuất |
| `icon` | `React.ReactNode` | ❌ | Icon hiển thị bên cạnh tiêu đề |

### User Interface

```typescript
interface User {
  id: number;
  name: string;
  role?: string;
  email: string;
}
```

### Cách sử dụng

```tsx
import { AppBar } from '@/components/ui';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

function MyPage() {
  const user = {
    id: 1,
    name: 'Nguyễn Văn A',
    role: 'Admin',
    email: 'admin@example.com'
  };

  const handleLogout = async () => {
    // Xử lý đăng xuất
    await apiService.logout();
    router.push('/');
  };

  return (
    <AppBar 
      title="Quản lý Giờ chơi"
      user={user}
      onLogout={handleLogout}
      icon={<CalendarIcon />}
    />
  );
}
```

### Tính năng

- Hiển thị thông tin người dùng (tên và vai trò)
- Menu dropdown với các tùy chọn:
  - Dashboard
  - Hồ sơ
  - Cài đặt
  - Đăng xuất
- Avatar với chữ cái đầu của tên người dùng
- Icon tùy chỉnh cho từng trang
- Responsive design

### Menu Items

Menu dropdown bao gồm:
- **Dashboard**: Chuyển đến trang dashboard
- **Hồ sơ**: Xem thông tin cá nhân (chưa implement)
- **Cài đặt**: Chuyển đến trang cài đặt
- **Đăng xuất**: Thực hiện đăng xuất

### Styling

Component sử dụng Material-UI theme và có thể tùy chỉnh thông qua:
- `sx` prop cho styling tùy chỉnh
- Theme provider cho styling toàn cục
