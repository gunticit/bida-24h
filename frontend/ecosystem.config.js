module.exports = {
  apps: [
    {
      name: 'bida-24h-frontend',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://24hbilliardscoffee.com/api',
        NEXT_PUBLIC_APP_NAME: 'Phần mềm quản lý 24h Billiard App',
        NEXT_PUBLIC_APP_DESCRIPTION: 'Fullstack application with Laravel backend and Next.js frontend'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://24hbilliardscoffee.com/api',
        NEXT_PUBLIC_APP_NAME: 'Phần mềm quản lý 24h Billiard App',
        NEXT_PUBLIC_APP_DESCRIPTION: 'Fullstack application with Laravel backend and Next.js frontend'
      }
    }
  ]
};
