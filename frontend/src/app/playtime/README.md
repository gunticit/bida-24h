# Trang Quản lý Giờ chơi (/playtime)

## Mô tả
Trang này cho phép quản lý các session chơi game, bao gồm việc tạo mới, chỉnh sửa, xóa và theo dõi trạng thái của các session.

## Tính năng chính

### 1. Hiển thị danh sách sessions
- Bảng hiển thị tất cả sessions với thông tin chi tiết
- Thống kê nhanh về số lượng sessions theo trạng thái
- Sắp xếp và hiển thị thông tin rõ ràng

### 2. Thêm session mới
- Form tạo session với các trường:
  - Chọn bàn (từ danh sách bàn có sẵn)
  - Thời gian bắt đầu
  - Giá/giờ (tự động lấy từ bàn được chọn)
- Validation dữ liệu đầu vào

### 3. Chỉnh sửa session
- Cập nhật thông tin session hiện có
- Thay đổi trạng thái (đang chơi, đã kết thúc, đã hủy)
- Tự động tính toán thời gian chơi và tiền

### 4. Quản lý trạng thái
- **Đang chơi**: Session đang hoạt động
- **Đã kết thúc**: Session đã hoàn thành
- **Đã hủy**: Session bị hủy bỏ

### 5. Tính toán tự động
- Thời gian chơi (tính từ start_time đến end_time)
- Tiền bàn (dựa trên thời gian và giá/giờ)
- Tổng tiền (tiền bàn + tiền đồ ăn)

## Cấu trúc dữ liệu

### Session
```typescript
interface Session {
  id: number;
  table_id: number;
  start_time: string;
  end_time: string | null;
  total_time: number | null;
  hour_price: number;
  total_money_table: number | null;
  total_money_food: number | null;
  total_money: number | null;
  status: 'playing' | 'finished' | 'canceled';
  table?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}
```

### Table
```typescript
interface Table {
  id: number;
  name: string;
  status: 'available' | 'playing' | 'maintenance';
  price_per_hour: number;
  created_at: string;
  updated_at: string;
}
```

## API Endpoints

- `GET /api/sessions` - Lấy danh sách sessions
- `POST /api/sessions` - Tạo session mới
- `GET /api/sessions/{id}` - Lấy thông tin session
- `PUT /api/sessions/{id}` - Cập nhật session
- `DELETE /api/sessions/{id}` - Xóa session
- `GET /api/tables` - Lấy danh sách bàn

## Sử dụng

1. **Truy cập trang**: Điều hướng đến `/playtime`
2. **Xem danh sách**: Sessions được hiển thị trong bảng
3. **Thêm mới**: Click nút "Thêm giờ chơi mới"
4. **Chỉnh sửa**: Click icon chỉnh sửa trên session
5. **Thay đổi trạng thái**: Sử dụng các nút trạng thái
6. **Xóa**: Click icon xóa (có xác nhận)

## Lưu ý

- Chỉ người dùng đã đăng nhập mới có thể truy cập
- Session đang chơi có thể được kết thúc hoặc hủy
- Thời gian và tiền được tính toán tự động
- Dữ liệu được validate ở cả frontend và backend
