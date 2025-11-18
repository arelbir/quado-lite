# Quado Scripts

Otomatik kurulum ve yönetim script'leri.

---

## 🚀 Quick Start (ALL-IN-ONE)

### Start Everything

```powershell
# Starts all services in correct order with proper port configuration
.\scripts\start-all-services.ps1
```

**What it does:**
- ✅ Checks Docker & prerequisites
- ✅ Detects port conflicts
- ✅ Starts PostgreSQL, Redis, MinIO
- ✅ Configures correct ports (MinIO: 9001/9002, Sentry: 9000)
- ✅ Optionally installs Sentry
- ✅ Shows all service URLs

**Result:**
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO API: http://localhost:9001
- MinIO Console: http://localhost:9002
- Sentry: http://localhost:9000 (if installed)

---

## 📋 Individual Scripts

### Service Management

```powershell
# Start all services
.\scripts\start-all-services.ps1

# Stop all services
.\scripts\stop-all-services.ps1

# Check service status
.\scripts\check-services.ps1

# Restart MinIO only
.\scripts\restart-minio.ps1
```

### Sentry Setup

```powershell
# Install Sentry self-hosted
.\scripts\setup-sentry.ps1
```

**Sentry installer:**
1. ✅ Checks Docker & Docker Compose
2. ✅ Clones Sentry self-hosted repo
3. ✅ Detects port conflicts
4. ✅ Runs Sentry installer (creates admin user)
5. ✅ Starts all Sentry services
6. ✅ Waits for ready state
7. ✅ Shows access URL

**Time:** ~7 minutes

---

## 🎯 Common Workflows

### First Time Setup

```powershell
# 1. Start all services
.\scripts\start-all-services.ps1
# (Choose 'Y' when asked about Sentry)

# 2. Start Next.js
pnpm dev

# 3. Access application
start http://localhost:3000
```

### Daily Development

```powershell
# Start services (if not running)
.\scripts\start-all-services.ps1

# Start Next.js
pnpm dev
```

### Check Everything

```powershell
# View status of all services
.\scripts\check-services.ps1
```

### Stop Everything

```powershell
# Stop Quado services
.\scripts\stop-all-services.ps1

# Stop Next.js (Ctrl+C in dev terminal)
```

---

## 🔧 Configuration

### Port Allocation

| Service | Port | URL |
|---------|------|-----|
| Next.js | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| MinIO API | 9001 | http://localhost:9001 |
| MinIO Console | 9002 | http://localhost:9002 |
| Sentry | 9000 | http://localhost:9000 |

See `docs/PORT-CONFIGURATION.md` for details.

---

## 📚 Documentation

- **Port Configuration:** `docs/PORT-CONFIGURATION.md`
- **Sentry Quick Start:** `docs/SENTRY-QUICK-START.md`
- **Sentry Self-Hosted:** `docs/SENTRY-SELF-HOSTED.md`
- **Logging Strategy:** `docs/LOGGING-STRATEGY.md`

---

## ⚡ Script Reference

| Script | Purpose | Time |
|--------|---------|------|
| `start-all-services.ps1` | Start all services | 1-2 min |
| `stop-all-services.ps1` | Stop all services | 10 sec |
| `check-services.ps1` | Check status | 5 sec |
| `restart-minio.ps1` | Restart MinIO | 30 sec |
| `setup-sentry.ps1` | Install Sentry | 5-7 min |

---

## 🆘 Troubleshooting

### Services won't start

```powershell
# Check Docker is running
docker --version

# Check for port conflicts
.\scripts\check-services.ps1

# View logs
docker compose logs -f
```

### Port conflicts

```powershell
# Check what's using a port
netstat -ano | findstr :9000

# Kill process
Stop-Process -Id <PID> -Force
```

### Reset everything

```powershell
# Stop and remove all containers
docker compose down -v

# Start fresh
.\scripts\start-all-services.ps1
```

---

**Need help?** Check the docs folder or run `.\scripts\check-services.ps1` to see current status.
