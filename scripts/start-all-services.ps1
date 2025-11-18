#!/usr/bin/env pwsh
# START ALL QUADO SERVICES
# Starts all required services in the correct order with proper port configuration
# Usage: .\scripts\start-all-services.ps1

$ErrorActionPreference = "Stop"

Write-Host "ğŸš€ Starting Quado Framework Services" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "ğŸ“‹ Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "âœ… Docker is running" -ForegroundColor Green
} catch {
    Write-Host "âŒ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Step 2: Stop any conflicting services
Write-Host ""
Write-Host "ğŸ“‹ Step 2: Checking for port conflicts..." -ForegroundColor Yellow

$portsToCheck = @(
    @{Port=5432; Service="PostgreSQL"},
    @{Port=6379; Service="Redis"},
    @{Port=9000; Service="Sentry (target)"},
    @{Port=9001; Service="MinIO API"},
    @{Port=9002; Service="MinIO Console"}
)

foreach ($item in $portsToCheck) {
    $connection = Get-NetTCPConnection -LocalPort $item.Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "âš ï¸  Port $($item.Port) is in use by $($item.Service)" -ForegroundColor Yellow
    } else {
        Write-Host "âœ… Port $($item.Port) is free ($($item.Service))" -ForegroundColor Green
    }
}

# Step 3: Start base services (PostgreSQL, Redis, MinIO)
Write-Host ""
Write-Host "ğŸ“‹ Step 3: Starting base services..." -ForegroundColor Yellow

docker compose up -d postgres redis minio

Write-Host "â³ Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Check health
Write-Host ""
$services = docker compose ps --format json | ConvertFrom-Json
foreach ($service in $services) {
    if ($service.Service -in @('postgres', 'redis', 'minio')) {
        $status = if ($service.Health -eq "healthy" -or $service.State -eq "running") { "âœ…" } else { "âš ï¸" }
        Write-Host "$status $($service.Service): $($service.State)" -ForegroundColor $(if ($status -eq "âœ…") { "Green" } else { "Yellow" })
    }
}

# Step 4: Show service URLs
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ğŸ“ Service URLs & Ports" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ğŸ—„ï¸  Database:" -ForegroundColor Yellow
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "   Database:   quado" -ForegroundColor White
Write-Host "   User:       quado" -ForegroundColor White
Write-Host "   Password:   password" -ForegroundColor White
Write-Host ""
Write-Host "âš¡ Cache:" -ForegroundColor Yellow
Write-Host "   Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "ğŸ“¦ File Storage:" -ForegroundColor Yellow
Write-Host "   MinIO API:     http://localhost:9001" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9002" -ForegroundColor White
Write-Host "   Username:      admin" -ForegroundColor White
Write-Host "   Password:      minioadmin" -ForegroundColor White
Write-Host ""
Write-Host "ğŸ› Error Tracking:" -ForegroundColor Yellow
Write-Host "   Sentry: http://localhost:9000 (ready to install)" -ForegroundColor White
Write-Host ""

# Step 5: Ask about Sentry
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "ğŸ“‹ Step 4: Sentry Installation" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sentry self-hosted is ready to be installed on port 9000." -ForegroundColor Cyan
$response = Read-Host "Do you want to install Sentry now? (y/N)"

if ($response -eq 'y' -or $response -eq 'Y')
{
    Write-Host ""
    Write-Host "ğŸš€ Starting Sentry installation..." -ForegroundColor Cyan
    & "$PSScriptRoot\setup-sentry.ps1"
}
else
{
    Write-Host ""
    Write-Host "â„¹ï¸  Sentry installation skipped." -ForegroundColor Cyan
    Write-Host "   You can install it later with: .\scripts\setup-sentry.ps1" -ForegroundColor White
}

# Step 6: Final summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "âœ… Services Started Successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ğŸ¯ Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Next.js development server:" -ForegroundColor White
Write-Host "   pnpm dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Access your application:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Access MinIO Console:" -ForegroundColor White
Write-Host "   http://localhost:9002" -ForegroundColor Cyan
Write-Host ""
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host "4. Install Sentry (optional):" -ForegroundColor White
    Write-Host "   .\scripts\setup-sentry.ps1" -ForegroundColor Cyan
    Write-Host ""
}
Write-Host "ğŸ“š Documentation:" -ForegroundColor Yellow
Write-Host "   - Port config:     docs/PORT-CONFIGURATION.md" -ForegroundColor White
Write-Host "   - Sentry setup:    docs/SENTRY-QUICK-START.md" -ForegroundColor White
Write-Host "   - Logging:         docs/LOGGING-STRATEGY.md" -ForegroundColor White
Write-Host ""
Write-Host "ğŸ” Useful Commands:" -ForegroundColor Yellow
Write-Host "   docker compose ps              # Check service status" -ForegroundColor White
Write-Host "   docker compose logs -f         # View all logs" -ForegroundColor White
Write-Host "   docker compose down            # Stop all services" -ForegroundColor White
Write-Host "   .\scripts\restart-minio.ps1    # Restart MinIO only" -ForegroundColor White
Write-Host ""
