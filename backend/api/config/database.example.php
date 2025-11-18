<?php
/**
 * Database Configuration Template
 * Copy this file to database.php and update with your SiteGround credentials
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key - Generate a random string for production
define('JWT_SECRET', 'your-secret-key-change-this-in-production');
define('JWT_EXPIRY', 86400 * 7); // 7 days in seconds

// Email Configuration
define('SMTP_HOST', 'smtp.your-domain.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'noreply@your-domain.com');
define('SMTP_PASS', 'your-email-password');
define('SMTP_FROM', 'noreply@your-domain.com');
define('SMTP_FROM_NAME', 'NameMemory App');

// Application URL
define('APP_URL', 'https://your-domain.com');
define('API_URL', 'https://your-domain.com/api');

// Upload settings
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
define('PHOTO_MAX_WIDTH', 800);
define('PHOTO_QUALITY', 75);
define('THUMBNAIL_SIZE', 150);
