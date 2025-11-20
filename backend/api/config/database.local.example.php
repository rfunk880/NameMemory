<?php
/**
 * Local Development Database Configuration
 * Copy this to database.php for local testing
 */

// Local database credentials (adjust for your setup)
define('DB_HOST', '127.0.0.1');  // Try 127.0.0.1 instead of localhost
define('DB_NAME', 'namememory_local');
define('DB_USER', 'root');
define('DB_PASS', '');  // Usually empty for local XAMPP/MAMP
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key
define('JWT_SECRET', 'local-dev-secret-key-change-me');
define('JWT_EXPIRY', 86400 * 7); // 7 days in seconds

// Email Configuration (use mailtrap.io or similar for local testing)
define('SMTP_HOST', 'sandbox.smtp.mailtrap.io');
define('SMTP_PORT', 2525);
define('SMTP_USER', 'your-mailtrap-user');
define('SMTP_PASS', 'your-mailtrap-pass');
define('SMTP_FROM', 'dev@namememory.local');
define('SMTP_FROM_NAME', 'NameMemory Local');

// Application URLs (local)
define('APP_URL', 'http://localhost:5173');
define('API_URL', 'http://localhost:8000');

// Upload settings
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
define('PHOTO_MAX_WIDTH', 800);
define('PHOTO_QUALITY', 75);
define('THUMBNAIL_SIZE', 150);
