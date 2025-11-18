# RESTART MINIO WITH NEW PORT
# Restarts MinIO container with updated port configuration
# Usage: .\scripts\restart-minio.ps1

Write-Host "🔄 Restarting MinIO with new port configuration..." -ForegroundColor Cyan
Write-Host ""

# Stop MinIO container
Write-Host "🛑 Stopping MinIO..." -ForegroundColor Yellow
docker compose stop minio

# Remove MinIO container (keeps data volume)
Write-Host "🗑️  Removing old container..." -ForegroundColor Yellow
docker compose rm -f minio

# Start MinIO with new configuration
Write-Host "🚀 Starting MinIO on new ports..." -ForegroundColor Yellow
docker compose up -d minio

# Wait a moment
Start-Sleep -Seconds 3

# Check status
Write-Host ""
Write-Host "✅ MinIO restarted!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 New URLs:" -ForegroundColor Cyan
Write-Host "   API:     http://localhost:9001" -ForegroundColor White
Write-Host "   Console: http://localhost:9002" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: minioadmin" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Sentry can now use port 9000!" -ForegroundColor Green
Write-Host ""

# Show container status
docker compose ps minio
