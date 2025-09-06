-- Tạo database
CREATE DATABASE IF NOT EXISTS `24h_billiard`;

-- Tạo user và cấp quyền
CREATE USER IF NOT EXISTS 'backend_usr'@'%' IDENTIFIED BY 'Lrv@2025';
GRANT ALL PRIVILEGES ON `24h_billiard`.* TO 'backend_usr'@'%';

-- Cập nhật quyền
FLUSH PRIVILEGES;
