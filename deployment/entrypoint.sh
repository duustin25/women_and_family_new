#!/bin/sh
set -e

echo "==> Starting Barangay 183 WFP Application container..."

# Create storage directory structure if not present
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/storage/app/public/officials \
         /var/www/html/storage/app/public/gad_events \
         /var/www/html/storage/app/public/announcements \
         /var/www/html/bootstrap/cache \
         /var/lib/nginx/tmp/client_body \
         /var/lib/nginx/tmp/fastcgi \
         /var/lib/nginx/tmp/proxy \
         /var/log/nginx \
         /run/nginx

# Fix permissions for PHP and Nginx worker
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/lib/nginx /var/log/nginx /run/nginx
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/lib/nginx /var/log/nginx /run/nginx

# Ensure APP_KEY exists (generated once, persisted in the storage_app volume)
KEY_FILE=/var/www/html/storage/app/.app_key
if [ -z "$APP_KEY" ]; then
    if [ ! -s "$KEY_FILE" ]; then
        echo "==> APP_KEY not provided. Generating a persistent key..."
        php -r 'echo "base64:".base64_encode(random_bytes(32));' > "$KEY_FILE"
        chmod 600 "$KEY_FILE"
    fi
    APP_KEY=$(cat "$KEY_FILE")
    export APP_KEY
fi

# Ensure seed account passwords exist
export SEED_ADMIN_EMAIL="${SEED_ADMIN_EMAIL:-djkhalid1m@gmail.com}"
export SEED_ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-Dustin_183@Women&Family2026}"
export SEED_HEAD_EMAIL="${SEED_HEAD_EMAIL:-djkhalid2m@gmail.com}"
export SEED_HEAD_PASSWORD="${SEED_HEAD_PASSWORD:-Head_183@Women&Family2026}"
export SEED_PRESIDENT_PASSWORD="${SEED_PRESIDENT_PASSWORD:-Org_183@Women&Family2026}"

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

    # Ensure system tables, forms schemas, accounts, and application data are seeded
    if [ "${AUTORUN_SEED:-true}" = "true" ]; then
        echo "==> Running full database seeder (Zones, Form Schemas, Accounts, Sample Applications)..."
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
