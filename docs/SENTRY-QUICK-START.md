# Sentry Self-Hosted Quick Start

Bu guide Docker'daki Sentry'i **5 dakikada** çalıştırıp projeye bağlar.

---

## 🚀 Step-by-Step Setup

### **1. Start Sentry Docker** (5 min)

```bash
# Clone official repo
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted

# Run installer (creates admin user, generates secrets)
./install.sh

# Installer will ask:
# Email: admin@yourdomain.com
# Password: (choose secure password)
# Superuser? Y

# Start all services
docker compose up -d

# Wait for services to be ready (~1-2 minutes)
docker compose logs -f web | grep "Sentry is ready"
```

---

### **2. Create Project** (1 min)

1. **Access Sentry:**
   ```
   http://localhost:9000
   ```

2. **Login:**
   - Email: admin@yourdomain.com (from step 1)
   - Password: (your password from step 1)

3. **Create Project:**
   - Click "Create Project"
   - Platform: **JavaScript** → **Next.js**
   - Alert Settings: Default
   - Project Name: **quado-lite**
   - Team: Default
   - Click "Create Project"

---

### **3. Get DSN** (30 sec)

After project creation, you'll see:

```
Configure your SDK:

NEXT_PUBLIC_SENTRY_DSN=http://abc123def456@localhost:9000/1
                              ↑           ↑             ↑
                           Public Key   Host       Project ID
```

**Copy this DSN!** ✅

---

### **4. Update .env** (30 sec)

Open `.env` file and update:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=http://abc123def456@localhost:9000/1
# ↑ Paste your DSN here

SENTRY_ENVIRONMENT=development
SENTRY_DEBUG=true  # See Sentry logs in console
```

---

### **5. Restart Next.js** (30 sec)

```bash
# Stop dev server (Ctrl+C)

# Start again
pnpm dev

# You should see in console:
# [Sentry] SDK successfully initialized
```

---

### **6. Test Error Tracking** (1 min)

Create a test error:

```typescript
// Any component or API route
throw new Error('Test error from Quado!');
```

Or use our unified handler:

```typescript
import { handleError } from '@/lib/monitoring/error-handler';

try {
  throw new Error('Testing Sentry integration!');
} catch (error) {
  handleError(error as Error, {
    test: true,
    userId: 'test-user',
    context: 'sentry-test',
  });
}
```

Check Sentry dashboard: http://localhost:9000/issues/

You should see the error! 🎉

---

## 🎯 Verification Checklist

- [ ] Sentry running at http://localhost:9000
- [ ] Project created (quado-lite)
- [ ] DSN copied and added to .env
- [ ] Next.js restarted
- [ ] Test error appears in Sentry dashboard
- [ ] Context data visible (userId, etc.)

---

## 🔧 Troubleshooting

### **Sentry not starting:**
```bash
# Check logs
docker compose logs

# Common issue: Port 9000 already used
# Solution: Stop other services on port 9000
lsof -ti:9000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :9000   # Windows
```

### **DSN not working:**
```bash
# Check .env file
cat .env | grep SENTRY

# Restart dev server (must restart to reload .env)
pnpm dev
```

### **Errors not appearing:**
```bash
# Enable debug mode in .env
SENTRY_DEBUG=true

# Check browser console
# Should see: [Sentry] Event sent successfully
```

### **"Sentry is not installed":**
```bash
# Install SDK (we already have it!)
pnpm list @sentry/nextjs

# If not installed:
pnpm add @sentry/nextjs
```

---

## 📊 Next Steps

### **Production Setup:**

1. **Domain Setup:**
   ```nginx
   server {
       listen 80;
       server_name sentry.yourdomain.com;
       location / {
           proxy_pass http://localhost:9000;
       }
   }
   ```

2. **SSL Certificate:**
   ```bash
   sudo certbot --nginx -d sentry.yourdomain.com
   ```

3. **Update DSN:**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://KEY@sentry.yourdomain.com/1
   ```

### **Team Setup:**

1. **Invite Team:**
   - Settings → Members → Invite Member
   - Send invite links

2. **Setup Alerts:**
   - Project → Alerts → Create Alert
   - Email notifications

3. **Integrations:**
   - Settings → Integrations
   - Slack, Discord, etc.

---

## 💡 Tips

### **Performance Monitoring:**
```typescript
// Enable in sentry config
Sentry.init({
  tracesSampleRate: 1.0, // 100% in dev
  // 0.1 in production (10%)
});
```

### **User Context:**
```typescript
import { handleError } from '@/lib/monitoring/error-handler';

// Errors will automatically include context
handleError(error, {
  userId: user.id,
  userEmail: user.email,
  userRole: user.role,
});
```

### **Release Tracking:**
```bash
# Tag releases
export SENTRY_RELEASE=$(git rev-parse HEAD)

# Upload sourcemaps (production)
pnpm run build
npx @sentry/cli releases new $SENTRY_RELEASE
```

---

## 🎉 Done!

Your error tracking is now:
- ✅ Running locally
- ✅ Free & unlimited
- ✅ Privacy-focused
- ✅ Production-ready

**Total setup time: ~7 minutes**

---

## 📞 Support

- **Sentry Docs:** https://docs.sentry.io
- **Self-hosted Issues:** https://github.com/getsentry/self-hosted/issues
- **Our error handler:** `src/lib/monitoring/error-handler.ts`
- **Logging strategy:** `docs/LOGGING-STRATEGY.md`

---

**Happy Error Tracking! 🐛→🎯**
