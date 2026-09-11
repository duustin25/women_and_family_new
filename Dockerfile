# ==============================================================================
# Multi-Stage Production Dockerfile for Barangay 183 WFP System (Coolify Ready)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Assets & Composer Dependencies
# ------------------------------------------------------------------------------
FROM php:8.4-cli-alpine AS builder

# Install system dependencies & Node.js for Vite compilation
RUN apk add --no-cache \
    nodejs \
    npm \
    git \
    unzip \
    zip \
    curl

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /app

# Install PHP dependencies first (cached layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Install Node dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Run composer autoload dump & package discovery
RUN composer dump-autoload --optimize --no-dev

# Build production assets (Vite + React + Wayfinder)
ARG VITE_APP_NAME="Barangay 183 WFP System"
ARG VITE_APP_BARANGAY_NAME="Barangay 183"
ARG VITE_APP_CITY_NAME="Pasay City"
ARG VITE_APP_ZONE="Zone 20"
ARG VITE_HOTLINE_BRGY="(02) 8854-1234"
ARG VITE_HOTLINE_VAWC="911 / 1343"
ARG VITE_OFFICIAL_EMAIL="support@pasay.gov.ph"
ARG VITE_OFFICIAL_FB="https://facebook.com"

ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_BARANGAY_NAME=$VITE_APP_BARANGAY_NAME \
    VITE_APP_CITY_NAME=$VITE_APP_CITY_NAME \
    VITE_APP_ZONE=$VITE_APP_ZONE \
    VITE_HOTLINE_BRGY=$VITE_HOTLINE_BRGY \
    VITE_HOTLINE_VAWC=$VITE_HOTLINE_VAWC \
    VITE_OFFICIAL_EMAIL=$VITE_OFFICIAL_EMAIL \
    VITE_OFFICIAL_FB=$VITE_OFFICIAL_FB
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime (PHP 8.4-FPM + Nginx + Supervisor)
# ------------------------------------------------------------------------------
FROM php:8.4-fpm-alpine

# Install Nginx, Supervisor, bash, curl, Python 3, and scientific packages
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    bash \
    python3 \
    py3-pip \
    py3-numpy \
    py3-scikit-learn

# Install NLTK and download offline corpora for AI Classification Subsystem
RUN pip install --no-cache-dir --break-system-packages nltk \
    && python3 -m nltk.downloader -d /usr/share/nltk_data punkt wordnet omw-1.4 punkt_tab

# Install official PHP extension installer
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install required PHP extensions for Laravel & MySQL
RUN install-php-extensions \
    pdo_mysql \
    bcmath \
    opcache \
    pcntl \
    zip \
    gd \
    intl \
    redis

# Copy configuration files
COPY deployment/nginx.conf /etc/nginx/nginx.conf
COPY deployment/supervisord.conf /etc/supervisor/supervisord.conf
COPY deployment/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY deployment/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

WORKDIR /var/www/html

# Copy application source
COPY . /var/www/html

# Copy pre-built vendor and compiled front-end assets from builder
COPY --from=builder /app/vendor /var/www/html/vendor
COPY --from=builder /app/public/build /var/www/html/public/build

# Setup storage, bootstrap cache, and permissions
RUN mkdir -p /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/framework/cache \
             /var/www/html/storage/logs \
             /var/www/html/storage/app/public \
             /var/www/html/bootstrap/cache \
             /var/log/nginx \
             /run/nginx \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/log/nginx /run/nginx \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Production environment defaults
ENV APP_ENV=production \
    APP_DEBUG=false \
    PORT=8000 \
    DB_CONNECTION=mysql \
    SESSION_DRIVER=database \
    CACHE_STORE=database \
    QUEUE_CONNECTION=database \
    AUTORUN_MIGRATIONS=true \
    PYTHON_PATH=python3 \
    NLTK_DATA=/usr/share/nltk_data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/up || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
