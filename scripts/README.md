# Setup Scripts

Otomatik kurulum script'leri.

## Sentry Docker Setup

Sentry'i Docker'da otomatik kurar ve başlatır.

### Windows (PowerShell)

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run script
.\scripts\setup-sentry.ps1
```

### macOS/Linux (Bash)

```bash
# Make executable
chmod +x scripts/setup-sentry.sh

# Run script
./scripts/setup-sentry.sh
```

## What the script does:

1. ✅ Checks Docker & Docker Compose
2. ✅ Clones Sentry self-hosted repo
3. ✅ Detects port conflicts (MinIO on 9000)
4. ✅ Configures Sentry to use port 9001 if needed
5. ✅ Runs Sentry installer
6. ✅ Starts all Docker services
7. ✅ Waits for Sentry to be ready
8. ✅ Shows access URL and next steps

## After setup:

1. Access: http://localhost:9000 (or 9001 if port conflict)
2. Create project
3. Copy DSN
4. Update .env
5. Restart Next.js

Total time: ~7 minutes
