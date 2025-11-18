# NameMemory - Quick Start Guide

Get NameMemory running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PHP 7.4+ installed
- MySQL installed

## Quick Setup

### 1. Clone or Download

```bash
cd NameMemory
```

### 2. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE namememory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Import schema
mysql -u root -p namememory < database/schema.sql
```

### 3. Configure Backend

```bash
# Copy config template
cp backend/api/config/database.example.php backend/api/config/database.php

# Edit with your details (use nano, vim, or any text editor)
nano backend/api/config/database.php
```

Update these values:
- `DB_NAME` → `namememory`
- `DB_USER` → your MySQL username (usually `root`)
- `DB_PASS` → your MySQL password
- `JWT_SECRET` → any random string (e.g., `my-secret-key-123`)

### 4. Set Permissions

```bash
chmod 755 backend/uploads/photos
chmod 755 backend/uploads/thumbnails
```

### 5. Start Backend

```bash
cd backend/api
php -S localhost:8000
```

Leave this terminal running.

### 6. Setup Frontend (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (set VITE_API_URL=http://localhost:8000)
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

### 7. Open App

Visit: **http://localhost:5173**

### 8. Create Account

1. Click "Register"
2. Fill in your details
3. Start creating groups!

## Common Issues

**"Database connection failed"**
- Check MySQL is running
- Verify credentials in `database.php`

**"Permission denied" for uploads**
- Run: `chmod -R 755 backend/uploads`

**"CORS errors"**
- Ensure API is running on port 8000
- Check `.env` has correct `VITE_API_URL`

## Next Steps

- See [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Start adding people and practicing names!

---

**Need help?** Check the troubleshooting section in DEPLOYMENT.md
