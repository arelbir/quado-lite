#!/usr/bin/env pwsh
# STOP ALL QUADO SERVICES
# Gracefully stops all running services
# Usage: .\scripts\stop-all-services.ps1

Write-Host "🛑 Stopping Quado Framework Services" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# Stop Quado services
Write-Host "Stopping PostgreSQL, Redis, MinIO..." -ForegroundColor Cyan
docker compose down

Write-Host ""
Write-Host "✅ All services stopped" -ForegroundColor Green
Write-Host ""
Write-Host "Note: To stop Sentry (if installed):" -ForegroundColor Yellow
Write-Host "   cd ..\self-hosted" -ForegroundColor White
Write-Host "   docker compose down" -ForegroundColor White
Write-Host ""
