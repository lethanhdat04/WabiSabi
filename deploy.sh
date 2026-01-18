#!/bin/bash
# ============================================
# Nihongo Master - Deployment Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ===========================================
# Helper Functions
# ===========================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_success "All requirements satisfied."
}

# ===========================================
# Environment Setup
# ===========================================
setup_env() {
    log_info "Setting up environment..."

    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning ".env file created from .env.example"
            log_warning "Please edit .env file with your configuration before deploying!"
            exit 1
        else
            log_error ".env.example not found!"
            exit 1
        fi
    fi

    source .env

    # Validate required variables
    if [ -z "$MONGODB_URI" ] || [ "$MONGODB_URI" = "mongodb+srv://your_user:your_password@your-cluster.mongodb.net/nihongo_master?retryWrites=true&w=majority" ]; then
        log_error "Please set MONGODB_URI in .env with your MongoDB Atlas connection string"
        exit 1
    fi

    if [ -z "$JWT_SECRET" ]; then
        log_error "Please set a secure JWT_SECRET in .env"
        exit 1
    fi

    log_success "Environment validated."
}

# ===========================================
# SSL Certificate Setup
# ===========================================
setup_ssl() {
    log_info "Setting up SSL certificates..."

    mkdir -p nginx/ssl

    if [ -f nginx/ssl/fullchain.pem ] && [ -f nginx/ssl/privkey.pem ]; then
        log_info "SSL certificates already exist."
        return 0
    fi

    echo ""
    echo "SSL Certificate Options:"
    echo "1) Generate self-signed certificate (development)"
    echo "2) Use Let's Encrypt (production - requires domain)"
    echo "3) Skip SSL setup (HTTP only)"
    echo ""
    read -p "Select option [1-3]: " ssl_option

    case $ssl_option in
        1)
            log_info "Generating self-signed certificate..."
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout nginx/ssl/privkey.pem \
                -out nginx/ssl/fullchain.pem \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            log_success "Self-signed certificate generated."
            ;;
        2)
            if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "your-domain.com" ]; then
                log_error "Please set DOMAIN in .env for Let's Encrypt"
                exit 1
            fi
            log_info "Setting up Let's Encrypt for $DOMAIN..."
            # Use certbot with standalone mode first
            docker run -it --rm \
                -v "$SCRIPT_DIR/nginx/ssl:/etc/letsencrypt/live/$DOMAIN" \
                -p 80:80 \
                certbot/certbot certonly --standalone \
                -d "$DOMAIN" \
                --agree-tos \
                --no-eff-email \
                --email admin@$DOMAIN
            log_success "Let's Encrypt certificate obtained."
            ;;
        3)
            log_warning "Skipping SSL setup. Using HTTP only."
            # Use HTTP-only nginx config
            if [ -f nginx/conf.d/default-http.conf.example ]; then
                cp nginx/conf.d/default-http.conf.example nginx/conf.d/default.conf
                log_info "HTTP-only nginx configuration applied."
            fi
            # Create dummy SSL files to prevent Docker errors
            mkdir -p nginx/ssl
            touch nginx/ssl/fullchain.pem
            touch nginx/ssl/privkey.pem
            ;;
        *)
            log_error "Invalid option"
            exit 1
            ;;
    esac
}

# ===========================================
# Build & Deploy
# ===========================================
build() {
    log_info "Building Docker images..."

    if docker compose version &> /dev/null; then
        docker compose build --no-cache
    else
        docker-compose build --no-cache
    fi

    log_success "Build completed."
}

deploy() {
    log_info "Starting deployment..."

    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi

    log_success "Deployment completed."
}

stop() {
    log_info "Stopping services..."

    if docker compose version &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi

    log_success "Services stopped."
}

restart() {
    log_info "Restarting services..."
    stop
    deploy
    log_success "Services restarted."
}

status() {
    log_info "Checking service status..."

    if docker compose version &> /dev/null; then
        docker compose ps
    else
        docker-compose ps
    fi
}

logs() {
    local service=$1
    if [ -z "$service" ]; then
        if docker compose version &> /dev/null; then
            docker compose logs -f --tail=100
        else
            docker-compose logs -f --tail=100
        fi
    else
        if docker compose version &> /dev/null; then
            docker compose logs -f --tail=100 "$service"
        else
            docker-compose logs -f --tail=100 "$service"
        fi
    fi
}

clean() {
    log_warning "This will remove all containers, volumes, and images for this project."
    read -p "Are you sure? [y/N]: " confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        log_info "Cleaning up..."

        if docker compose version &> /dev/null; then
            docker compose down -v --rmi all
        else
            docker-compose down -v --rmi all
        fi

        log_success "Cleanup completed."
    else
        log_info "Cleanup cancelled."
    fi
}

# ===========================================
# Health Check
# ===========================================
health_check() {
    log_info "Running health checks..."

    echo ""
    echo "Checking Backend (connects to MongoDB Atlas)..."
    if curl -sf http://localhost:8080/actuator/health &> /dev/null; then
        log_success "Backend is healthy"
    else
        log_warning "Backend health check failed (may still be starting)"
    fi

    echo ""
    echo "Checking Frontend..."
    if curl -sf http://localhost:3000 &> /dev/null; then
        log_success "Frontend is healthy"
    else
        log_warning "Frontend health check failed (may still be starting)"
    fi

    echo ""
    echo "Checking Nginx..."
    if curl -sf http://localhost &> /dev/null; then
        log_success "Nginx is healthy"
    else
        log_warning "Nginx health check failed"
    fi
}

# ===========================================
# Usage
# ===========================================
usage() {
    echo ""
    echo "Nihongo Master - Deployment Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  init        Initialize environment and SSL"
    echo "  build       Build Docker images"
    echo "  deploy      Deploy all services"
    echo "  start       Alias for deploy"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs [svc]  Show logs (optionally for specific service)"
    echo "  health      Run health checks"
    echo "  clean       Remove all containers, volumes, and images"
    echo ""
    echo "Examples:"
    echo "  $0 init                 # First-time setup"
    echo "  $0 build && $0 deploy   # Build and deploy"
    echo "  $0 logs backend         # View backend logs"
    echo ""
}

# ===========================================
# Main
# ===========================================
case "$1" in
    init)
        check_requirements
        setup_env
        setup_ssl
        log_success "Initialization complete. Run '$0 build && $0 deploy' to start."
        ;;
    build)
        check_requirements
        setup_env
        build
        ;;
    deploy|start)
        check_requirements
        setup_env
        deploy
        echo ""
        log_info "Waiting for services to start..."
        sleep 10
        health_check
        echo ""
        log_success "Application is available at http://localhost"
        ;;
    stop)
        stop
        ;;
    restart)
        check_requirements
        setup_env
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    health)
        health_check
        ;;
    clean)
        clean
        ;;
    *)
        usage
        exit 1
        ;;
esac
