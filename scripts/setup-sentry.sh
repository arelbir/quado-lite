#!/bin/bash
# SENTRY DOCKER SETUP SCRIPT
# Automatically sets up Sentry self-hosted with one command
# Usage: ./scripts/setup-sentry.sh

set -e  # Exit on error

echo "🚀 Sentry Self-Hosted Setup"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose found${NC}"

# Check if Sentry is already cloned
SENTRY_DIR="../self-hosted"

if [ -d "$SENTRY_DIR" ]; then
    echo -e "${YELLOW}⚠️  Sentry directory already exists at $SENTRY_DIR${NC}"
    read -p "Do you want to remove and reinstall? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing old installation..."
        rm -rf "$SENTRY_DIR"
    else
        echo "ℹ️  Using existing installation"
        cd "$SENTRY_DIR"
    fi
fi

# Clone Sentry if needed
if [ ! -d "$SENTRY_DIR" ]; then
    echo ""
    echo "📥 Cloning Sentry self-hosted repository..."
    cd ..
    git clone https://github.com/getsentry/self-hosted.git
    cd self-hosted
    echo -e "${GREEN}✅ Sentry cloned${NC}"
else
    cd "$SENTRY_DIR"
fi

# Check for port conflicts
echo ""
echo "🔍 Checking for port conflicts..."

# Check if port 9000 is in use
if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 9000 is already in use (probably MinIO)${NC}"
    echo "We'll configure Sentry to use port 9001 instead"
    
    # Modify docker-compose.yml to use port 9001
    if [ -f "docker-compose.yml" ]; then
        sed -i.bak 's/9000:9000/9001:9000/g' docker-compose.yml
        echo -e "${GREEN}✅ Sentry configured to use port 9001${NC}"
    fi
    SENTRY_PORT=9001
else
    SENTRY_PORT=9000
fi

# Run installer
echo ""
echo "🔧 Running Sentry installer..."
echo "⚠️  You will be asked to create an admin user"
echo ""

# Check if already installed
if [ -f "sentry/sentry.conf.py" ]; then
    echo -e "${YELLOW}ℹ️  Sentry appears to be already installed${NC}"
    read -p "Skip installation? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo "⏭️  Skipping installation"
    else
        ./install.sh
    fi
else
    ./install.sh
fi

# Start Sentry
echo ""
echo "🚀 Starting Sentry services..."
docker compose up -d

# Wait for Sentry to be ready
echo ""
echo "⏳ Waiting for Sentry to be ready..."
echo "This may take 1-2 minutes..."

# Wait up to 3 minutes
COUNTER=0
MAX_WAIT=180
while [ $COUNTER -lt $MAX_WAIT ]; do
    if docker compose logs web 2>&1 | grep -q "Sentry is ready"; then
        echo -e "${GREEN}✅ Sentry is ready!${NC}"
        break
    fi
    
    if [ $((COUNTER % 10)) -eq 0 ]; then
        echo "Still waiting... ($COUNTER seconds)"
    fi
    
    sleep 1
    COUNTER=$((COUNTER + 1))
done

if [ $COUNTER -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}⚠️  Timeout waiting for Sentry. Check logs with: docker compose logs -f web${NC}"
fi

# Success message
echo ""
echo "=============================="
echo -e "${GREEN}🎉 Sentry Setup Complete!${NC}"
echo "=============================="
echo ""
echo "📍 Access Sentry at: http://localhost:$SENTRY_PORT"
echo ""
echo "📝 Next steps:"
echo "1. Open http://localhost:$SENTRY_PORT in your browser"
echo "2. Login with your admin credentials"
echo "3. Create a new project:"
echo "   - Platform: Next.js"
echo "   - Name: quado-lite"
echo "4. Copy the DSN"
echo "5. Update .env file:"
echo "   NEXT_PUBLIC_SENTRY_DSN=http://YOUR_KEY@localhost:$SENTRY_PORT/1"
echo "6. Restart your Next.js dev server"
echo ""
echo "🔍 Useful commands:"
echo "   docker compose ps              # Check status"
echo "   docker compose logs -f web     # View logs"
echo "   docker compose down            # Stop Sentry"
echo "   docker compose up -d           # Start Sentry"
echo ""
