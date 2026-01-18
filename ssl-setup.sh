#!/bin/bash
# ============================================
# SSL Setup Script for datto.io.vn
# ============================================

set -e

DOMAIN="datto.io.vn"
EMAIL="admin@datto.io.vn"  # Thay đổi email của bạn
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== SSL Setup for $DOMAIN ==="
echo ""

# Check if running as production
read -p "Bạn đang chạy trên server production với domain $DOMAIN đã trỏ về? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Vui lòng đảm bảo domain đã trỏ về IP server trước khi chạy script này."
    exit 1
fi

# Create directories
mkdir -p "$SCRIPT_DIR/nginx/ssl"
mkdir -p "$SCRIPT_DIR/certbot/www"
mkdir -p "$SCRIPT_DIR/certbot/conf"

# Stop nginx temporarily
echo "Stopping nginx..."
docker compose stop nginx 2>/dev/null || true

# Get certificate using standalone mode
echo "Requesting SSL certificate from Let's Encrypt..."
docker run -it --rm \
    -p 80:80 \
    -v "$SCRIPT_DIR/certbot/conf:/etc/letsencrypt" \
    -v "$SCRIPT_DIR/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --standalone \
    --preferred-challenges http \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email

# Copy certificates to nginx ssl folder
echo "Copying certificates..."
cp "$SCRIPT_DIR/certbot/conf/live/$DOMAIN/fullchain.pem" "$SCRIPT_DIR/nginx/ssl/"
cp "$SCRIPT_DIR/certbot/conf/live/$DOMAIN/privkey.pem" "$SCRIPT_DIR/nginx/ssl/"

# Set permissions
chmod 644 "$SCRIPT_DIR/nginx/ssl/fullchain.pem"
chmod 600 "$SCRIPT_DIR/nginx/ssl/privkey.pem"

# Restart nginx
echo "Starting nginx..."
docker compose up -d nginx

echo ""
echo "=== SSL Setup Complete ==="
echo "Website: https://$DOMAIN"
echo ""
echo "Để tự động gia hạn certificate, thêm cronjob:"
echo "0 0 1 * * cd $SCRIPT_DIR && ./ssl-renew.sh"
