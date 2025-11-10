# 🚀 Production Deployment Guide

**Denetim Uygulaması - Enterprise Audit Management System**

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Database Setup](#database-setup)
5. [Security Configuration](#security-configuration)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Pre-Deployment Checklist

### Critical Items

- [ ] **Database Backup Plan** - PostgreSQL production database ready
- [ ] **Environment Variables** - All production secrets configured
- [ ] **SSL Certificate** - HTTPS configured for production domain
- [ ] **Email Service** - Resend API key configured
- [ ] **File Upload** - UploadThing configured for file storage
- [ ] **Redis Server** - Redis for BullMQ background jobs
- [ ] **Admin Account** - Super admin credentials secured
- [ ] **CRON Jobs** - Scheduled tasks configured
- [ ] **Build Test** - `pnpm build` completes successfully
- [ ] **Migration Test** - Database migrations tested

### Optional Items

- [ ] **LDAP/AD Integration** - If using enterprise authentication
- [ ] **Custom Domain** - Domain name configured
- [ ] **CDN Setup** - Static assets optimization
- [ ] **Logging Service** - Application monitoring (Sentry, LogRocket)
- [ ] **Analytics** - Usage tracking configured

---

## 🔧 Environment Setup

### Required Environment Variables

Create `.env.production` file:

```bash
# ================================
# DATABASE
# ================================
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# ================================
# NEXT AUTH
# ================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-strong-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# ================================
# APPLICATION
# ================================
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# ================================
# EMAIL (Resend)
# ================================
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@your-domain.com"

# ================================
# SUPER ADMIN
# ================================
SUPER_ADMIN_EMAIL="admin@your-company.com"
SUPER_ADMIN_PASSWORD="YourSecurePassword123!"
SUPER_ADMIN_UUID="generate-uuid-here"

# ================================
# FILE UPLOAD (UploadThing)
# ================================
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxxxxxxxxx"
UPLOADTHING_APP_ID="xxxxxxxxxxxx"

# ================================
# REDIS (BullMQ)
# ================================
REDIS_HOST="your-redis-host.com"
REDIS_PORT=6379
REDIS_PASSWORD="your-redis-password"

# ================================
# HR SYNC QUEUE
# ================================
HR_SYNC_CONCURRENCY=2

# ================================
# CRON JOBS
# ================================
# Generate with: openssl rand -base64 32
CRON_SECRET="your-cron-secret-token-here"

# ================================
# LDAP (Optional)
# ================================
# LDAP_URL="ldap://your-ldap-server.com"
# LDAP_BIND_DN="cn=admin,dc=company,dc=com"
# LDAP_BIND_PASSWORD="ldap-password"
# LDAP_SEARCH_BASE="ou=users,dc=company,dc=com"
```

### Generate Secrets

```powershell
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -base64 32

# SUPER_ADMIN_UUID (if needed)
# Use online UUID generator or PowerShell:
[guid]::NewGuid().ToString()
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Pros:**
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Edge network (fast)
- ✅ Built-in CRON jobs
- ✅ Serverless functions

**Steps:**

1. **Install Vercel CLI**
   ```powershell
   pnpm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy**
   ```powershell
   vercel --prod
   ```

4. **Configure Environment Variables** (Vercel Dashboard)
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`

5. **Configure CRON Jobs**
   - Already configured in `vercel.json`
   - Verify in Vercel Dashboard → CRON Jobs

6. **Setup PostgreSQL**
   - Use Vercel Postgres, Neon, or Supabase
   - Update `DATABASE_URL` in environment variables

7. **Setup Redis**
   - Use Upstash Redis (serverless)
   - Update `REDIS_*` variables

**CRON Jobs (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/create-scheduled-audits",
      "schedule": "0 0 * * *"  // Daily at midnight
    },
    {
      "path": "/api/cron/workflow-deadline-check",
      "schedule": "0 * * * *"  // Every hour
    }
  ]
}
```

---

### Option 2: Docker + VPS (Self-Hosted)

**Pros:**
- ✅ Full control
- ✅ Cost-effective for large scale
- ✅ Custom infrastructure

**Prerequisites:**
- VPS with Docker installed (2+ CPU, 4GB+ RAM)
- PostgreSQL server (separate or containerized)
- Redis server (separate or containerized)
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

**Step 1: Create Production Dockerfile**

Create `Dockerfile`:

```dockerfile
# ================================
# BUILD STAGE
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ================================
# PRODUCTION STAGE
# ================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Step 2: Update next.config.js**

Add to `next.config.js`:

```javascript
module.exports = {
  output: 'standalone', // Enable for Docker
  // ... rest of config
};
```

**Step 3: Create docker-compose.production.yml**

```yaml
version: '3.8'

services:
  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: denetim-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - EMAIL_FROM=${EMAIL_FROM}
      - SUPER_ADMIN_EMAIL=${SUPER_ADMIN_EMAIL}
      - SUPER_ADMIN_PASSWORD=${SUPER_ADMIN_PASSWORD}
      - UPLOADTHING_SECRET=${UPLOADTHING_SECRET}
      - UPLOADTHING_APP_ID=${UPLOADTHING_APP_ID}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - HR_SYNC_CONCURRENCY=${HR_SYNC_CONCURRENCY}
      - CRON_SECRET=${CRON_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - denetim-network

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: denetim-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - denetim-network

  # Redis for BullMQ
  redis:
    image: redis:7-alpine
    container_name: denetim-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - denetim-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: denetim-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - denetim-network

volumes:
  postgres_data:
  redis_data:

networks:
  denetim-network:
    driver: bridge
```

**Step 4: Create nginx.conf**

```nginx
upstream nextjs_upstream {
  server app:3000;
}

server {
  listen 80;
  server_name your-domain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com;

  # SSL certificates
  ssl_certificate /etc/nginx/ssl/fullchain.pem;
  ssl_certificate_key /etc/nginx/ssl/privkey.pem;

  # SSL configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  # Proxy settings
  location / {
    proxy_pass http://nextjs_upstream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Static files cache
  location /_next/static {
    proxy_pass http://nextjs_upstream;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # Client body size (for file uploads)
  client_max_body_size 50M;
}
```

**Step 5: Deploy**

```powershell
# Build and start
docker-compose -f docker-compose.production.yml up -d --build

# Check logs
docker-compose -f docker-compose.production.yml logs -f app

# Run migrations
docker-compose -f docker-compose.production.yml exec app pnpm db:migrate

# Seed initial data
docker-compose -f docker-compose.production.yml exec app pnpm seed:master
```

---

### Option 3: Railway / Render

**Railway:**

1. Install Railway CLI
   ```powershell
   npm install -g @railway/cli
   ```

2. Login and deploy
   ```powershell
   railway login
   railway init
   railway up
   ```

3. Add PostgreSQL and Redis plugins in Railway dashboard

4. Configure environment variables in Railway dashboard

**Render:**

1. Connect GitHub repository to Render

2. Create Web Service:
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

3. Add PostgreSQL and Redis services

4. Configure environment variables

---

## 🗄️ Database Setup

### Step 1: Create Production Database

**Option A: Managed PostgreSQL (Recommended)**
- Vercel Postgres
- Neon (serverless)
- Supabase
- AWS RDS
- Google Cloud SQL

**Option B: Self-Hosted**
```powershell
# Using Docker
docker run -d \
  --name denetim-postgres \
  -e POSTGRES_USER=denetim_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=denetim_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Step 2: Run Migrations

```powershell
# Set production database URL
$env:DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Generate migrations (if needed)
pnpm db:generate

# Run migrations
pnpm db:migrate

# Verify
pnpm db:studio
```

### Step 3: Seed Initial Data

```powershell
# Admin user + roles + permissions + menus
pnpm seed:master

# Optional: Add test organization data
pnpm seed:organization

# Optional: Add sample workflows
pnpm seed:workflows
```

### Step 4: Backup Strategy

**Automated Backups:**

```bash
# Daily backup script (Linux/Mac)
#!/bin/bash
BACKUP_DIR="/backups/denetim"
DATE=$(date +%Y%m%d_%H%M%S)
DB_URL="postgresql://user:pass@host:5432/db"

pg_dump $DB_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

**PowerShell (Windows):**

```powershell
# backup.ps1
$BackupDir = "C:\backups\denetim"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$DbUrl = $env:DATABASE_URL

pg_dump $DbUrl | gzip > "$BackupDir\backup_$Date.sql.gz"

# Keep last 7 days
Get-ChildItem $BackupDir -Filter "*.sql.gz" | 
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
  Remove-Item
```

**Setup CRON (Linux):**

```bash
# crontab -e
0 2 * * * /path/to/backup.sh
```

---

## 🔒 Security Configuration

### 1. Environment Variables Security

**DO NOT:**
- ❌ Commit `.env` files to Git
- ❌ Hardcode secrets in code
- ❌ Use default passwords
- ❌ Expose API keys in client-side code

**DO:**
- ✅ Use strong, unique secrets
- ✅ Rotate secrets regularly
- ✅ Use environment-specific configs
- ✅ Encrypt sensitive data at rest

### 2. HTTPS/SSL Configuration

**Let's Encrypt (Free SSL):**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Rate Limiting

Add to `middleware.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // ... rest of middleware
}
```

### 4. CORS Configuration

Update `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://your-domain.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE" },
        ],
      },
    ];
  },
};
```

### 5. Security Headers

Already configured in `next.config.js`. Verify:

```javascript
headers: {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
}
```

### 6. CRON Job Authentication

Protect CRON endpoints in `/api/cron/*`:

```typescript
// Check CRON_SECRET
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new NextResponse('Unauthorized', { status: 401 });
}
```

For Vercel CRON, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/create-scheduled-audits",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Vercel automatically authenticates CRON requests.

---

## 📊 Post-Deployment Steps

### 1. Verify Deployment

**Health Check:**

```powershell
# Test application is running
curl https://your-domain.com

# Test API endpoint
curl https://your-domain.com/api/health

# Test authentication
curl https://your-domain.com/api/auth/providers
```

### 2. Create Admin Account

```powershell
# Option A: Using seed script
pnpm seed:admin

# Option B: Manually in database
# Use Drizzle Studio
pnpm db:studio
```

### 3. Configure Workflows

1. Login as admin
2. Navigate to Workflow Builder (`/admin/workflows`)
3. Create workflows:
   - Action Quick Flow
   - Action Complex Flow
   - DOF Standard CAPA Flow
   - Audit Normal Flow
   - Audit Critical Flow

### 4. Test Critical Paths

- [ ] User login/logout
- [ ] Create audit
- [ ] Create finding
- [ ] Create action
- [ ] Manager approval flow
- [ ] Reject loop (CAPA compliance)
- [ ] DOF 8-step process
- [ ] File upload
- [ ] Email notifications
- [ ] CRON jobs execution

### 5. Setup Monitoring

**Application Monitoring:**

```typescript
// Sentry Integration (optional)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Uptime Monitoring:**
- UptimeRobot (free)
- Better Uptime
- Pingdom

**Log Aggregation:**
- Vercel Logs (built-in)
- Datadog
- LogRocket

### 6. Performance Optimization

**Enable Next.js Optimizations:**

```javascript
// next.config.js
module.exports = {
  // Image optimization
  images: {
    domains: ['uploadthing.com', 'your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // SWC minification
  swcMinify: true,

  // Standalone output for Docker
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
};
```

**Database Connection Pooling:**

```typescript
// Already configured in db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 📈 Monitoring & Maintenance

### Daily Tasks

- [ ] Check error logs
- [ ] Monitor system health
- [ ] Review user feedback

### Weekly Tasks

- [ ] Database backup verification
- [ ] Performance review
- [ ] Security scan

### Monthly Tasks

- [ ] Dependency updates
- [ ] Security patches
- [ ] Capacity planning
- [ ] User analytics review

### Monitoring Metrics

**Application Metrics:**
- Response time (target: < 500ms)
- Error rate (target: < 0.1%)
- Uptime (target: 99.9%)
- Database query time

**Business Metrics:**
- Active users
- Audits completed
- Actions/DOFs created
- Average completion time

### Backup Verification

```powershell
# Test restore process monthly
$BackupFile = "backup_20250107.sql.gz"

# Restore to test database
gunzip -c $BackupFile | psql $TEST_DATABASE_URL

# Verify data integrity
pnpm db:studio
```

---

## 🆘 Troubleshooting

### Issue: Build Fails

```powershell
# Clear cache
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

### Issue: Database Connection Failed

```powershell
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check SSL mode
# Add ?sslmode=require to DATABASE_URL
```

### Issue: CRON Jobs Not Running

**Vercel:**
- Check CRON dashboard
- Verify `vercel.json` configuration
- Check function logs

**Self-Hosted:**
- Check system CRON: `crontab -l`
- Check container logs: `docker logs denetim-app`
- Verify CRON_SECRET authentication

### Issue: Redis Connection Failed

```powershell
# Test Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping

# Should return: PONG
```

### Issue: File Upload Failed

- Verify UploadThing API key
- Check file size limits (nginx/next.js)
- Check storage quota

---

## 📞 Support

**Documentation:** `/docs` folder
**System Status:** Check deployment logs
**Contact:** admin@your-company.com

---

## ✅ Deployment Checklist Summary

- [ ] Environment variables configured
- [ ] Database setup and migrated
- [ ] Redis server running
- [ ] SSL certificate installed
- [ ] Admin account created
- [ ] Workflows configured
- [ ] CRON jobs running
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Critical paths tested
- [ ] DNS configured
- [ ] Email service tested
- [ ] File upload tested
- [ ] Documentation reviewed

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Production URL:** ___________

---

**Status:** ✅ Ready for Production

**Next Steps:**
1. Complete checklist
2. Test thoroughly
3. Train users
4. Monitor closely for first 48 hours
5. Gather feedback
