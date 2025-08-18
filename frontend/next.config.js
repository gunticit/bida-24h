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
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Cấu hình host và port
  hostname: '0.0.0.0',
  port: process.env.PORT || 3000,
};

module.exports = nextConfig;
