<?php
/**
 * Database Configuration Template
 * Copy this file to database.php and update with your SiteGround credentials
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'dbwor04cxcwgbg');
define('DB_USER', 'uidbfd2lnuuau');
define('DB_PASS', 'zyqdf9v3muxt');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key - Generate a random string for production
define('JWT_SECRET', 'xL&VfH%8ZJZ0pMVy');
define('JWT_EXPIRY', 86400 * 7); // 7 days in seconds

// Email Configuration
define('SMTP_HOST', 'c1111634.sgvps.net');
define('SMTP_PORT', 465);
define('SMTP_USER', 'app@e-salesllc.com');
define('SMTP_PASS', '^gig3m@;yoS3');
define('SMTP_FROM', 'app@e-salesllc.com');
define('SMTP_FROM_NAME', 'NameMemory App');

// Application URL
define('APP_URL', 'https://remember.e-salesllc.com');
define('API_URL', 'https://remember.e-salesllc.com/api');

// Upload settings
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
define('PHOTO_MAX_WIDTH', 800);
define('PHOTO_QUALITY', 75);
define('THUMBNAIL_SIZE', 150);
