/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  // Tắt strict mode trong development để tránh double rendering
  reactStrictMode: false,
  // Cấu hình cho production
  output: 'standalone',
};

module.exports = nextConfig;
