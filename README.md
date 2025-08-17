# Dự án Phần mềm quản lý 24h Billiard

Dự án fullstack sử dụng Laravel cho backend API và Next.js với Material-UI cho frontend.

## Cấu trúc dự án

```
24h/
├── backend/          # Laravel API Backend
├── frontend/         # Next.js Frontend với MUI UI
└── README.md         # Hướng dẫn này
```

## Yêu cầu hệ thống

- PHP 8.1+
- Composer
- Node.js 18+
- npm hoặc yarn
- MySQL/PostgreSQL (hoặc SQLite cho development)

## Cài đặt và chạy dự án

### Backend (Laravel)

1. **Cài đặt dependencies:**
   ```bash
   cd backend
   composer install
   ```

2. **Cấu hình môi trường:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Cấu hình database trong file `.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

4. **Chạy migrations:**
   ```bash
   php artisan migrate
   ```

5. **Khởi chạy server:**
   ```bash
   php artisan serve
   ```
   
   Backend sẽ chạy tại: http://localhost:8000

### Frontend (Next.js + MUI)

1. **Cài đặt dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Khởi chạy development server:**
   ```bash
   npm run dev
   ```
   
   Frontend sẽ chạy tại: http://localhost:3000

## Scripts tiện ích

### Chạy cả backend và frontend
```bash
npm run dev
```

### Cài đặt tất cả dependencies
```bash
npm run install:all
```

### Setup dự án hoàn chỉnh
```bash
npm run setup
```

### Clean cache
```bash
npm run clean
```

### Fix linting errors
```bash
npm run fix
```

## Troubleshooting

### Lỗi "Functions cannot be passed directly to Client Components"

Đây là lỗi phổ biến khi sử dụng MUI với Next.js App Router. Đã được fix bằng cách:

1. Tạo `ThemeRegistry` component riêng với `'use client'` directive
2. Wrap tất cả MUI components trong `ThemeRegistry`
3. Cấu hình Emotion cache đúng cách

### Lỗi MUI styles không load

```bash
# Clean cache
npm run clean

# Reinstall dependencies
cd frontend && rm -rf node_modules package-lock.json && npm install
```

### Lỗi CORS

Đảm bảo file `backend/config/cors.php` đã được cấu hình đúng:

```php
'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
'supports_credentials' => true,
```

### Lỗi Database

```bash
cd backend
php artisan migrate:fresh
php artisan db:seed
```

### Lỗi Webpack Cache

```bash
# Clean webpack cache
cd frontend && npm run clean

# Restart development server
npm run dev
```

## Tính năng

### Backend (Laravel)
- RESTful API
- Authentication với Laravel Sanctum
- Database migrations và seeders
- API Resource classes
- Validation
- Error handling

### Frontend (Next.js + MUI)
- Modern UI với Material-UI components
- Responsive design
- TypeScript support
- API integration
- State management
- Routing với Next.js App Router

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/user` - Lấy thông tin user

### Users
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/{id}` - Lấy thông tin user
- `PUT /api/users/{id}` - Cập nhật user
- `DELETE /api/users/{id}` - Xóa user

## Cấu trúc thư mục chi tiết

### Backend
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   └── Services/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── config/
```

### Frontend
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── providers/
│   ├── lib/
│   │   ├── api.ts
│   │   └── emotion.ts
│   └── types/
├── public/
└── package.json
```

## Development

### Backend Development
```bash
cd backend
php artisan serve
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database
```bash
cd backend
php artisan migrate:fresh --seed
```

## Production Deployment

### Backend
1. Cấu hình production environment
2. Optimize Laravel: `php artisan config:cache`
3. Deploy lên server (VPS, Heroku, etc.)

### Frontend
1. Build production: `npm run build`
2. Deploy lên Vercel, Netlify, hoặc server

## Contributing

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License
# bida-24h
# hieu-bery
# hieu-bery
# bida-24h
