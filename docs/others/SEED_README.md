# 🌱 Seed Data - Kurumsal Denetim Sistemi

## 📋 İçerik

Gerçekçi ve kapsamlı test verileri:

### 👥 Kullanıcılar (12 Türk Kullanıcı)

**Üretim Departmanı:**
- Mehmet Kaya (mehmet.kaya@example.com)
- Ali Arslan (ali.arslan@example.com)
- Hasan Şahin (hasan.sahin@example.com)

**Kalite Departmanı:**
- Ayşe Demir (ayse.demir@example.com)
- Fatma Öz (fatma.oz@example.com)
- Selin Aksoy (selin.aksoy@example.com)

**IT/Bilgi İşlem Departmanı:** ⭐
- Can Yılmaz (can.yilmaz@example.com)
- Deniz Öztürk (deniz.ozturk@example.com)
- Ece Kılıç (ece.kilic@example.com)
- Burak Acar (burak.acar@example.com)

**Destek Departmanları:**
- Zeynep Çelik (zeynep.celik@example.com)
- Elif Yıldız (elif.yildiz@example.com)

**Tüm kullanıcı şifresi:** `Password123!`

---

### 🔍 Denetimler (6 Adet)

1. **ISO 9001 İç Denetimi** (Üretim)
   - Kalibrasyon eksikliği
   - Eğitim kayıtları
   - Progress notes örneği ✅

2. **ISO 27001 Bilgi Güvenliği** (IT) ⭐
   - Parola politikası
   - Güvenlik yamaları
   - Log yönetimi
   - DÖF + Root Cause Analysis ✅

3. **KVKK/GDPR Uyumluluk** (IT) ⭐
   - Veri envanteri
   - Aydınlatma metinleri
   - Veri silme prosedürü

4. **Yazılım Geliştirme Süreçleri** (IT) ⭐
   - Code review
   - Test coverage
   - Git branch stratejisi

5. **ISO 14001 Çevre Denetimi**
   - Tehlikeli atık yönetimi

6. **İSG Denetimi**
   - Risk değerlendirmesi

---

### 📊 Oluşturulan Veriler

- ✅ 6 Denetim
- ✅ 13 Bulgu
- ✅ 11+ Aksiyon
- ✅ 3 Progress Note (İlerleme kayıtları)
- ✅ 1 DÖF (5 Why root cause analysis ile)
- ✅ 3 DÖF Activity (Düzeltici/Önleyici)

---

## ⚠️ Mevcut Veriler Varsa

Eğer DB'de zaten veriler varsa, **seed çalıştırmadan önce temizle:**

```bash
# Seçenek 1: Temizle ve yeniden seed (ÖNERİLEN)
pnpm seed:fresh

# Seçenek 2: Sadece temizle
pnpm seed:cleanup

# Seçenek 3: Manuel SQL
psql -d your_db
DELETE FROM action_progress;
DELETE FROM dof_activities;
DELETE FROM actions;
DELETE FROM dofs;
DELETE FROM findings;
DELETE FROM audits;
DELETE FROM "User" WHERE email NOT IN ('superadmin@example.com', 'admin@example.com');
```

**`seed:fresh`** tek komutta:
1. Tüm seed verilerini siler
2. Menüleri ekler
3. Admin'i ekler
4. Kullanıcıları ekler
5. Denetim verilerini ekler

---

## 🚀 Kurulum

### 1. Migrations

Önce DB migration'ları çalıştır:

```bash
# Action progress table
psql -d your_db -f migrations/add-action-progress.sql

# Cancelled status
psql -d your_db -f migrations/add-cancelled-status.sql

# Veya Drizzle Kit ile
pnpm drizzle-kit push
```

### 2. Seed Sırası

```bash
# 1. Menüler
pnpm seed:menus

# 2. Admin kullanıcı
pnpm seed:admin

# 3. Kullanıcılar (12 Türk kullanıcı)
pnpm seed:users

# 4. Comprehensive audit data (TÜM DENETİMLER)
pnpm seed:all
```

**Veya hepsini tek komutla:**

```bash
pnpm seed:menus && pnpm seed:admin && pnpm seed:users && pnpm seed:all
```

---

## 🔑 Giriş Bilgileri

**Admin:**
- Email: `admin@example.com`
- Şifre: `admin1234`

**Normal Kullanıcılar:**
- Email: `[isim].[soyisim]@example.com`
- Şifre: `Password123!`

Örnek: `can.yilmaz@example.com` / `Password123!`

---

## 🎯 Özellikler

### Progress Notes (İlerleme Kayıtları)
ISO 9001 audit'inde kalibrasyon aksiyonunda 3 progress note var:
- "Envanter çıkarıldı"
- "Kalibrasyon firması ile görüşüldü"
- "5 cihaz gönderildi"

### Root Cause Analysis (Kök Neden Analizi)
ISO 27001 audit'inde parola politikası DÖF'ünde:
- 5 Why analizi
- Geçici önlemler
- Düzeltici/Önleyici faaliyetler

### IT Denetimleri ⭐
- Bilgi güvenliği (Parolalar, yamalar, log)
- KVKK/GDPR compliance
- Software development (Code review, test, Git)

---

## 📂 Dosya Yapısı

```
src/server/seed/
├── index.ts                        # Master seed script
├── users.ts                        # 12 Türk kullanıcı
├── admin.ts                        # Admin (Ahmet Yılmaz)
├── comprehensive-audit-seed.ts     # Tüm denetimler (IT dahil)
├── menus.ts                        # Menü yapısı
├── tasks.ts                        # Tasks (eski)
├── audit-seed.ts                   # Audit seed (eski)
└── question-bank-seed.ts           # Soru bankası
```

---

## 🧹 Temizleme

Seed'leri temizlemek için:

```sql
-- Audit verilerini sil
TRUNCATE TABLE action_progress CASCADE;
TRUNCATE TABLE dof_activities CASCADE;
TRUNCATE TABLE actions CASCADE;
TRUNCATE TABLE dofs CASCADE;
TRUNCATE TABLE findings CASCADE;
TRUNCATE TABLE audits CASCADE;

-- Kullanıcıları sil (admin hariç)
DELETE FROM "User" WHERE email != 'admin@example.com';
```

---

## ✨ Yeni Özellikler

### 1. Action Progress Tracking
Aksiyonlara ilerleme notları eklenebilir:
- Tamamlamadan ara güncellemeler
- Timeline'da görünür
- Yönetici takip edebilir

### 2. Reject Loop (CAPA Workflow)
Aksiyon reddedilince tekrar Assigned'a döner:
- Sonsuz iterasyon mümkün
- Her red timeline'da görünür
- Quality control loop

### 3. Cancel Action (Exit Strategy)
Döngüyü kırmak için iptal butonu:
- Yönetici veya oluşturan iptal edebilir
- Cancelled status (final state)
- İptal nedeni kaydedilir

---

## 🎉 Test Senaryoları

### 1. Progress Notes
1. `can.yilmaz@example.com` ile giriş yap
2. ISO 9001 denetimindeki kalibrasyon aksiyonuna git
3. Timeline'da 3 progress note gör

### 2. Root Cause Analysis
1. ISO 27001 denetimindeki parola politikası bulgusuna git
2. DÖF'e git
3. 5 Why analizi gör
4. 3 faaliyet (activity) gör

### 3. IT Denetimleri
1. ISO 27001, KVKK, Software audits'lere bak
2. IT spesifik bulgular gör
3. Gerçekçi senaryolar incele

---

Made with ❤️ for testing purposes
