<?php
/**
 * Database Configuration
 * Reads from environment variables for Railway/Docker deployment
 * Falls back to defaults for local development
 */

// Database configuration - Railway PostgreSQL plugin provides PGHOST, PGPORT, etc.
// Also check for DATABASE_URL which Railway can provide
$databaseUrl = getenv('DATABASE_URL');
if ($databaseUrl) {
    $dbParts = parse_url($databaseUrl);
    define('DB_HOST', $dbParts['host'] ?? 'localhost');
    define('DB_PORT', $dbParts['port'] ?? '5432');
    define('DB_NAME', ltrim($dbParts['path'] ?? '/namememory', '/'));
    define('DB_USER', $dbParts['user'] ?? 'postgres');
    define('DB_PASS', $dbParts['pass'] ?? '');
} else {
    define('DB_HOST', getenv('PGHOST') ?: getenv('DB_HOST') ?: 'localhost');
    define('DB_PORT', getenv('PGPORT') ?: getenv('DB_PORT') ?: '5432');
    define('DB_NAME', getenv('PGDATABASE') ?: getenv('DB_NAME') ?: 'namememory');
    define('DB_USER', getenv('PGUSER') ?: getenv('DB_USER') ?: 'postgres');
    define('DB_PASS', getenv('PGPASSWORD') ?: getenv('DB_PASS') ?: '');
}

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

// Upload settings - Railway Volume mounted at /uploads
define('UPLOAD_MAX_SIZE', (int)(getenv('UPLOAD_MAX_SIZE') ?: 10 * 1024 * 1024)); // 10MB
define('UPLOAD_DIR', getenv('UPLOAD_DIR') ?: '/uploads/');
define('PHOTO_MAX_WIDTH', (int)(getenv('PHOTO_MAX_WIDTH') ?: 800));
define('PHOTO_QUALITY', (int)(getenv('PHOTO_QUALITY') ?: 75));
define('THUMBNAIL_SIZE', (int)(getenv('THUMBNAIL_SIZE') ?: 150));
