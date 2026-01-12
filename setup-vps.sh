#!/bin/bash

# ============================================================
# SETUP SCRIPT FOR 24H BILLIARDS COFFEE
# ============================================================
# Domains:
#   - Frontend: tinhtien.24hbilliardscoffee.com
#   - Backend API: api.24hbilliardscoffee.com
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DOMAIN="tinhtien.24hbilliardscoffee.com"
API_DOMAIN="api.24hbilliardscoffee.com"
PROJECT_DIR="/var/www/bida-24h"
FRONTEND_PORT="3001"
BACKEND_PORT="8001"
EMAIL="admin@24hbilliardscoffee.com"  # Thay đổi email của bạn

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}     SETUP 24H BILLIARDS COFFEE - VPS DEPLOYMENT            ${NC}"
echo -e "${BLUE}============================================================${NC}"

# ============================================================
# FUNCTION: Print status
# ============================================================
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ============================================================
# STEP 1: Check if running as root
# ============================================================
echo -e "\n${YELLOW}Step 1: Kiểm tra quyền root...${NC}"
if [ "$EUID" -ne 0 ]; then
    print_error "Script này cần chạy với quyền root. Vui lòng chạy: sudo ./setup-vps.sh"
    exit 1
fi
print_status "Đang chạy với quyền root"

# ============================================================
# STEP 2: Install required packages
# ============================================================
echo -e "\n${YELLOW}Step 2: Cài đặt các gói cần thiết...${NC}"

# Check OS
if [ -f /etc/debian_version ]; then
    OS="debian"
    apt-get update -y
    apt-get install -y certbot python3-certbot-nginx curl git
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
    yum install -y certbot python3-certbot-nginx curl git
else
    print_warning "Không xác định được OS, bỏ qua cài đặt packages..."
fi

print_status "Đã cài đặt các gói cần thiết"

# ============================================================
# STEP 3: Create Nginx config for Frontend
# ============================================================
echo -e "\n${YELLOW}Step 3: Tạo cấu hình Nginx cho Frontend...${NC}"

cat > /etc/nginx/sites-available/${FRONTEND_DOMAIN}.conf << 'NGINX_FRONTEND'
# ============================================================
# FRONTEND: tinhtien.24hbilliardscoffee.com
# ============================================================
server {
    listen 80;
    listen [::]:80;
    server_name tinhtien.24hbilliardscoffee.com;

    # Redirect to HTTPS (uncomment after SSL setup)
    # return 301 https://$host$request_uri;

    # Ghi log
    access_log /var/log/nginx/tinhtien.access.log;
    error_log /var/log/nginx/tinhtien.error.log;

    # ======================================================
    # FRONTEND (Next.js)
    # ======================================================
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # ======================================================
    # Next.js Static files
    # ======================================================
    location /_next/ {
        proxy_pass http://127.0.0.1:3001/_next/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Cache static files
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ======================================================
    # Health check
    # ======================================================
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_FRONTEND

print_status "Đã tạo cấu hình Nginx cho ${FRONTEND_DOMAIN}"

# ============================================================
# STEP 4: Create Nginx config for API Backend
# ============================================================
echo -e "\n${YELLOW}Step 4: Tạo cấu hình Nginx cho API Backend...${NC}"

cat > /etc/nginx/sites-available/${API_DOMAIN}.conf << 'NGINX_API'
# ============================================================
# API BACKEND: api.24hbilliardscoffee.com
# ============================================================
server {
    listen 80;
    listen [::]:80;
    server_name api.24hbilliardscoffee.com;

    # Redirect to HTTPS (uncomment after SSL setup)
    # return 301 https://$host$request_uri;

    # Ghi log
    access_log /var/log/nginx/api.access.log;
    error_log /var/log/nginx/api.error.log;

    # Max upload size
    client_max_body_size 100M;

    # ======================================================
    # API Routes
    # ======================================================
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;

        # CORS Headers
        add_header Access-Control-Allow-Origin "https://tinhtien.24hbilliardscoffee.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, X-CSRF-TOKEN" always;
        add_header Access-Control-Allow-Credentials "true" always;

        # Handle preflight requests
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://tinhtien.24hbilliardscoffee.com";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, X-CSRF-TOKEN";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # ======================================================
    # Storage (Public files)
    # ======================================================
    location /storage {
        proxy_pass http://127.0.0.1:8001/storage;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static files
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # ======================================================
    # Health check
    # ======================================================
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_API

print_status "Đã tạo cấu hình Nginx cho ${API_DOMAIN}"

# ============================================================
# STEP 5: Enable sites
# ============================================================
echo -e "\n${YELLOW}Step 5: Kích hoạt các site...${NC}"

# Create sites-enabled if not exists
mkdir -p /etc/nginx/sites-enabled

# Create symlinks
ln -sf /etc/nginx/sites-available/${FRONTEND_DOMAIN}.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/${API_DOMAIN}.conf /etc/nginx/sites-enabled/

print_status "Đã kích hoạt các site"

# ============================================================
# STEP 6: Test and reload Nginx
# ============================================================
echo -e "\n${YELLOW}Step 6: Kiểm tra và reload Nginx...${NC}"

nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    print_status "Nginx đã được reload thành công"
else
    print_error "Có lỗi trong cấu hình Nginx!"
    exit 1
fi

# ============================================================
# STEP 7: Setup SSL with Let's Encrypt
# ============================================================
echo -e "\n${YELLOW}Step 7: Thiết lập SSL với Let's Encrypt...${NC}"

read -p "Bạn có muốn cài đặt SSL ngay bây giờ? (y/n): " INSTALL_SSL

if [ "$INSTALL_SSL" = "y" ] || [ "$INSTALL_SSL" = "Y" ]; then
    echo -e "${BLUE}Đang cài đặt SSL cho ${FRONTEND_DOMAIN}...${NC}"
    certbot --nginx -d ${FRONTEND_DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect

    echo -e "${BLUE}Đang cài đặt SSL cho ${API_DOMAIN}...${NC}"
    certbot --nginx -d ${API_DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect

    print_status "Đã cài đặt SSL thành công!"

    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    print_status "Đã thiết lập tự động gia hạn SSL"
else
    print_warning "Bỏ qua cài đặt SSL. Bạn có thể chạy lại sau với lệnh:"
    echo "  certbot --nginx -d ${FRONTEND_DOMAIN} -d ${API_DOMAIN}"
fi

# ============================================================
# STEP 8: Setup project directory
# ============================================================
echo -e "\n${YELLOW}Step 8: Thiết lập thư mục project...${NC}"

if [ ! -d "${PROJECT_DIR}" ]; then
    mkdir -p ${PROJECT_DIR}
    print_status "Đã tạo thư mục ${PROJECT_DIR}"
else
    print_warning "Thư mục ${PROJECT_DIR} đã tồn tại"
fi

# ============================================================
# STEP 9: Create docker-compose override for production
# ============================================================
echo -e "\n${YELLOW}Step 9: Tạo file docker-compose.override.yml...${NC}"

cat > ${PROJECT_DIR}/docker-compose.override.yml << 'DOCKER_OVERRIDE'
# Production override settings
version: '3.8'

services:
  frontend:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.24hbilliardscoffee.com
    restart: always

  backend:
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - APP_URL=https://api.24hbilliardscoffee.com
      - SESSION_DOMAIN=.24hbilliardscoffee.com
      - SANCTUM_STATEFUL_DOMAINS=tinhtien.24hbilliardscoffee.com,api.24hbilliardscoffee.com
    restart: always

  mysql:
    restart: always

  nginx:
    # Disable Docker nginx, using host nginx instead
    profiles:
      - donotstart
DOCKER_OVERRIDE

print_status "Đã tạo file docker-compose.override.yml"

# ============================================================
# STEP 10: Create deployment script
# ============================================================
echo -e "\n${YELLOW}Step 10: Tạo script deploy.sh...${NC}"

cat > ${PROJECT_DIR}/deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

# ============================================================
# DEPLOY SCRIPT - Chạy mỗi khi cập nhật code
# ============================================================

set -e

echo "🚀 Bắt đầu deploy..."

cd /var/www/bida-24h

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build and restart containers
echo "🔄 Rebuilding containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
echo "🗃️ Running migrations..."
docker exec 24h_billiard_backend php artisan migrate --force

# Clear caches
echo "🧹 Clearing caches..."
docker exec 24h_billiard_backend php artisan config:cache
docker exec 24h_billiard_backend php artisan route:cache
docker exec 24h_billiard_backend php artisan view:cache

# Check status
echo "📊 Checking container status..."
docker-compose ps

echo "✅ Deploy hoàn tất!"
DEPLOY_SCRIPT

chmod +x ${PROJECT_DIR}/deploy.sh
print_status "Đã tạo script deploy.sh"

# ============================================================
# DONE
# ============================================================
echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}     SETUP HOÀN TẤT!                                        ${NC}"
echo -e "${GREEN}============================================================${NC}"

echo -e "\n${BLUE}📋 Thông tin:${NC}"
echo -e "   Frontend: https://${FRONTEND_DOMAIN}"
echo -e "   API:      https://${API_DOMAIN}"
echo -e "   Project:  ${PROJECT_DIR}"

echo -e "\n${BLUE}📌 Các bước tiếp theo:${NC}"
echo -e "   1. Clone source code vào ${PROJECT_DIR}:"
echo -e "      ${YELLOW}git clone <your-repo> ${PROJECT_DIR}${NC}"
echo -e ""
echo -e "   2. Tạo file .env cho frontend:"
echo -e "      ${YELLOW}cp ${PROJECT_DIR}/frontend/.env.production.example ${PROJECT_DIR}/frontend/.env.local${NC}"
echo -e ""
echo -e "   3. Tạo file .env cho backend:"
echo -e "      ${YELLOW}cp ${PROJECT_DIR}/backend/.env.example ${PROJECT_DIR}/backend/.env${NC}"
echo -e "      (Sau đó chỉnh sửa thông tin database, APP_KEY, etc.)"
echo -e ""
echo -e "   4. Chạy Docker containers:"
echo -e "      ${YELLOW}cd ${PROJECT_DIR} && docker-compose up -d${NC}"
echo -e ""
echo -e "   5. Chạy migrations:"
echo -e "      ${YELLOW}docker exec 24h_billiard_backend php artisan migrate${NC}"
echo -e ""
echo -e "   6. Deploy sau này chỉ cần chạy:"
echo -e "      ${YELLOW}${PROJECT_DIR}/deploy.sh${NC}"

echo -e "\n${GREEN}============================================================${NC}"
