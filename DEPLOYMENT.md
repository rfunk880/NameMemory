# NameMemory - SiteGround Deployment Guide

This guide will walk you through deploying the NameMemory app to SiteGround hosting.

## Prerequisites

- SiteGround hosting account with:
  - PHP 7.4+ support
  - MySQL database
  - FTP/SFTP access or File Manager
  - SSL certificate (usually included)
- Node.js installed on your local machine (for building the frontend)

## Step 1: Prepare the Backend

### 1.1 Create MySQL Database

1. Log into SiteGround cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `namememory_db`)
4. Create a new MySQL user with a strong password
5. Add the user to the database with ALL PRIVILEGES
6. **Note down** the database name, username, and password

### 1.2 Import Database Schema

1. Go to **phpMyAdmin** in cPanel
2. Select your database
3. Click **Import** tab
4. Upload and import `database/schema.sql`
5. Verify tables are created successfully

### 1.3 Configure Backend

1. Copy `backend/api/config/database.example.php` to `backend/api/config/database.php`
2. Edit `database.php` with your credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Generate a random JWT secret (use a password generator)
define('JWT_SECRET', 'your-random-secret-key-here');

// Update with your domain
define('APP_URL', 'https://your-domain.com');
define('API_URL', 'https://your-domain.com/api');

// Email configuration (use SiteGround SMTP)
define('SMTP_HOST', 'smtp.your-domain.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'noreply@your-domain.com');
define('SMTP_PASS', 'your-email-password');
define('SMTP_FROM', 'noreply@your-domain.com');
define('SMTP_FROM_NAME', 'NameMemory App');
```

## Step 2: Prepare the Frontend

### 2.1 Configure Environment

1. In the `frontend` directory, create `.env` file:

```bash
VITE_API_URL=https://your-domain.com/api
```

### 2.2 Build the Frontend

Run these commands on your local machine:

```bash
cd frontend
npm install
npm run build
```

This creates a `dist` folder with production-ready files.

## Step 3: Upload Files to SiteGround

### Option A: Using FTP/SFTP (Recommended)

1. Connect to your SiteGround server via FTP (use FileZilla or similar)
2. Navigate to `public_html` (or your domain's root directory)
3. Upload structure:

```
public_html/
├── api/                    (upload entire backend/api folder)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   ├── .htaccess
│   └── index.php
├── uploads/                (upload entire backend/uploads folder)
│   ├── photos/
│   └── thumbnails/
├── index.html              (from frontend/dist/)
├── assets/                 (from frontend/dist/assets/)
└── (other files from frontend/dist/)
```

### Option B: Using File Manager

1. Go to cPanel **File Manager**
2. Navigate to `public_html`
3. Upload files using the same structure as above
4. You may need to upload as ZIP and extract

## Step 4: Set Permissions

### 4.1 Set Folder Permissions

Using File Manager or FTP:

1. Set `uploads/photos/` to **755** (or **775** if needed)
2. Set `uploads/thumbnails/` to **755** (or **775** if needed)
3. Ensure PHP can write to these directories

### 4.2 Test Upload Permissions

Create a test PHP file to verify write permissions:

```php
<?php
$testFile = __DIR__ . '/uploads/photos/test.txt';
if (file_put_contents($testFile, 'test')) {
    echo "Write permission OK";
    unlink($testFile);
} else {
    echo "Write permission FAILED";
}
```

## Step 5: Configure .htaccess (if needed)

If the API `.htaccess` file doesn't work, ensure mod_rewrite is enabled and update:

```apache
# In public_html/api/.htaccess
RewriteEngine On
RewriteBase /api/

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# CORS headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

## Step 6: SSL/HTTPS Setup

1. Ensure SSL certificate is active in SiteGround (usually auto-enabled)
2. Force HTTPS by adding to `public_html/.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Step 7: Testing

### 7.1 Test Backend API

Visit: `https://your-domain.com/api/`

You should see: `{"error":"Endpoint not found"}`

This confirms the API is working.

### 7.2 Test Frontend

Visit: `https://your-domain.com/`

You should see the NameMemory login page.

### 7.3 Create Test Account

1. Click "Register"
2. Create a test account
3. Verify you can:
   - Create a group
   - Add people with photos
   - Access Learning Mode
   - Access Quick Reference

## Troubleshooting

### Issue: "Database connection failed"

- Verify database credentials in `api/config/database.php`
- Ensure database user has proper privileges
- Check database name matches exactly

### Issue: "Failed to upload image"

- Check folder permissions (755 or 775)
- Verify PHP has write access to `uploads/` folders
- Check PHP upload limits in cPanel (increase if needed)

### Issue: "CORS errors"

- Ensure `.htaccess` CORS headers are set
- Verify API_URL in frontend `.env` matches your domain
- Clear browser cache

### Issue: "404 errors on API routes"

- Ensure `.htaccess` exists in `api/` folder
- Verify mod_rewrite is enabled
- Check RewriteBase matches your directory structure

### Issue: "Token expired" errors

- Verify JWT_SECRET is set in `database.php`
- Check server time is correct
- Clear browser localStorage and login again

## Performance Optimization

1. **Enable Gzip Compression** (usually auto-enabled on SiteGround)
2. **Enable Browser Caching** - Add to `.htaccess`:

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

3. **Enable SiteGround SuperCacher** (in cPanel)

## Updating the App

### Update Backend:

1. Upload new PHP files via FTP
2. No restart needed (PHP is stateless)

### Update Frontend:

1. Run `npm run build` locally
2. Upload new `dist/` files to `public_html/`
3. Clear browser cache

## Security Recommendations

1. **Change default JWT_SECRET** to a long random string
2. **Use strong database passwords**
3. **Keep PHP updated** (via SiteGround cPanel)
4. **Regularly backup database** (SiteGround auto-backup available)
5. **Monitor upload folder** for suspicious files
6. **Limit file upload size** to prevent abuse

## Backup Strategy

1. **Database**: Use phpMyAdmin Export or SiteGround's auto-backup
2. **Files**: Download `uploads/` folder regularly via FTP
3. **Code**: Keep a copy in version control (Git)

## Support

If you encounter issues:
1. Check SiteGround's error logs in cPanel
2. Enable PHP error reporting temporarily for debugging
3. Contact SiteGround support for server-specific issues

## Production Checklist

- [ ] Database configured and schema imported
- [ ] Backend config file updated with correct credentials
- [ ] Frontend built with production API URL
- [ ] All files uploaded to correct directories
- [ ] Upload folders have correct permissions
- [ ] SSL/HTTPS working
- [ ] Test account created successfully
- [ ] Image upload working
- [ ] Email notifications working (password reset)
- [ ] All features tested on mobile
- [ ] Error reporting disabled in production
- [ ] Backup strategy in place

---

**Your NameMemory app is now live! 🎉**

Access it at: `https://your-domain.com`
