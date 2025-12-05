<?php
/**
 * Database Configuration
 * Reads from environment variables for Railway/Docker deployment
 * Falls back to defaults for local development
 */

// Database configuration - Railway provides these via MySQL plugin or custom vars
define('DB_HOST', getenv('MYSQL_HOST') ?: getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('MYSQL_DATABASE') ?: getenv('DB_NAME') ?: 'namememory');
define('DB_USER', getenv('MYSQL_USER') ?: getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('MYSQL_PASSWORD') ?: getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('MYSQL_PORT') ?: getenv('DB_PORT') ?: '3306');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key - MUST be set in production environment
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'change-this-in-production');
define('JWT_EXPIRY', (int)(getenv('JWT_EXPIRY') ?: 86400 * 7)); // 7 days in seconds

// Email Configuration (optional - for password reset)
define('SMTP_HOST', getenv('SMTP_HOST') ?: '');
define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 587));
define('SMTP_USER', getenv('SMTP_USER') ?: '');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');
define('SMTP_FROM', getenv('SMTP_FROM') ?: '');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'NameMemory App');

// Application URLs - Railway provides RAILWAY_PUBLIC_DOMAIN
$railwayDomain = getenv('RAILWAY_PUBLIC_DOMAIN');
$defaultUrl = $railwayDomain ? "https://{$railwayDomain}" : 'http://localhost:3000';
$defaultApiUrl = $railwayDomain ? "https://{$railwayDomain}/api" : 'http://localhost:8080/api';

define('APP_URL', getenv('APP_URL') ?: $defaultUrl);
define('API_URL', getenv('API_URL') ?: $defaultApiUrl);

// Upload settings
define('UPLOAD_MAX_SIZE', (int)(getenv('UPLOAD_MAX_SIZE') ?: 10 * 1024 * 1024)); // 10MB
define('UPLOAD_DIR', getenv('UPLOAD_DIR') ?: __DIR__ . '/../../uploads/');
define('PHOTO_MAX_WIDTH', (int)(getenv('PHOTO_MAX_WIDTH') ?: 800));
define('PHOTO_QUALITY', (int)(getenv('PHOTO_QUALITY') ?: 75));
define('THUMBNAIL_SIZE', (int)(getenv('THUMBNAIL_SIZE') ?: 150));
