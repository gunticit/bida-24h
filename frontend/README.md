# Frontend - Next.js + MUI

Frontend application sử dụng Next.js 15 với Material-UI (MUI) và TypeScript.

## Tính năng

- ✅ Next.js 15 với App Router
- ✅ Material-UI (MUI) components
- ✅ TypeScript support
- ✅ Emotion CSS-in-JS
- ✅ Responsive design
- ✅ Authentication pages
- ✅ Dashboard với user management
- ✅ API integration với Laravel backend

## Cài đặt

```bash
npm install
```

## Development

```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Troubleshooting

### Lỗi "Functions cannot be passed directly to Client Components"

Nếu gặp lỗi này, hãy đảm bảo:

1. Tất cả MUI components được wrap trong `ThemeRegistry`
2. Sử dụng `'use client'` directive cho các components sử dụng hooks
3. Không truyền functions từ Server Components sang Client Components

### Lỗi Emotion/MUI styles

```bash
# Clean cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Lỗi TypeScript

```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix auto-fixable issues
npm run lint -- --fix
```

## Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── providers/         # Context providers
│   │   └── ThemeRegistry.tsx
│   └── ui/               # UI components
├── lib/                  # Utilities
│   ├── api.ts           # API service
│   └── emotion.ts       # Emotion cache
└── types/               # TypeScript types
```

## API Integration

Frontend kết nối với Laravel backend thông qua:

- **Base URL:** `http://localhost:8000/api` (development)
- **Authentication:** Bearer token với Laravel Sanctum
- **Error Handling:** Centralized error handling trong `api.ts`

## Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME="Laravel + Next.js + MUI App"
NEXT_PUBLIC_APP_DESCRIPTION="Fullstack application"
```

## Performance Optimization

- ✅ Emotion cache optimization
- ✅ Font optimization với `display: swap`
- ✅ Image optimization với Next.js
- ✅ Code splitting tự động
- ✅ Bundle analysis với `@next/bundle-analyzer`

## Deployment

### Vercel (Recommended)

1. Connect repository với Vercel
2. Set environment variables
3. Deploy tự động

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request
