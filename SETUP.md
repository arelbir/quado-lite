# Kurulum Kılavuzu

## Ön Gereksinimler

- Node.js 18+ 
- Docker Desktop (PostgreSQL için)
- pnpm (önerilen) veya npm

## Adım 1: Docker ile PostgreSQL Başlatma

PostgreSQL veritabanını Docker container olarak başlatın:

```powershell
docker-compose up -d
```

Container durumunu kontrol edin:

```powershell
docker ps
```

Çıktıda `denetim-postgres` container'ının `healthy` durumda olduğunu görmelisiniz.

## Adım 2: Environment Variables

`.env.example` dosyasını kopyalayarak `.env.local` oluşturun:

```powershell
Copy-Item .env.example .env.local
```

`.env.local` dosyasını açın ve gerekli değerleri ayarlayın:

```env
# Database - Docker'dan gelen varsayılan değerler
DATABASE_URL="postgresql://denetim_user:denetim_pass_2024@localhost:5432/denetim_db"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-use-openssl-rand-base64-32"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Super Admin (İlk kullanıcı)
SUPER_ADMIN_EMAIL="admin@example.com"
SUPER_ADMIN_PASSWORD="Admin123!"
SUPER_ADMIN_UUID="550e8400-e29b-41d4-a716-446655440000"
```

**Önemli:** Production için `NEXTAUTH_SECRET` değerini mutlaka değiştirin:

```powershell
# PowerShell'de random secret oluşturma
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Adım 3: Bağımlılıkları Yükleme

```powershell
pnpm install
# veya
npm install
```

## Adım 4: Veritabanı Migration

Drizzle ORM ile veritabanı tablolarını oluşturun:

```powershell
pnpm db:push
# veya
npm run db:push
```

## Adım 5: Development Server Başlatma

```powershell
pnpm dev
# veya
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Adım 6: İlk Giriş

`.env.local` dosyasında belirlediğiniz Super Admin bilgileriyle giriş yapın:

- Email: `admin@example.com`
- Password: `Admin123!`

---

## Docker Komutları

### Container'ı Durdurma

```powershell
docker-compose down
```

### Container'ı Silme (Veri dahil)

```powershell
docker-compose down -v
```

### Logları Görüntüleme

```powershell
docker-compose logs -f postgres
```

### PostgreSQL CLI'ye Bağlanma

```powershell
docker exec -it denetim-postgres psql -U denetim_user -d denetim_db
```

---

## Sorun Giderme

### Port 5432 zaten kullanımda

Eğer başka bir PostgreSQL instance çalışıyorsa:

1. `docker-compose.yml` içinde portu değiştirin:
   ```yaml
   ports:
     - "5433:5432"
   ```

2. `.env.local` içinde DATABASE_URL'i güncelleyin:
   ```
   DATABASE_URL="postgresql://denetim_user:denetim_pass_2024@localhost:5433/denetim_db"
   ```

### Container başlamıyor

Docker Desktop'ın çalıştığından emin olun:

```powershell
docker --version
```

### Migration hataları

Veritabanını sıfırlayın:

```powershell
docker-compose down -v
docker-compose up -d
# Birkaç saniye bekleyin
pnpm db:push
```

---

## Production Deployment

Production ortamı için `DEPLOYMENT_ON_PREMISE.md` dosyasına bakın.
