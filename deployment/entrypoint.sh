#!/bin/sh
set -e

echo "==> Starting Barangay 183 WFP Application container..."

# Create storage directory structure if not present
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Ensure APP_KEY exists
if [ -z "$APP_KEY" ]; then
    echo "==> Warning: APP_KEY is empty. Generating key..."
    php artisan key:generate --force
fi

# Link storage
echo "==> Linking storage..."
php artisan storage:link --force || true

# Wait for database and run migrations if enabled
if [ "${AUTORUN_MIGRATIONS:-true}" = "true" ]; then
    echo "==> Checking database connection..."
    MAX_TRIES=30
    COUNT=0
    until php artisan db:monitor --databases=mysql > /dev/null 2>&1 || [ $COUNT -ge $MAX_TRIES ]; do
        echo "==> Waiting for database to become available... ($COUNT/$MAX_TRIES)"
        sleep 2
        COUNT=$((COUNT + 1))
    done

    echo "==> Running database migrations..."
    php artisan migrate --force || echo "==> Notice: Database migration completed with status: $?"

    if [ "${AUTORUN_SEED:-false}" = "true" ]; then
        echo "==> Running database seeders..."
        php artisan db:seed --force || echo "==> Notice: Seeding completed with status: $?"
    fi
fi

# Cache configuration, routes, and views in production
if [ "${APP_ENV:-production}" = "production" ]; then
    echo "==> Caching application configurations for production..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
    php artisan event:cache || true
fi

echo "==> Application ready. Starting supervisor..."
exec "$@"
