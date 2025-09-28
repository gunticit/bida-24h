## TwentyFourH (React Native)

Hướng dẫn nhanh để chạy dự án trên máy của bạn.

### Yêu cầu môi trường
- Node.js ≥ 20
- iOS: Xcode, CocoaPods (`bundle install` lần đầu trong thư mục `ios`)
- Android: Android Studio, Android SDK, emulator hoặc thiết bị thật

### Lệnh thường dùng
- `npm start` hoặc `npm run start:reset`: bật Metro (dev server)
- `npm run ios`: chạy iOS (Simulator)
- `npm run android`: chạy Android (emulator/thiết bị)
- `npm run pods`: cài đặt CocoaPods trong `ios/`
- `npm run android:clean`: dọn build Android
- `npm run typecheck`: kiểm tra TypeScript
- `npm run lint`: lint mã nguồn
- `npm run format`: định dạng mã nguồn với Prettier

### Lần đầu thiết lập iOS
```sh
bundle install
npm run pods
```

Sau đó có thể chạy:
```sh
npm run ios
```

### Gợi ý khắc phục sự cố
- Lỗi Metro cache: chạy `npm run start:reset`
- Lỗi build iOS liên quan Pods: chạy lại `npm run pods`
- Lỗi build Android: thử `npm run android:clean` rồi chạy lại

### Cấu hình API
- Mặc định `baseURL` được đặt ở `src/config.ts` (trường `apiBaseUrl`).
- Sửa giá trị trỏ tới backend của bạn, ví dụ:
  - Local: `http://localhost:8000/api`
  - Thiết bị thật cùng mạng: `http://<IP_may_tinh>:8000/api`
- Nếu Metro chạy port 8002, không ảnh hưởng API; API là server Laravel của bạn (port 8000).
