# SENTRY DOCKER SETUP SCRIPT (PowerShell)
# Automatically sets up Sentry self-hosted with one command
# Usage: .\scripts\setup-sentry.ps1

$ErrorActionPreference = "Stop"

Write-Host "Sentry Self-Hosted Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    docker --version | Out-Null
    Write-Host "  Docker found" -ForegroundColor Green
} catch {
    Write-Host "  Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    docker compose version | Out-Null
    Write-Host "  Docker Compose found" -ForegroundColor Green
} catch {
    Write-Host "  Docker Compose not found. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Check if Sentry is already cloned
$SentryDir = "..\self-hosted"

if (Test-Path $SentryDir) {
    Write-Host ""
    Write-Host "Sentry directory already exists at $SentryDir" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove and reinstall? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Removing old installation..." -ForegroundColor Yellow
        Remove-Item -Path $SentryDir -Recurse -Force
    } else {
        Write-Host "Using existing installation" -ForegroundColor Cyan
        Set-Location $SentryDir
    }
}

# Clone Sentry if needed
if (-not (Test-Path $SentryDir)) {
    Write-Host ""
    Write-Host "Cloning Sentry self-hosted repository..." -ForegroundColor Yellow
    Set-Location ..
    git clone https://github.com/getsentry/self-hosted.git
    Set-Location self-hosted
    Write-Host "  Sentry cloned" -ForegroundColor Green
} else {
    Set-Location $SentryDir
}

# Check for port conflicts
Write-Host ""
Write-Host "Checking for port conflicts..." -ForegroundColor Yellow

$PortInUse = Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue
if ($PortInUse) {
    Write-Host "  Port 9000 is already in use (probably MinIO)" -ForegroundColor Yellow
    Write-Host "  We'll configure Sentry to use port 9001 instead" -ForegroundColor Cyan
    
    # Modify docker-compose.yml to use port 9001
    if (Test-Path "docker-compose.yml") {
        $content = Get-Content "docker-compose.yml" -Raw
        $content = $content -replace '9000:9000', '9001:9000'
        Set-Content "docker-compose.yml" $content
        Write-Host "  Sentry configured to use port 9001" -ForegroundColor Green
    }
    $SentryPort = 9001
} else {
    $SentryPort = 9000
}

# Run installer
Write-Host ""
Write-Host "Running Sentry installer..." -ForegroundColor Yellow
Write-Host "You will be asked to create an admin user" -ForegroundColor Yellow
Write-Host ""

# Check if already installed
if (Test-Path "sentry\sentry.conf.py") {
    Write-Host "Sentry appears to be already installed" -ForegroundColor Cyan
    $response = Read-Host "Skip installation? (Y/n)"
    if ($response -ne 'n' -and $response -ne 'N') {
        Write-Host "Skipping installation" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Running install.sh requires WSL or Git Bash" -ForegroundColor Yellow
        Write-Host "Please run: .\install.sh" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "After installation completes, run this script again" -ForegroundColor Cyan
        exit 0
    }
} else {
    Write-Host "Running install.sh requires WSL or Git Bash" -ForegroundColor Yellow
    Write-Host "Please run in Git Bash or WSL: ./install.sh" -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "Have you completed the installation? (y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host ""
        Write-Host "Please complete Sentry installation first:" -ForegroundColor Cyan
        Write-Host "  1. Open Git Bash or WSL in this directory" -ForegroundColor White
        Write-Host "  2. Run: ./install.sh" -ForegroundColor White
        Write-Host "  3. Run this script again" -ForegroundColor White
        exit 0
    }
}

# Start Sentry
Write-Host ""
Write-Host "Starting Sentry services..." -ForegroundColor Yellow
docker compose up -d

# Wait for Sentry to be ready
Write-Host ""
Write-Host "Waiting for Sentry to be ready..." -ForegroundColor Yellow
Write-Host "This may take 1-2 minutes..." -ForegroundColor Cyan

# Wait up to 3 minutes
$Counter = 0
$MaxWait = 180
$Ready = $false

while ($Counter -lt $MaxWait) {
    $logs = docker compose logs web 2>&1 | Select-String "Sentry is ready"
    if ($logs) {
        Write-Host "  Sentry is ready!" -ForegroundColor Green
        $Ready = $true
        break
    }
    
    if ($Counter % 10 -eq 0) {
        $elapsed = $Counter
        Write-Host "  Still waiting... ($elapsed seconds elapsed)" -ForegroundColor Cyan
    }
    
    Start-Sleep -Seconds 1
    $Counter++
}

if (-not $Ready) {
    Write-Host "  Timeout waiting for Sentry. Check logs with: docker compose logs -f web" -ForegroundColor Yellow
}

# Success message
Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "Sentry Setup Complete!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Sentry at: http://localhost:$SentryPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:$SentryPort in your browser"
Write-Host "2. Login with your admin credentials"
Write-Host "3. Create a new project:"
Write-Host "   - Platform: Next.js"
Write-Host "   - Name: quado-lite"
Write-Host "4. Copy the DSN"
Write-Host "5. Update .env file:"
Write-Host "   NEXT_PUBLIC_SENTRY_DSN=http://YOUR_KEY@localhost:$SentryPort/1"
Write-Host "6. Restart your Next.js dev server"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "   docker compose ps              # Check status"
Write-Host "   docker compose logs -f web     # View logs"
Write-Host "   docker compose down            # Stop Sentry"
Write-Host "   docker compose up -d           # Start Sentry"
Write-Host ""
