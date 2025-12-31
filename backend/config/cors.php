<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.2.2:3000',
        'http://24hbilliardscoffee.com',
        'https://24hbilliardscoffee.com',
        'http://api.24hbilliardscoffee.com',
        'https://api.24hbilliardscoffee.com',
        'http://thanhtoan.24hbilliardscoffee.com',
        'https://thanhtoan.24hbilliardscoffee.com',
        // Docker internal domains
        'http://frontend:3000',
        'http://24h_billiard_frontend:3000',
        'http://localhost:81',
        'http://127.0.0.1:81',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
