#Nginx VPS
server {
    server_name thanhtoan.24hbilliardscoffee.com;

    client_max_body_size 100M;

    access_log /var/log/nginx/thanhtoan.24hbilliardscoffee.com.access.log;
    error_log /var/log/nginx/thanhtoan.24hbilliardscoffee.com.error.log;

    # Next.js frontend
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Laravel backend
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Ẩn file nhạy cảm
    location ~ /\.ht {
        deny all;
    }

        
    # Public storage cho Laravel - FIXED PATH
    location /storage {
        alias /var/www/html/bida-24h/backend/storage/app/public;
        access_log off;
        log_not_found off;
        expires 1y;
        add_header Cache-Control "public, immutable";

        # Handle CORS for file downloads
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Range";

        # Ensure proper MIME types for Excel files
        location ~* \.xlsx$ {
            add_header Content-Type "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
    }


}

# Redirect HTTP -> HTTPS (Certbot sẽ quản lý sau này)
server {
    if ($host = thanhtoan.24hbilliardscoffee.com) {
        return 301 https://$host$request_uri;
    }
}
server {
    if ($host = thanhtoan.24hbilliardscoffee.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name thanhtoan.24hbilliardscoffee.com;
    return 404; # managed by Certbot


}
