# Nihongo Master - Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+ (or docker-compose 1.29+)
- Git
- (Optional) Domain name for production SSL

## Quick Start

### 1. Clone and Setup

```bash
cd /path/to/Nihongo-Master

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

### 2. Configure Environment Variables

Edit `.env` file with your settings:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your_user:your_password@your-cluster.mongodb.net/nihongo_master?retryWrites=true&w=majority

# JWT - Generate with: openssl rand -base64 32
JWT_SECRET=your-256-bit-secret-key-here

# Domain (for production SSL)
DOMAIN=your-domain.com
```

### 3. Initialize and Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Initialize (first time only)
./deploy.sh init

# Build and deploy
./deploy.sh build
./deploy.sh deploy
```

### 4. Access the Application

- **Frontend**: http://localhost (or https://your-domain.com)
- **API**: http://localhost/api
- **Swagger UI**: http://localhost/swagger-ui/

## Deployment Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh init` | First-time setup (env + SSL) |
| `./deploy.sh build` | Build Docker images |
| `./deploy.sh deploy` | Start all services |
| `./deploy.sh stop` | Stop all services |
| `./deploy.sh restart` | Restart all services |
| `./deploy.sh status` | Show service status |
| `./deploy.sh logs` | View all logs |
| `./deploy.sh logs backend` | View backend logs |
| `./deploy.sh health` | Run health checks |
| `./deploy.sh clean` | Remove everything |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx                                │
│                    (Port 80/443)                             │
│                  Reverse Proxy + SSL                         │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
                      ▼                   ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│      Frontend (Next.js)     │ │    Backend (Spring Boot)    │
│         Port 3000           │ │         Port 8080           │
└─────────────────────────────┘ └──────────────┬──────────────┘
                                               │
                                               ▼
                              ┌─────────────────────────────┐
                              │     MongoDB Atlas (Cloud)    │
                              │      (External Service)      │
                              └─────────────────────────────┘
```

## SSL Options

### Option 1: Self-Signed (Development)

During `./deploy.sh init`, select option 1. This generates a self-signed certificate for local development.

### Option 2: Let's Encrypt (Production)

1. Set your domain in `.env`:
   ```env
   DOMAIN=your-domain.com
   ```

2. Ensure ports 80 and 443 are open on your server

3. During `./deploy.sh init`, select option 2

4. Certbot will automatically obtain certificates

### Option 3: HTTP Only

Select option 3 during init to skip SSL (not recommended for production).

## Manual Docker Commands

If you prefer manual control:

```bash
# Build
docker compose build

# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Rebuild specific service
docker compose build backend
docker compose up -d backend
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and redeploy
./deploy.sh build
./deploy.sh restart
```

## Troubleshooting

### Services won't start

```bash
# Check status
./deploy.sh status

# Check logs
./deploy.sh logs

# Verify environment
cat .env
```

### MongoDB Atlas connection issues

```bash
# Check backend logs for MongoDB connection errors
./deploy.sh logs backend

# Verify MONGODB_URI is set correctly
grep MONGODB_URI .env

# Test connection from your machine
# Make sure your IP is whitelisted in MongoDB Atlas Network Access
```

### Backend not starting

```bash
# Check backend logs
./deploy.sh logs backend

# Verify environment variables
docker exec nihongo-backend env | grep -E "(MONGO|JWT)"
```

### Frontend build fails

```bash
# Rebuild frontend only
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Clear and restart everything

```bash
./deploy.sh clean
./deploy.sh init
./deploy.sh build
./deploy.sh deploy
```

## Production Checklist

- [ ] Configure `MONGODB_URI` with MongoDB Atlas connection string
- [ ] Whitelist server IP in MongoDB Atlas Network Access
- [ ] Generate secure `JWT_SECRET` with `openssl rand -base64 32`
- [ ] Configure domain and SSL
- [ ] Set up firewall (allow only 80, 443)
- [ ] Enable MongoDB Atlas backup (in Atlas dashboard)
- [ ] Set up monitoring (Prometheus, Grafana, etc.)
- [ ] Enable log rotation

## Backup & Restore

MongoDB Atlas provides automatic backups. To manage backups:

1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Click "Backup" tab
4. Configure backup schedule or take manual snapshots

For manual backup using `mongodump`:

```bash
# Install MongoDB tools locally
mongodump --uri="your_mongodb_atlas_uri" --archive=backup-$(date +%Y%m%d).gz --gzip

# Restore
mongorestore --uri="your_mongodb_atlas_uri" --archive=backup.gz --gzip --drop
```

## Resource Requirements

| Service | RAM (min) | RAM (recommended) |
|---------|-----------|-------------------|
| Backend | 256MB | 512MB |
| Frontend | 128MB | 256MB |
| Nginx | 32MB | 64MB |
| **Total** | **~500MB** | **~1GB** |

> Note: MongoDB runs on Atlas (cloud), so no local resources needed for database.

## Support

For issues, check:
1. Service logs: `./deploy.sh logs`
2. Health check: `./deploy.sh health`
3. Docker status: `docker compose ps`
