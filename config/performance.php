<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Performance Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains performance-related configuration options for the
    | application to optimize loading times and resource usage.
    |
    */

    'cache' => [
        'routes' => env('CACHE_ROUTES', true),
        'views' => env('CACHE_VIEWS', true),
        'config' => env('CACHE_CONFIG', true),
    ],

    'assets' => [
        'preload_critical' => env('PRELOAD_CRITICAL_ASSETS', true),
        'lazy_load_images' => env('LAZY_LOAD_IMAGES', true),
        'compress_assets' => env('COMPRESS_ASSETS', true),
    ],

    'database' => [
        'query_cache' => env('DB_QUERY_CACHE', true),
        'connection_pooling' => env('DB_CONNECTION_POOLING', false),
    ],

    'session' => [
        'lifetime' => env('SESSION_LIFETIME', 120),
        'secure' => env('SESSION_SECURE', false),
        'http_only' => env('SESSION_HTTP_ONLY', true),
    ],
];
