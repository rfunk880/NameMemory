# Combined Dockerfile for Railway
# Single container serving React frontend + PHP API

# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# Build with API URL pointing to same domain
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Production image with nginx + PHP-FPM
FROM php:8.2-fpm-alpine

# Install nginx and required PHP extensions (PostgreSQL)
RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    postgresql-dev \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_pgsql zip

# Configure PHP
RUN echo "upload_max_filesize = 20M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 25M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 128M" >> /usr/local/etc/php/conf.d/uploads.ini

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy PHP backend
COPY backend/api/ /var/www/html/api/

# Create upload directories (Railway Volume will be mounted at /uploads)
RUN mkdir -p /uploads/photos /uploads/thumbnails \
    && chown -R www-data:www-data /uploads \
    && chmod -R 775 /uploads

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist /var/www/html/public

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Create nginx cache and pid directories
RUN mkdir -p /var/cache/nginx /var/run/nginx /var/log/nginx /var/log/supervisor \
    && chown -R www-data:www-data /var/cache/nginx /var/run/nginx /var/log/nginx

# Expose port (Railway uses PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start supervisor (manages nginx + php-fpm)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
