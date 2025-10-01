# Chat Widget Integration

Hệ thống chat widget đã được tích hợp vào ứng dụng 24H Billiard với cấu hình linh hoạt và dễ sử dụng.

## 📁 Cấu trúc Files

```
src/
├── app/
│   ├── api/chat/
│   │   ├── route.ts             # API proxy để giải quyết CORS
│   │   └── debug/route.ts       # Debug endpoint cho testing
│   └── (auth)/login/
│       └── page.tsx             # Trang login đã tích hợp chat widget
└── .env.local                   # Environment variables
```

## 🔧 Giải quyết vấn đề CORS

### Vấn đề
Chat widget gặp lỗi CORS khi cố gắng gọi trực tiếp đến webhook từ browser:
```
Access to fetch at 'https://vface.id.vn/webhook/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

### Giải pháp đã triển khai

#### 1. **API Proxy Route** (`/api/chat`)
- Forward requests từ frontend đến webhook 
- Xử lý CORS headers
- Support cả GET và POST methods

#### 2. **Environment Configuration**
```bash
# .env.local
NEXT_PUBLIC_CHAT_WIDGET_USE_PROXY=true
NEXT_PUBLIC_CHAT_WIDGET_WEBHOOK_URL=https://vface.id.vn/webhook/85a70869-78e4-452a-9779-d151bf283c1a/chat
CHAT_WIDGET_WEBHOOK_URL=https://vface.id.vn/webhook/85a70869-78e4-452a-9779-d151bf283c1a/chat
```

#### 3. **Dynamic URL Resolution**
- Development: Sử dụng proxy `/api/chat`
- Production: Có thể sử dụng direct URL hoặc proxy

### Testing Endpoints

#### Debug Endpoint
```bash
# Test proxy configuration
curl http://localhost:3000/api/chat/debug

# Test chat proxy
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```