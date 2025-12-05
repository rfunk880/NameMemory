<?php
/**
 * Database Configuration Template
 *
 * The actual database.php reads from environment variables.
 * This file documents the available configuration options.
 *
 * For Railway deployment: Set these as environment variables in your Railway service.
 * For local development: Either set environment variables or modify database.php directly.
 * For Docker: Set in docker-compose.yml environment section.
 */

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================
// Railway MySQL plugin provides: MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD
// Alternative names: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS

/*
 * Environment Variables:
 *
 * MYSQL_HOST or DB_HOST       - Database server hostname (default: localhost)
 * MYSQL_PORT or DB_PORT       - Database port (default: 3306)
 * MYSQL_DATABASE or DB_NAME   - Database name (default: namememory)
 * MYSQL_USER or DB_USER       - Database username (default: root)
 * MYSQL_PASSWORD or DB_PASS   - Database password (default: empty)
 */

// =============================================================================
// JWT AUTHENTICATION
// =============================================================================
/*
 * JWT_SECRET  - Secret key for signing JWT tokens
 *               IMPORTANT: Change this in production!
 *               Generate a secure random string (32+ characters)
 *
 * JWT_EXPIRY  - Token expiration time in seconds (default: 604800 = 7 days)
 */

// =============================================================================
// EMAIL CONFIGURATION (Optional - for password reset)
// =============================================================================
/*
 * SMTP_HOST      - SMTP server hostname
 * SMTP_PORT      - SMTP port (default: 587 for TLS, 465 for SSL)
 * SMTP_USER      - SMTP username/email
 * SMTP_PASS      - SMTP password
 * SMTP_FROM      - Sender email address
 * SMTP_FROM_NAME - Sender display name (default: "NameMemory App")
 */

// =============================================================================
// APPLICATION URLs
// =============================================================================
/*
 * APP_URL  - Frontend application URL (e.g., https://app.example.com)
 * API_URL  - Backend API URL (e.g., https://api.example.com/api)
 *
 * Note: On Railway, RAILWAY_PUBLIC_DOMAIN is automatically set
 */

// =============================================================================
// FILE UPLOAD SETTINGS
// =============================================================================
/*
 * UPLOAD_MAX_SIZE   - Maximum upload size in bytes (default: 10MB)
 * UPLOAD_DIR        - Directory for uploads (default: ../uploads/)
 * PHOTO_MAX_WIDTH   - Maximum photo width in pixels (default: 800)
 * PHOTO_QUALITY     - JPEG quality percentage (default: 75)
 * THUMBNAIL_SIZE    - Thumbnail dimensions in pixels (default: 150)
 */

// =============================================================================
// EXAMPLE: Local Development Values
// =============================================================================
// If you want to hardcode values for local development, uncomment and modify:
/*
putenv('DB_HOST=localhost');
putenv('DB_PORT=3306');
putenv('DB_NAME=namememory');
putenv('DB_USER=root');
putenv('DB_PASS=');
putenv('JWT_SECRET=local-dev-secret-change-in-production');
*/
