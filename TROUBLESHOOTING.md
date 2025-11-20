# Troubleshooting Guide

## "Failed to create group" Error

If you see "Failed to create group" when trying to create a group, follow these steps:

### 1. Check if it's a Local vs Production Issue

**The database is configured for SiteGround production**, not local development.

#### Testing Locally?
- You'll see: `No such file or directory` database error
- **Solution:** Either test on production OR set up local MySQL database

#### Testing on Production?
- Follow the steps below to diagnose

---

### 2. Verify Database Connection on SiteGround

1. **Login to SiteGround cPanel**
2. **Go to MySQL Databases**
3. **Verify these details match your `database.php`:**
   ```
   Database Name: dbwor04cxcwgbg
   Database User: uidbfd2lnuuau
   Database Host: localhost
   ```

---

### 3. Check Database Tables Exist

Run this test script on SiteGround:

**Upload `backend/api/test-db.php` to `public_html/api/test-db.php`**

Then visit: `https://remember.e-salesllc.com/api/test-db.php`

You should see:
```
✓ Connection successful!
✓ Table 'users' exists
✓ Table 'groups' exists
✓ Table 'people' exists
✓ Table 'group_shares' exists
✓ Table 'password_resets' exists
```

If tables are missing, import the schema:
```sql
Import: database/schema.sql via phpMyAdmin
```

---

### 4. Check Error Logs

**On SiteGround:**
1. Go to Site Tools → Statistics → Error Log
2. Look for PHP errors related to database connection
3. The improved error handling now logs detailed error messages

**In Browser Console:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Try creating a group
4. Look for error messages with details

---

### 5. Common Issues & Solutions

#### Issue: "Database connection failed"
**Cause:** Database credentials are wrong or database doesn't exist
**Solution:**
- Verify credentials in SiteGround cPanel
- Update `backend/api/config/database.php` with correct values

#### Issue: "Table 'groups' doesn't exist"
**Cause:** Database schema not imported
**Solution:**
- Go to phpMyAdmin in SiteGround
- Select your database
- Import `database/schema.sql`

#### Issue: "Access denied for user"
**Cause:** Database user doesn't have permissions
**Solution:**
- In SiteGround cPanel → MySQL Databases
- Make sure user has ALL PRIVILEGES on the database

#### Issue: "No such file or directory" (Local only)
**Cause:** MySQL not running locally OR wrong host
**Solution:**
- Change `DB_HOST` from `localhost` to `127.0.0.1` in database.php
- OR install and start MySQL (XAMPP/MAMP)
- OR test on production instead

---

### 6. Frontend Error Messages

The frontend now shows detailed error messages. When you try to create a group:

**Old error:** "Failed to create group"
**New error:** "Failed to create group: Database connection failed" (shows actual cause)

Check the browser console for even more details.

---

### 7. Test Database Connection Script

Use the test script to diagnose issues:

```bash
# Local testing (requires local PHP):
cd backend/api
php test-db.php

# Production testing:
# Upload test-db.php to public_html/api/
# Visit: https://remember.e-salesllc.com/api/test-db.php
```

---

## Local Development Setup (Optional)

If you want to test locally without deploying each time:

### 1. Install MySQL Locally
- **Windows:** Install XAMPP or WAMP
- **Mac:** Install MAMP
- **Linux:** `sudo apt-get install mysql-server`

### 2. Create Local Database
```sql
CREATE DATABASE namememory_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Import Schema
```bash
mysql -u root -p namememory_local < database/schema.sql
```

### 4. Create Local Config
```bash
cd backend/api/config
cp database.local.example.php database.php
# Edit database.php with your local MySQL credentials
```

### 5. Update Frontend .env
```bash
cd frontend
# Edit .env
VITE_API_URL=http://localhost:8000
```

### 6. Start Local Servers
```bash
# Terminal 1 - Backend:
cd backend/api
php -S localhost:8000

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

Now visit `http://localhost:5173` to test locally!

---

## Production Deployment Checklist

When deploying to SiteGround:

- [ ] Database exists and tables are imported
- [ ] `backend/api/config/database.php` uploaded with production credentials
- [ ] `backend/api/` folder uploaded to `public_html/api/`
- [ ] `frontend/dist/*` uploaded to `public_html/`
- [ ] `frontend/.htaccess` uploaded to `public_html/.htaccess`
- [ ] Upload directories have correct permissions (755)
- [ ] Test: `https://remember.e-salesllc.com/api/` returns `{"error":"Endpoint not found"}`
- [ ] Test: `https://remember.e-salesllc.com` loads the login page
- [ ] Register a test user
- [ ] Try creating a group
- [ ] Check error logs if issues persist

---

## Getting Help

If you're still having issues:

1. **Check SiteGround Error Logs** (Site Tools → Statistics → Error Log)
2. **Check Browser Console** (F12 → Console tab)
3. **Run test-db.php** on production
4. **Verify all files uploaded** correctly
5. **Check database permissions** in cPanel

The improved error handling now provides detailed error messages to help diagnose issues faster!
