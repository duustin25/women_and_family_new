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

# Ensure seed account passwords exist (generated once, persisted alongside the key)
CREDS_FILE=/var/www/html/storage/app/.initial_credentials
if [ ! -s "$CREDS_FILE" ]; then
    gen_pass() { php -r 'echo "Wfp-".bin2hex(random_bytes(8))."!";'; }
    {
        echo "SEED_ADMIN_PASSWORD=${SEED_ADMIN_PASSWORD:-$(gen_pass)}"
        echo "SEED_HEAD_PASSWORD=${SEED_HEAD_PASSWORD:-$(gen_pass)}"
        echo "SEED_PRESIDENT_PASSWORD=${SEED_PRESIDENT_PASSWORD:-$(gen_pass)}"
    } > "$CREDS_FILE"
    chmod 600 "$CREDS_FILE"
fi
set -a
. "$CREDS_FILE"
set +a

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

    # Seed system accounts only once (marker persisted in the storage_app volume)
    SEED_MARKER=/var/www/html/storage/app/.seeded
    if [ "${AUTORUN_SEED:-false}" = "true" ] && [ ! -f "$SEED_MARKER" ]; then
        echo "==> First boot: seeding system accounts..."
        if php artisan db:seed --class=UserSeeder --force; then
            touch "$SEED_MARKER"
            echo "==> Initial login credentials (also saved in storage/app/.initial_credentials):"
            echo "    Admin:      ${SEED_ADMIN_EMAIL:-b183womenandfamily@gmail.com} / $SEED_ADMIN_PASSWORD"
            echo "    Head:       ${SEED_HEAD_EMAIL:-head@villamor183.local} / $SEED_HEAD_PASSWORD"
            echo "    Presidents: (organization accounts) / $SEED_PRESIDENT_PASSWORD"
        else
            echo "==> Notice: Seeding failed; it will be retried on next start."
        fi
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
