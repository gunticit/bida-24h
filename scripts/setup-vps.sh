#!/bin/bash

# Update system
apt-get update && apt-get upgrade -y

# Install common tools
apt-get install -y git curl unzip zip nginx

# Install PHP 8.2 and extensions
apt-get install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt-get update
apt-get install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install MySQL Server (Optional - if you use local DB)
apt-get install -y mysql-server
# Secure MySQL installation is interactive, so you might need to run `mysql_secure_installation` manually.

# Create project directory
mkdir -p /var/www/bida-24h
chown -R $USER:$USER /var/www/bida-24h

# Configure Nginx (Basic template)
cat > /etc/nginx/sites-available/bida-24h <<EOF
server {
    listen 80;
    server_name _; # Replace with your domain

    # Backend (Laravel)
    location /api {
        alias /var/www/bida-24h/backend/public;
        try_files \$uri \$uri/ @laravel;
        
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
        }
    }

    location @laravel {
        rewrite /api/(.*)$ /api/index.php?\$1 last;
    }

    # Frontend (Next.js via PM2)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/bida-24h /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "Server setup complete! Don't forget to configure .env in backend and frontend."
