# 🚀 Production Yayına Alma Kılavuzu

**Denetim Uygulaması - Kurumsal Denetim Yönetim Sistemi**

---

## 📋 İçindekiler

1. [Yayın Öncesi Kontrol Listesi](#yayın-öncesi-kontrol-listesi)
2. [Ortam Kurulumu](#ortam-kurulumu)
3. [Yayın Seçenekleri](#yayın-seçenekleri)
4. [Veritabanı Kurulumu](#veritabanı-kurulumu)
5. [Güvenlik Yapılandırması](#güvenlik-yapılandırması)
6. [Yayın Sonrası Adımlar](#yayın-sonrası-adımlar)
7. [İzleme & Bakım](#izleme--bakım)

---

## ✅ Yayın Öncesi Kontrol Listesi

### Kritik Öğeler

- [ ] **Veritabanı Yedekleme Planı** - PostgreSQL production veritabanı hazır
- [ ] **Ortam Değişkenleri** - Tüm production secret'ları yapılandırıldı
- [ ] **SSL Sertifikası** - Production domain için HTTPS yapılandırıldı
- [ ] **E-posta Servisi** - Resend API key yapılandırıldı
- [ ] **Dosya Yükleme** - UploadThing dosya depolama için yapılandırıldı
- [ ] **Redis Sunucusu** - BullMQ arka plan işleri için Redis
- [ ] **Admin Hesabı** - Süper admin bilgileri güvence altında
- [ ] **CRON İşleri** - Zamanlanmış görevler yapılandırıldı
- [ ] **Build Testi** - `pnpm build` başarıyla tamamlanıyor
- [ ] **Migration Testi** - Veritabanı migration'ları test edildi

### İsteğe Bağlı Öğeler

- [ ] **LDAP/AD Entegrasyonu** - Kurumsal kimlik doğrulama kullanılıyorsa
- [ ] **Özel Domain** - Domain adı yapılandırıldı
- [ ] **CDN Kurulumu** - Statik varlık optimizasyonu
- [ ] **Loglama Servisi** - Uygulama izleme (Sentry, LogRocket)
- [ ] **Analitik** - Kullanım takibi yapılandırıldı

---

## 🔧 Ortam Kurulumu

### Gerekli Ortam Değişkenleri

`.env.production` dosyası oluşturun:

```bash
# ================================
# VERİTABANI
# ================================
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# ================================
# NEXT AUTH
# ================================
# Üret: openssl rand -base64 32
NEXTAUTH_SECRET="guclu-secret-anahtar-buraya"
NEXTAUTH_URL="https://alan-adiniz.com"

# ================================
# UYGULAMA
# ================================
NEXT_PUBLIC_APP_URL="https://alan-adiniz.com"

# ================================
# E-POSTA (Resend)
# ================================
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@alan-adiniz.com"

# ================================
# SÜPER ADMİN
# ================================
SUPER_ADMIN_EMAIL="admin@sirketiniz.com"
SUPER_ADMIN_PASSWORD="GucluSifreniz123!"
SUPER_ADMIN_UUID="uuid-buraya-olustur"

# ================================
# DOSYA YÜKLEME (UploadThing)
# ================================
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxxxxxxxxx"
UPLOADTHING_APP_ID="xxxxxxxxxxxx"

# ================================
# REDIS (BullMQ)
# ================================
REDIS_HOST="redis-host.com"
REDIS_PORT=6379
REDIS_PASSWORD="redis-sifreniz"

# ================================
# HR SYNC QUEUE
# ================================
HR_SYNC_CONCURRENCY=2

# ================================
# CRON İŞLERİ
# ================================
# Üret: openssl rand -base64 32
CRON_SECRET="cron-secret-token-buraya"

# ================================
# LDAP (İsteğe Bağlı)
# ================================
# LDAP_URL="ldap://ldap-sunucunuz.com"
# LDAP_BIND_DN="cn=admin,dc=sirket,dc=com"
# LDAP_BIND_PASSWORD="ldap-sifre"
# LDAP_SEARCH_BASE="ou=users,dc=sirket,dc=com"
```

### Secret Üretme

```powershell
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -base64 32

# SUPER_ADMIN_UUID (gerekirse)
# Online UUID generator kullanın veya PowerShell:
[guid]::NewGuid().ToString()
```

---

## 🌐 Yayın Seçenekleri

### Seçenek 1: Vercel (Önerilen - En Kolay)

**Artıları:**
- ✅ Sıfır yapılandırma yayını
- ✅ Otomatik HTTPS
- ✅ Edge network (hızlı)
- ✅ Yerleşik CRON işleri
- ✅ Serverless fonksiyonlar

**Adımlar:**

1. **Vercel CLI Yükle**
   ```powershell
   pnpm install -g vercel
   ```

2. **Vercel'e Giriş Yap**
   ```powershell
   vercel login
   ```

3. **Yayınla**
   ```powershell
   vercel --prod
   ```

4. **Ortam Değişkenlerini Yapılandır** (Vercel Dashboard)
   - Proje Ayarları → Ortam Değişkenleri'ne git
   - `.env.production`'dan tüm değişkenleri ekle

5. **CRON İşlerini Yapılandır**
   - `vercel.json`'da zaten yapılandırılmış
   - Vercel Dashboard → CRON İşleri'nde doğrula

6. **PostgreSQL Kur**
   - Vercel Postgres, Neon veya Supabase kullan
   - Ortam değişkenlerinde `DATABASE_URL`'i güncelle

7. **Redis Kur**
   - Upstash Redis (serverless) kullan
   - `REDIS_*` değişkenlerini güncelle

**CRON İşleri (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/create-scheduled-audits",
      "schedule": "0 0 * * *"  // Her gün gece yarısı
    },
    {
      "path": "/api/cron/workflow-deadline-check",
      "schedule": "0 * * * *"  // Her saat
    }
  ]
}
```

---

### Seçenek 2: Docker + VPS (Kendi Hosting)

**Artıları:**
- ✅ Tam kontrol
- ✅ Büyük ölçek için maliyet etkin
- ✅ Özel altyapı

**Gereksinimler:**
- Docker yüklü VPS (2+ CPU, 4GB+ RAM)
- PostgreSQL sunucusu (ayrı veya containerize)
- Redis sunucusu (ayrı veya containerize)
- Reverse proxy için Nginx
- SSL sertifikası (Let's Encrypt)

**Adım 1: Production Dockerfile Oluştur**

`Dockerfile` oluştur (zaten mevcut):

```dockerfile
# Çok aşamalı build
FROM node:20-alpine AS builder
# ... (dosya zaten oluşturuldu)
```

**Adım 2: next.config.js Güncelle**

`next.config.js`'e ekle (zaten yapıldı):

```javascript
module.exports = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  // ... diğer yapılandırma
};
```

**Adım 3: docker-compose.production.yml Oluştur**

```yaml
version: '3.8'

services:
  # Next.js Uygulaması
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
      # ... diğer ortam değişkenleri
    depends_on:
      - postgres
      - redis
    networks:
      - denetim-network

  # PostgreSQL Veritabanı
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

  # BullMQ için Redis
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

**Adım 4: nginx.conf Oluştur**

```nginx
upstream nextjs_upstream {
  server app:3000;
}

server {
  listen 80;
  server_name alan-adiniz.com;

  # HTTP'den HTTPS'e yönlendir
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name alan-adiniz.com;

  # SSL sertifikaları
  ssl_certificate /etc/nginx/ssl/fullchain.pem;
  ssl_certificate_key /etc/nginx/ssl/privkey.pem;

  # SSL yapılandırması
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  # Güvenlik başlıkları
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  # Proxy ayarları
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

  # Statik dosya önbelleği
  location /_next/static {
    proxy_pass http://nextjs_upstream;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # Dosya yükleme boyutu
  client_max_body_size 50M;
}
```

**Adım 5: Yayınla**

```powershell
# Oluştur ve başlat
docker-compose -f docker-compose.production.yml up -d --build

# Logları kontrol et
docker-compose -f docker-compose.production.yml logs -f app

# Migration'ları çalıştır
docker-compose -f docker-compose.production.yml exec app pnpm db:migrate

# İlk verileri yükle
docker-compose -f docker-compose.production.yml exec app pnpm seed:master
```

---

### Seçenek 3: Railway / Render

**Railway:**

1. Railway CLI Yükle
   ```powershell
   npm install -g @railway/cli
   ```

2. Giriş yap ve yayınla
   ```powershell
   railway login
   railway init
   railway up
   ```

3. Railway dashboard'da PostgreSQL ve Redis eklentilerini ekle

4. Railway dashboard'da ortam değişkenlerini yapılandır

**Render:**

1. GitHub deposunu Render'a bağla

2. Web Servisi Oluştur:
   - Build Komutu: `pnpm install && pnpm build`
   - Start Komutu: `pnpm start`

3. PostgreSQL ve Redis servislerini ekle

4. Ortam değişkenlerini yapılandır

---

## 🗄️ Veritabanı Kurulumu

### Adım 1: Production Veritabanı Oluştur

**Seçenek A: Yönetilen PostgreSQL (Önerilen)**
- Vercel Postgres
- Neon (serverless)
- Supabase
- AWS RDS
- Google Cloud SQL

**Seçenek B: Kendi Hosting**
```powershell
# Docker kullanarak
docker run -d \
  --name denetim-postgres \
  -e POSTGRES_USER=denetim_user \
  -e POSTGRES_PASSWORD=guclu_sifre \
  -e POSTGRES_DB=denetim_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Adım 2: Migration'ları Çalıştır

```powershell
# Production veritabanı URL'ini ayarla
$env:DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Migration'ları üret (gerekirse)
pnpm db:generate

# Migration'ları çalıştır
pnpm db:migrate

# Doğrula
pnpm db:studio
```

### Adım 3: İlk Verileri Yükle

```powershell
# Admin kullanıcı + roller + yetkiler + menüler
pnpm seed:master

# İsteğe bağlı: Test organizasyon verisi ekle
pnpm seed:organization

# İsteğe bağlı: Örnek iş akışları ekle
pnpm seed:workflows
```

### Adım 4: Yedekleme Stratejisi

**Otomatik Yedeklemeler:**

```bash
# Günlük yedekleme scripti (Linux/Mac)
#!/bin/bash
BACKUP_DIR="/backups/denetim"
DATE=$(date +%Y%m%d_%H%M%S)
DB_URL="postgresql://user:pass@host:5432/db"

pg_dump $DB_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Son 7 günü tut
find $BACKUP_DIR -type f -mtime +7 -delete
```

**PowerShell (Windows):**

```powershell
# backup.ps1
$BackupDir = "C:\backups\denetim"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$DbUrl = $env:DATABASE_URL

pg_dump $DbUrl | gzip > "$BackupDir\backup_$Date.sql.gz"

# Son 7 günü tut
Get-ChildItem $BackupDir -Filter "*.sql.gz" | 
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
  Remove-Item
```

**CRON Kurulumu (Linux):**

```bash
# crontab -e
0 2 * * * /path/to/backup.sh
```

---

## 🔒 Güvenlik Yapılandırması

### 1. Ortam Değişkenleri Güvenliği

**YAPMAYIN:**
- ❌ `.env` dosyalarını Git'e commit etme
- ❌ Kodda secret'ları hardcode etme
- ❌ Varsayılan şifreler kullanma
- ❌ API key'lerini client-side kodda açığa çıkarma

**YAPIN:**
- ✅ Güçlü, benzersiz secret'lar kullanın
- ✅ Secret'ları düzenli olarak yenileyin
- ✅ Ortam özel yapılandırmalar kullanın
- ✅ Hassas verileri rest'te şifreleyin

### 2. HTTPS/SSL Yapılandırması

**Let's Encrypt (Ücretsiz SSL):**

```bash
# Certbot yükle
sudo apt-get install certbot python3-certbot-nginx

# Sertifika al
sudo certbot --nginx -d alan-adiniz.com

# Otomatik yenileme
sudo certbot renew --dry-run
```

### 3. Rate Limiting

`middleware.ts`'e ekle:

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
    return new NextResponse("Çok Fazla İstek", { status: 429 });
  }

  // ... middleware'in geri kalanı
}
```

### 4. Güvenlik Başlıkları

`next.config.js`'de zaten yapılandırıldı. Doğrula:

```javascript
headers: {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
}
```

---

## 📊 Yayın Sonrası Adımlar

### 1. Yayını Doğrula

**Sağlık Kontrolü:**

```powershell
# Uygulama çalışıyor mu test et
curl https://alan-adiniz.com

# API endpoint'i test et
curl https://alan-adiniz.com/api/health

# Kimlik doğrulamayı test et
curl https://alan-adiniz.com/api/auth/providers
```

### 2. Admin Hesabı Oluştur

```powershell
# Seçenek A: Seed scripti kullan
pnpm seed:admin

# Seçenek B: Veritabanında manuel
# Drizzle Studio kullan
pnpm db:studio
```

### 3. İş Akışlarını Yapılandır

1. Admin olarak giriş yap
2. İş Akışı Oluşturucuya git (`/admin/workflows`)
3. İş akışları oluştur:
   - Aksiyon Hızlı Akış
   - Aksiyon Karmaşık Akış
   - DÖF Standart CAPA Akışı
   - Denetim Normal Akış
   - Denetim Kritik Akış

### 4. Kritik Yolları Test Et

- [ ] Kullanıcı giriş/çıkış
- [ ] Denetim oluştur
- [ ] Bulgu oluştur
- [ ] Aksiyon oluştur
- [ ] Yönetici onay akışı
- [ ] Red döngüsü (CAPA uyumluluğu)
- [ ] DÖF 8 adımlı süreç
- [ ] Dosya yükleme
- [ ] E-posta bildirimleri
- [ ] CRON işlerinin çalışması

---

## 📈 İzleme & Bakım

### Günlük Görevler

- [ ] Hata loglarını kontrol et
- [ ] Sistem sağlığını izle
- [ ] Kullanıcı geri bildirimlerini incele

### Haftalık Görevler

- [ ] Veritabanı yedekleme doğrulaması
- [ ] Performans incelemesi
- [ ] Güvenlik taraması

### Aylık Görevler

- [ ] Bağımlılık güncellemeleri
- [ ] Güvenlik yamaları
- [ ] Kapasite planlaması
- [ ] Kullanıcı analitikleri incelemesi

---

## 🆘 Sorun Giderme

### Sorun: Build Başarısız

```powershell
# Önbelleği temizle
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm build
```

### Sorun: Veritabanı Bağlantısı Başarısız

```powershell
# Bağlantıyı test et
psql $DATABASE_URL -c "SELECT 1"

# SSL modunu kontrol et
# DATABASE_URL'e ?sslmode=require ekle
```

### Sorun: CRON İşleri Çalışmıyor

**Vercel:**
- CRON dashboard'unu kontrol et
- `vercel.json` yapılandırmasını doğrula
- Function loglarını kontrol et

**Kendi Hosting:**
- Sistem CRON'unu kontrol et: `crontab -l`
- Container loglarını kontrol et: `docker logs denetim-app`
- CRON_SECRET kimlik doğrulamasını doğrula

---

**Durum:** ✅ Production İçin Hazır

**Sonraki Adımlar:**
1. Kontrol listesini tamamla
2. Kapsamlı test yap
3. Kullanıcıları eğit
4. İlk 48 saat yakından izle
5. Geri bildirim topla
