# Railway Deployment Guide

Deploy NameMemory to Railway at `name-memory.up.railway.app`.

## Architecture

Single container serving:
- **Frontend**: React SPA at `/`
- **Backend API**: PHP at `/api/*`
- **Uploads**: Persistent files at `/uploads/*` (Railway Volume)

## Quick Deploy

### 1. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select this repository

### 2. Add PostgreSQL Database

1. In your project, click **New** → **Database** → **PostgreSQL**
2. Railway auto-provisions and injects connection variables

### 3. Initialize Database

1. Click the PostgreSQL service → **Data** tab
2. Run the SQL from `database/schema.sql`

### 4. Add Volume for Uploads

1. Click your app service → **Settings** → **Volumes**
2. Click **Add Volume**
3. Mount path: `/uploads`
4. This persists uploaded photos across deployments

### 5. Configure Environment Variables

In your service's **Variables** tab, add:

```bash
# Database - auto-injected by Railway PostgreSQL plugin
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Required - generate a secure random string
JWT_SECRET=your-secure-random-string-minimum-32-chars

# Upload directory (matches volume mount)
UPLOAD_DIR=/uploads/

# Optional - for password reset emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
SMTP_FROM_NAME=NameMemory
```

### 6. Deploy

Railway auto-deploys on push. Your app will be available at:
- `https://name-memory.up.railway.app`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection URL (auto-injected) |
| `JWT_SECRET` | Yes | JWT signing key (32+ chars) |
| `UPLOAD_DIR` | Yes | Upload path (`/uploads/`) |
| `SMTP_HOST` | No | Email server |
| `SMTP_PORT` | No | Email port (587) |
| `SMTP_USER` | No | Email username |
| `SMTP_PASS` | No | Email password |
| `SMTP_FROM` | No | From address |
| `SMTP_FROM_NAME` | No | From name |

## Local Development

```bash
# Start all services (PostgreSQL + App)
docker-compose up -d

# App available at http://localhost:3000
# API at http://localhost:3000/api

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Reset database
docker-compose down -v
```

## Troubleshooting

### Database Connection Failed
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set correctly
- Test with `/api/health` endpoint

### 502 Bad Gateway
- Check Railway deploy logs
- Verify PHP-FPM is starting correctly
- Ensure database schema is initialized

### File Uploads Not Working
- Verify Volume is mounted at `/uploads`
- Check `UPLOAD_DIR=/uploads/` is set
- Ensure Volume has sufficient space

## File Storage

Railway Volume provides persistent storage:
- Photos survive deployments
- Mounted at `/uploads`
- Accessible via `/uploads/*` URLs
