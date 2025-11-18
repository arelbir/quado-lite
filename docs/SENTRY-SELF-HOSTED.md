# Sentry Self-Hosted Setup Guide

## 📖 Overview

Bu guide Sentry'i kendi sunucunuzda Docker ile nasıl kuracağınızı anlatır.

---

## ✅ Neden Self-Hosted?

### **Avantajlar:**
- ✅ **Tamamen ücretsiz** (sadece infrastructure cost)
- ✅ **Unlimited events** (plan limiti yok)
- ✅ **Data privacy** (veriler kendi sunucunuzda)
- ✅ **Custom integrations**
- ✅ **No vendor lock-in**

### **Dezavantajlar:**
- ⚠️ **Maintenance gerekir** (updates, backups)
- ⚠️ **Infrastructure setup**
- ⚠️ **Monitoring & scaling**
- ⚠️ **No managed support**

---

## 🎯 Önerilen Kullanım

| Senaryo | Self-Hosted | Cloud |
|---------|-------------|-------|
| **Startup / Small team** | ❌ | ✅ Recommended |
| **Data privacy critical** | ✅ Recommended | ❌ |
| **High volume (>100k events/mo)** | ✅ Cost effective | 💰 Expensive |
| **Quick setup** | ❌ | ✅ 5 minutes |
| **Zero maintenance** | ❌ | ✅ Managed |

---

## 🚀 Kurulum (Official Method)

### **Step 1: Clone Official Repo**

```bash
# Clone Sentry self-hosted repo
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted

# Checkout stable version (recommended)
git checkout latest
```

### **Step 2: Prerequisites Check**

```bash
# Check Docker version (19.03.6+ required)
docker --version

# Check Docker Compose (1.28.0+ required)
docker compose version

# Check system resources
free -h  # Minimum 8GB RAM
df -h    # Minimum 20GB disk
```

### **Step 3: Run Installer**

```bash
# Run the installation script
./install.sh

# This will:
# 1. Generate secret key
# 2. Create database
# 3. Run migrations
# 4. Create superuser
# 5. Setup initial configuration
```

**Installer prompts:**
```
Would you like to create a user account now? [Y/n]: Y
Email: admin@yourdomain.com
Password: (enter secure password)
Repeat for confirmation: (repeat password)
Should this user be a superuser? [y/N]: y
```

### **Step 4: Start Services**

```bash
# Start all Sentry services
docker compose up -d

# Check logs
docker compose logs -f web

# Wait for "Sentry is ready" message
```

### **Step 5: Access Sentry**

```
URL: http://localhost:9000
Email: admin@yourdomain.com
Password: (password you set)
```

---

## 🔧 Configuration

### **1. Environment Variables**

Edit `sentry/sentry.conf.py`:

```python
# System
SENTRY_OPTIONS['system.url-prefix'] = 'https://sentry.yourdomain.com'

# Email (for notifications)
SENTRY_OPTIONS['mail.backend'] = 'smtp'
SENTRY_OPTIONS['mail.host'] = 'smtp.gmail.com'
SENTRY_OPTIONS['mail.port'] = 587
SENTRY_OPTIONS['mail.username'] = 'your-email@gmail.com'
SENTRY_OPTIONS['mail.password'] = 'your-app-password'
SENTRY_OPTIONS['mail.use-tls'] = True
SENTRY_OPTIONS['mail.from'] = 'sentry@yourdomain.com'

# File storage
SENTRY_OPTIONS['filestore.backend'] = 'filesystem'
SENTRY_OPTIONS['filestore.options'] = {
    'location': '/var/lib/sentry/files',
}
```

### **2. Reverse Proxy (Nginx)**

```nginx
# /etc/nginx/sites-available/sentry
server {
    listen 80;
    server_name sentry.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **3. SSL Certificate (Let's Encrypt)**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d sentry.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🔗 Next.js Integration

### **1. Install SDK**

```bash
pnpm add @sentry/nextjs
```

### **2. Configure DSN**

```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=http://YOUR_KEY@sentry.yourdomain.com/1
SENTRY_AUTH_TOKEN=your-auth-token
```

### **3. Initialize (already done!)**

Our `src/lib/monitoring/error-handler.ts` already supports both cloud and self-hosted:

```typescript
// Works with both sentry.io and self-hosted!
handleError(error, { context: 'payment' });
```

---

## 📊 Services Overview

Sentry self-hosted includes multiple services:

| Service | Purpose | Port |
|---------|---------|------|
| **web** | Web UI | 9000 |
| **postgres** | Database | 5432 |
| **redis** | Cache & queues | 6379 |
| **kafka** | Event streaming | 9092 |
| **clickhouse** | Analytics DB | 9000 |
| **snuba** | Query engine | 1218 |
| **worker** | Background jobs | - |
| **cron** | Scheduled tasks | - |

Total: ~10-12 containers

---

## 🔒 Security Best Practices

### **1. Change Default Passwords**

```bash
# Generate secure secret key
openssl rand -hex 32

# Update .env file
SENTRY_SECRET_KEY=your-generated-key
```

### **2. Enable HTTPS**

```python
# sentry.conf.py
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### **3. Firewall Rules**

```bash
# Allow only necessary ports
ufw allow 80/tcp   # HTTP (redirect to HTTPS)
ufw allow 443/tcp  # HTTPS
ufw allow 22/tcp   # SSH

# Block Sentry internal ports
ufw deny 9000/tcp  # Only accessible via reverse proxy
ufw deny 5432/tcp  # Postgres
ufw deny 6379/tcp  # Redis
```

---

## 🔄 Maintenance

### **Backup**

```bash
#!/bin/bash
# backup-sentry.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/sentry"

# Backup Postgres
docker compose exec -T postgres pg_dump -U sentry sentry > "$BACKUP_DIR/db_$DATE.sql"

# Backup files
docker compose exec -T web tar czf - /var/lib/sentry/files > "$BACKUP_DIR/files_$DATE.tar.gz"

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### **Updates**

```bash
# Check for updates
cd self-hosted
git fetch
git checkout latest

# Backup first!
./backup-sentry.sh

# Update services
docker compose down
./install.sh
docker compose up -d
```

### **Monitoring**

```bash
# Check service health
docker compose ps

# View logs
docker compose logs -f web

# Resource usage
docker stats
```

---

## 💰 Cost Comparison

### **Self-Hosted (1 year):**
```
VPS (4 cores, 8GB RAM): $20/mo × 12 = $240
Storage (50GB): $5/mo × 12 = $60
Backups (100GB): $10/mo × 12 = $120
Total: ~$420/year
```

### **Sentry Cloud (1 year):**
```
Team Plan: $26/mo × 12 = $312/year (50k events/mo)
Business Plan: $80/mo × 12 = $960/year (200k events/mo)
```

**Breakeven:** ~50k events/month

---

## 🎯 Decision Matrix

### **Use Self-Hosted If:**
- ✅ High event volume (>100k/month)
- ✅ Data privacy requirements
- ✅ Have DevOps resources
- ✅ Need custom integrations
- ✅ Budget constrained but high usage

### **Use Cloud (sentry.io) If:**
- ✅ Small team / startup
- ✅ Low event volume (<50k/month)
- ✅ Want zero maintenance
- ✅ Need quick setup
- ✅ Want managed support

---

## 📞 Resources

- **Official Docs:** https://develop.sentry.dev/self-hosted/
- **GitHub Repo:** https://github.com/getsentry/self-hosted
- **System Status:** https://status.sentry.io
- **Community:** https://forum.sentry.io

---

## 🚀 Quick Start (TL;DR)

```bash
# Clone & install
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted
./install.sh

# Start
docker compose up -d

# Access
open http://localhost:9000
```

---

**Last Updated:** 2025-01-25  
**Sentry Version:** 24.x  
**Recommended for:** Production use with DevOps support
