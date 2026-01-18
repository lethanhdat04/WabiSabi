#!/bin/bash
# ============================================
# SSL Renewal Script
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="datto.io.vn"

echo "Renewing SSL certificate..."

docker run --rm \
    -v "$SCRIPT_DIR/certbot/conf:/etc/letsencrypt" \
    -v "$SCRIPT_DIR/certbot/www:/var/www/certbot" \
    certbot/certbot renew --quiet

# Copy new certificates
cp "$SCRIPT_DIR/certbot/conf/live/$DOMAIN/fullchain.pem" "$SCRIPT_DIR/nginx/ssl/"
cp "$SCRIPT_DIR/certbot/conf/live/$DOMAIN/privkey.pem" "$SCRIPT_DIR/nginx/ssl/"

# Reload nginx
docker compose exec nginx nginx -s reload

echo "SSL certificate renewed!"
