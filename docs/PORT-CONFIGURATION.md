# Port Configuration

Quado Framework port kullanımı ve çakışma çözümleri.

---

## 📊 Port Mapping

| Service | Port(s) | URL | Notes |
|---------|---------|-----|-------|
| **Next.js** | 3000 | http://localhost:3000 | Development server |
| **PostgreSQL** | 5432 | localhost:5432 | Database |
| **Redis** | 6379 | localhost:6379 | Cache & queues |
| **MinIO API** | 9001 | http://localhost:9001 | File storage (changed from 9000) |
| **MinIO Console** | 9002 | http://localhost:9002 | Admin UI (changed from 9001) |
| **Sentry** | 9000 | http://localhost:9000 | Error tracking |
| **MailHog** | 8025 | http://localhost:8025 | Email testing (optional) |
| **MailHog SMTP** | 1025 | localhost:1025 | SMTP server (optional) |

---

## 🔧 Why MinIO Port Changed

**Original Configuration:**
```
MinIO API: 9000
MinIO Console: 9001
```

**Problem:** Sentry self-hosted uses port 9000 by default

**Solution:** MinIO moved to 9001
```
MinIO API: 9001 ← Changed
MinIO Console: 9002 ← Changed
Sentry: 9000 ← Free now!
```

---

## 🔄 After Port Change

### 1. **Update .env** (✅ Done)

```env
MINIO_PORT=9001
MINIO_PUBLIC_URL=http://localhost:9001
```

### 2. **Update docker-compose.yml** (✅ Done)

```yaml
minio:
  ports:
    - "9001:9000"  # API
    - "9002:9001"  # Console
```

### 3. **Restart MinIO**

```powershell
# Option 1: Restart just MinIO
.\scripts\restart-minio.ps1

# Option 2: Restart all services
docker compose down
docker compose up -d
```

### 4. **Restart Next.js** (to reload .env)

```powershell
# Stop dev server (Ctrl+C)
# Start again
pnpm dev
```

---

## ✅ Verification

### Test MinIO API:
```powershell
# Should return MinIO info
curl http://localhost:9001/minio/health/live
```

### Test MinIO Console:
Open in browser: http://localhost:9002
- Username: admin
- Password: minioadmin

### Test File Upload:
Use any upload feature in Quado app. Files should upload to MinIO on port 9001.

---

## 🚨 Troubleshooting

### MinIO not accessible after port change:

```powershell
# Check if container is running
docker compose ps

# Check MinIO logs
docker compose logs minio

# Restart MinIO
.\scripts\restart-minio.ps1

# If still failing, recreate container
docker compose down
docker compose up -d minio
```

### Next.js still using old port:

```powershell
# Restart dev server (important!)
# .env changes require restart
pnpm dev
```

### Uploads failing:

Check logs:
```powershell
# Check Pino logs
# Look for MinIO connection errors

# Verify .env loaded
echo $env:MINIO_PORT  # Should show 9001
```

---

## 🔍 Port Conflicts

### Check what's using a port:

```powershell
# Windows
netstat -ano | findstr :9000
netstat -ano | findstr :9001

# Find process
Get-Process -Id <PID>
```

### Kill process on port:

```powershell
# Windows (replace PID)
Stop-Process -Id <PID> -Force

# Or use Process Explorer
```

---

## 📝 Configuration Files Updated

- ✅ `.env` - MINIO_PORT and MINIO_PUBLIC_URL
- ✅ `docker-compose.yml` - Port mappings
- ✅ `scripts/restart-minio.ps1` - Restart helper
- ✅ `docs/PORT-CONFIGURATION.md` - This file

---

## 🎯 Next Steps

1. ✅ MinIO port changed to 9001
2. ⏭️ Restart MinIO: `.\scripts\restart-minio.ps1`
3. ⏭️ Restart Next.js: `pnpm dev`
4. ⏭️ Install Sentry: `.\scripts\setup-sentry.ps1`
5. ⏭️ Sentry will use port 9000 (now free!)

---

**Last Updated:** 2025-01-25  
**Status:** MinIO moved to 9001, Sentry can use 9000
