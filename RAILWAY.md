# Railway Deployment Guide

This guide explains how to deploy NameMemory on Railway.

## Prerequisites

- A Railway account (https://railway.app)
- This repository connected to Railway

## Architecture

The application consists of three services on Railway:

1. **MySQL Database** - Railway's MySQL plugin
2. **Backend** - PHP API server (from `/backend`)
3. **Frontend** - React SPA served via nginx (from `/frontend`)

## Deployment Steps

### 1. Create a New Project

1. Go to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub repository

### 2. Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" → "MySQL"
3. Railway will automatically provision a MySQL instance
4. Note the connection variables (they'll be auto-injected into services)

### 3. Initialize the Database

After MySQL is provisioned:

1. Click on the MySQL service
2. Go to the "Data" tab
3. Open the SQL query interface
4. Copy and paste the contents of `database/schema.sql`
5. Execute to create the required tables

### 4. Deploy Backend Service

1. Click "New" → "GitHub Repo"
2. Select the same repository
3. Configure the service:
   - **Root Directory**: `backend`
   - **Service Name**: `backend` (or your preference)
4. Add environment variables (Settings → Variables):

```
# These are auto-provided if MySQL plugin is in the same project
MYSQL_HOST=${{MySQL.MYSQL_HOST}}
MYSQL_PORT=${{MySQL.MYSQL_PORT}}
MYSQL_DATABASE=${{MySQL.MYSQL_DATABASE}}
MYSQL_USER=${{MySQL.MYSQL_USER}}
MYSQL_PASSWORD=${{MySQL.MYSQL_PASSWORD}}

# Required - generate a secure random string
JWT_SECRET=your-secure-random-string-here

# Optional - for email functionality
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=NameMemory
```

5. Deploy and note the generated domain (e.g., `backend-xxx.railway.app`)

### 5. Deploy Frontend Service

1. Click "New" → "GitHub Repo"
2. Select the same repository
3. Configure the service:
   - **Root Directory**: `frontend`
   - **Service Name**: `frontend` (or your preference)
4. Add build arguments (Settings → Variables):

```
VITE_API_URL=https://your-backend-domain.railway.app/api
```

5. Deploy

### 6. Configure Custom Domains (Optional)

1. Go to each service's Settings
2. Under "Networking" → "Public Networking"
3. Generate a Railway domain or add your custom domain
4. Update `VITE_API_URL` if you changed the backend domain

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MYSQL_HOST` | Yes | MySQL hostname |
| `MYSQL_PORT` | Yes | MySQL port (default: 3306) |
| `MYSQL_DATABASE` | Yes | Database name |
| `MYSQL_USER` | Yes | Database username |
| `MYSQL_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `JWT_EXPIRY` | No | Token expiry in seconds (default: 604800) |
| `SMTP_HOST` | No | SMTP server for emails |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From email address |
| `SMTP_FROM_NAME` | No | From display name |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Full URL to backend API |

## Local Development with Docker

You can test the Railway setup locally using Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

Local URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- MySQL: localhost:3306

## Troubleshooting

### Database Connection Issues

1. Verify MySQL service is running in Railway
2. Check that environment variables are correctly set
3. Test with the `/api/health` endpoint

### CORS Errors

The backend allows all origins by default. If you need to restrict:
1. Update `backend/api/index.php` CORS headers
2. Set `Access-Control-Allow-Origin` to your frontend domain

### Build Failures

1. Check Railway build logs
2. Verify Dockerfile syntax
3. Ensure all required files are not in `.dockerignore`

### Image Upload Issues

1. Verify `uploads` directory permissions
2. Check PHP `upload_max_filesize` setting
3. Railway's file storage is ephemeral - consider using external storage for production

## Production Considerations

1. **File Storage**: Railway's filesystem is ephemeral. For persistent file uploads, integrate with:
   - AWS S3
   - Cloudinary
   - Railway Volumes (if available)

2. **SSL**: Railway provides automatic SSL for all services

3. **Scaling**: Configure autoscaling in Railway's service settings

4. **Monitoring**: Use Railway's built-in metrics and logging

5. **Backups**: Set up automated MySQL backups via Railway or external tools
