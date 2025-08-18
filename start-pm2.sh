#!/bin/bash

# Script khởi động ứng dụng với PM2

echo "🚀 Khởi động ứng dụng Bida 24h với PM2..."

# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt dependencies..."
    npm install
fi

# Build ứng dụng cho production
echo "🔨 Building ứng dụng..."
npm run build

# Khởi động với PM2
echo "⚡ Khởi động với PM2..."
pm2 start ecosystem.config.js --env production

# Hiển thị trạng thái
echo "📊 Trạng thái PM2:"
pm2 status

echo "✅ Ứng dụng đã được khởi động!"
echo "🌐 Truy cập: http://localhost:3000"
echo "📝 Logs: pm2 logs bida-24h-frontend"
