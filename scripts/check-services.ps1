#!/usr/bin/env pwsh
# CHECK ALL SERVICES STATUS
# Shows the status of all Quado services
# Usage: .\scripts\check-services.ps1

Write-Host "🔍 Quado Services Status Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Docker:" -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  ✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker not running" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Base Services:" -ForegroundColor Yellow

# Check container status
$containers = @('quado-postgres', 'quado-redis', 'quado-minio')
foreach ($container in $containers) {
    try {
        $status = docker inspect -f '{{.State.Status}}' $container 2>$null
        if ($status -eq 'running') {
            Write-Host "  ✅ $container is running" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $container is $status" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ $container not found" -ForegroundColor Red
    }
}

# Check ports
Write-Host ""
Write-Host "Port Status:" -ForegroundColor Yellow

$ports = @(
    @{Port=5432; Name="PostgreSQL"},
    @{Port=6379; Name="Redis"},
    @{Port=9001; Name="MinIO API"},
    @{Port=9002; Name="MinIO Console"},
    @{Port=9000; Name="Sentry"}
)

foreach ($item in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $item.Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  ✅ Port $($item.Port) - $($item.Name) is active" -ForegroundColor Green
    } else {
        Write-Host "  ⚪ Port $($item.Port) - $($item.Name) is free" -ForegroundColor Gray
    }
}

# Check Next.js
Write-Host ""
Write-Host "Application:" -ForegroundColor Yellow
$nextjs = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($nextjs) {
    Write-Host "  ✅ Next.js running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  ⚪ Next.js not running (start with: pnpm dev)" -ForegroundColor Gray
}

# Service URLs
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📍 Access URLs" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application:   http://localhost:3000" -ForegroundColor White
Write-Host "MinIO Console: http://localhost:9002" -ForegroundColor White
Write-Host "Sentry:        http://localhost:9000" -ForegroundColor White
Write-Host ""
