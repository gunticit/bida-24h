# Sử dụng PHP 8.2 với CLI
FROM php:8.2-cli

# Cài đặt các extension cần thiết cho Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập working directory
WORKDIR /var/www/backend

# Copy source code trước
COPY . .

# Cài đặt dependencies (bỏ qua scripts để tránh lỗi)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Thiết lập quyền
RUN chown -R www-data:www-data /var/www/backend \
    && chmod -R 755 /var/www/backend/storage \
    && chmod -R 755 /var/www/backend/bootstrap/cache

# Expose port
EXPOSE 8000

# Start Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
