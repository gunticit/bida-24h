# Global Chat Widget Setup

## 📋 Tổng quan
Global Chat Widget đã được tích hợp vào toàn bộ ứng dụng, tự động hiển thị ở tất cả các trang đã đăng nhập.

## 🎯 Cách hoạt động

### 1. **Auto-Detection**
- Tự động kiểm tra trạng thái đăng nhập
- Chỉ hiển thị khi user đã authenticate
- Tự động ẩn ở các trang login/register

### 2. **Smart Routing**
- Theo dõi thay đổi route với `usePathname()`
- Reset chat widget khi chuyển trang
- Metadata tự động bao gồm thông tin trang hiện tại

### 3. **Excluded Pages**
```typescript
const EXCLUDED_PAGES = [
  '/login',
  '/register', 
  '/forgot-password',
  '/reset-password'
]
```

## 🛠️ Cấu hình

### Files đã tạo/sửa:
1. **`/components/chat/GlobalChatWidget.tsx`** - Component chính
2. **`/app/layout.tsx`** - Thêm widget vào root layout
3. **`/app/dashboard/page.tsx`** - Loại bỏ chat riêng lẻ

### Cấu hình Chat:
```typescript
{
  webhookUrl: 'https://vface.id.vn/webhook/85a70869-78e4-452a-9779-d151bf283c1a/chat',
  target: '#global-n8n-chat',
  mode: 'window',
  showWelcomeScreen: true,
  i18n: {
    en: {
      title: 'Xin chào! 👋',
      subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.',
      inputPlaceholder: 'Nhập tin nhắn của bạn...'
    }
  }
}
```

## 🎨 Styling

### Position:
- Fixed position ở góc phải dưới
- `bottom: 20px, right: 20px`
- `z-index: 9999` để luôn hiển thị trên cùng

### Responsive:
- Mobile: `bottom: 10px, right: 10px`
- Tự động điều chỉnh theo màn hình

## 🚀 Kết quả

### ✅ Đã hoạt động:
- **Dashboard** - Chat hiển thị
- **Playtime** - Chat hiển thị  
- **Revenue** - Chat hiển thị
- **Settings** - Chat hiển thị
- **Expense** - Chat hiển thị

### ❌ Không hiển thị:
- **Login page** - Excluded
- **Register page** - Excluded
- **Forgot password** - Excluded
- **Before authentication** - Auto-hidden

## 🔧 Troubleshooting

### Chat không hiển thị:
1. Kiểm tra authentication token
2. Kiểm tra pathname không trong EXCLUDED_PAGES
3. Kiểm tra console errors

### Múltiple chat widgets:
1. Đã loại bỏ chat riêng lẻ khỏi dashboard
2. GlobalChatWidget tự động prevent duplicate

### Performance:
1. Chat chỉ init khi cần thiết
2. Cleanup automatic khi unmount
3. Reset khi chuyển trang

## 🎯 Customization

### Thêm trang excluded:
```typescript
const EXCLUDED_PAGES = [
  '/login',
  '/register',
  '/your-new-page'  // Thêm vào đây
]
```

### Thay đổi vị trí:
```typescript
style={{
  position: 'fixed',
  bottom: '20px',    // Thay đổi vị trí
  right: '20px',     // Thay đổi vị trí
  zIndex: 9999
}}
```

### Custom messages:
```typescript
initialMessages: [
  'Message tùy chỉnh 1',
  'Message tùy chỉnh 2'
]
```