# Railway Deployment Guide

Deploy NameMemory to Railway at `name-memory.up.railway.app`.

## Architecture

Single container serving:
- **Frontend**: React SPA at `/`
- **Backend API**: PHP at `/api/*`
- **Uploads**: Static files at `/uploads/*`

## Quick Deploy

### 1. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select this repository

### 2. Add MySQL Database

1. In your project, click **New** → **Database** → **MySQL**
2. Railway auto-provisions and injects connection variables

### 3. Initialize Database

1. Click the MySQL service → **Data** tab
2. Run the SQL from `database/schema.sql`

### 4. Configure Environment Variables

In your service's **Variables** tab, add:

```bash
# Required - auto-injected by Railway MySQL plugin
MYSQL_HOST=${{MySQL.MYSQLHOST}}
MYSQL_PORT=${{MySQL.MYSQLPORT}}
MYSQL_DATABASE=${{MySQL.MYSQLDATABASE}}
MYSQL_USER=${{MySQL.MYSQLUSER}}
MYSQL_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# Required - generate a secure random string
JWT_SECRET=your-secure-random-string-minimum-32-chars

# Optional - for password reset emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
SMTP_FROM_NAME=NameMemory
```

### 5. Deploy

Railway auto-deploys on push. Your app will be available at:
- `https://name-memory.up.railway.app`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MYSQL_HOST` | Yes | Database host |
| `MYSQL_PORT` | Yes | Database port |
| `MYSQL_DATABASE` | Yes | Database name |
| `MYSQL_USER` | Yes | Database user |
| `MYSQL_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | JWT signing key (32+ chars) |
| `SMTP_HOST` | No | Email server |
| `SMTP_PORT` | No | Email port (587) |
| `SMTP_USER` | No | Email username |
| `SMTP_PASS` | No | Email password |
| `SMTP_FROM` | No | From address |
| `SMTP_FROM_NAME` | No | From name |

## Local Development

```bash
# Start all services
docker-compose up -d

# App available at http://localhost:3000
# API at http://localhost:3000/api

# Stop
docker-compose down
```

## Troubleshooting

### Database Connection Failed
- Verify MySQL service is running
- Check variable references use `${{MySQL.VARNAME}}` syntax
- Test with `/api/health` endpoint

### 502 Bad Gateway
- Check Railway deploy logs
- Verify PHP-FPM is starting correctly
- Ensure database schema is initialized

### File Uploads Not Working
- Railway filesystem is ephemeral
- For production, integrate external storage (S3, Cloudinary)

## File Storage Note

Railway's filesystem resets on each deploy. For persistent file uploads, consider:
- AWS S3
- Cloudinary
- Railway Volumes (if available)
