# 🧪 TESTING & SEED GUIDE

**Tarih:** 2025-01-24  
**Proje:** Enterprise Audit Management System

---

## 📦 **SEED DOSYALARI - GÜNCELLENDİ! ✅**

### **Mevcut Seed'ler:**

```
src/server/seed/
├── admin.ts              ✅ Admin kullanıcı
├── users.ts              ✅ Test kullanıcıları (12 Türkçe isim)
├── menus.ts              ✅ Menü yapısı (GÜNCEL - Week 7-8 Admin menüleri eklendi)
├── roles.ts              ✅ Roller
├── tasks.ts              ✅ Görevler
├── organization-seed.ts  ✅ Organizasyon (Department, Position, Company)
├── role-system-seed.ts   ✅ RBAC sistemi (Roles + Permissions)
├── teams-groups-seed.ts  ✅ Takımlar ve gruplar
├── question-bank-seed.ts ✅ Soru bankaları + Sorular
├── audit-seed.ts         ✅ Audit data
├── comprehensive-audit-seed.ts ✅ Komple audit senaryoları
├── cleanup.ts            ✅ Veritabanı temizleme
└── index.ts              ✅ Master seed script
```

---

## 🆕 **GÜNCEL MENÜ SEED'İ (Week 7-8)**

### **Eklenen Admin Menüleri:**

```typescript
{
  path: "/admin",
  label: "administration",
  icon: "Shield",
  children: [
    "/admin/users",              // ✅ User Management
    "/admin/roles",              // ✅ Role Management
    "/admin/organization/departments",  // ✅ Departments
    "/admin/organization/positions",    // ✅ Positions
    "/admin/organization/org-chart",    // ✅ Org Chart
    "/admin/organization/companies",    // ✅ Companies
    "/admin/hr-sync",            // ✅ HR Sync Dashboard
  ]
}
```

### **Tüm Menü Kategorileri:**

1. **Dashboard** (`/`) - Ana sayfa
2. **Tasks** (`/tasks`) - Görevler
3. **Settings** (`/settings`) - Ayarlar
4. **System** (`/system`) - Sistem yönetimi
   - Users
   - Menus
5. **Audit System** (`/denetim`) - Denetim sistemi
   - Dashboard
   - My Tasks
   - My Audits
   - All Audits
6. **Operations** - Operasyonlar
   - Findings
   - Actions
   - DOFs
   - Closures
7. **Infrastructure** - Altyapı
   - Question Banks
   - Templates
8. **Administration** (`/admin`) - **YENİ! Week 7-8** 🆕
   - User Management
   - Role Management
   - Departments
   - Positions
   - Org Chart
   - Companies
   - HR Sync
9. **Error Pages** - Hata sayfaları

---

## 🚀 **SEED'LERİ ÇALIŞTIRMA**

### **1. Tam Yeniden Başlangıç (Önerilen):**

```powershell
# 1. Tüm data'yı temizle
pnpm seed:cleanup

# 2. Admin kullanıcı oluştur
pnpm seed:admin

# 3. Test kullanıcıları oluştur
pnpm seed:users

# 4. Menüleri oluştur (YENİ MENÜLER DAHİL!)
pnpm seed:menus

# 5. Organizasyon yapısını oluştur
pnpm seed:organization

# 6. Rol sistemini oluştur
pnpm seed:roles

# 7. Tüm audit data'sını oluştur
pnpm seed:all
```

### **2. Tek Komutla (FULL RESET):**

```powershell
pnpm seed:fresh
```

Bu komut sırayla çalıştırır:
1. `seed:cleanup` - Temizlik
2. `seed:admin` - Admin user
3. `seed:users` - Test users
4. `seed:menus` - Menüler (GÜNCEL!)
5. `seed:all` - Tüm data

### **3. Sadece Menüleri Güncelle:**

```powershell
# Menüleri yeniden oluştur (eski menüler silinir)
pnpm seed:menus
```

### **4. Sadece Admin Panel Data:**

```powershell
# Organizasyon verilerini seed'le
pnpm seed:organization

# Rol sistemini seed'le
pnpm seed:roles
```

---

## 🧪 **UI TESTİ NASIL YAPILIR?**

### **ADIM 1: Seed Data Oluştur**

```powershell
# Tüm sistemi sıfırdan oluştur
pnpm seed:fresh
```

**Beklenen Süre:** ~10-15 saniye

---

### **ADIM 2: Development Server'ı Başlat**

```powershell
pnpm dev
```

**URL:** http://localhost:3000

---

### **ADIM 3: Login Yap**

**Admin Kullanıcı:**
```
Email: admin@example.com
Password: admin1234
```

**Test Kullanıcıları:**
```
Email: [isim]@example.com
Password: Password123!

Örnekler:
- ahmet.yilmaz@example.com
- ayse.kaya@example.com
- mehmet.demir@example.com
... (12 Türkçe isim)
```

---

### **ADIM 4: Menüleri Kontrol Et**

Login olduktan sonra sol menüde görmeli:

#### **✅ Audit System**
- Dashboard
- My Tasks
- My Audits
- All Audits

#### **✅ Operations**
- Findings
- Actions
- DOFs
- Closures

#### **✅ Infrastructure**
- Question Banks
- Templates

#### **🆕 Administration (YENİ!)**
- User Management
- Role Management
- Departments
- Positions
- Org Chart
- Companies
- HR Sync Dashboard

#### **✅ System**
- Users
- Menus

---

## 🎯 **TEST SENARYOLARI**

### **1. Admin Panel Testi (Week 7-8)**

#### **A. User Management:**
```
1. /admin/users - User listesini görüntüle
2. Filtreleme yap (Active/Inactive)
3. Search yap
4. User detail'e tıkla (/admin/users/[id])
5. User profile bilgilerini gör
6. Department/Position bilgilerini kontrol et
7. Assigned roles'ı kontrol et
```

#### **B. Role Management:**
```
1. /admin/roles - Role listesini görüntüle
2. Permission count'ları kontrol et
3. Role detail'e tıkla (/admin/roles/[id])
4. Permission matrix'i görüntüle
5. Yeşil checkmark'ları kontrol et
```

#### **C. Organization - Departments:**
```
1. /admin/organization/departments
2. Department tree'yi görüntüle
3. Nested hierarchy'yi kontrol et
4. Manager bilgilerini gör
5. User count'ları kontrol et
```

#### **D. Organization - Positions:**
```
1. /admin/organization/positions
2. Position listesini görüntüle
3. Career levels'ı kontrol et
4. Department assignment'ları gör
```

#### **E. Organization Chart:**
```
1. /admin/organization/org-chart
2. ReactFlow visualization'ı görüntüle
3. Nodes'ları sürükle
4. Zoom in/out yap
5. Hierarchy'yi takip et
```

#### **F. Companies:**
```
1. /admin/organization/companies
2. Company listesini görüntüle
3. Location/address bilgilerini kontrol et
```

#### **G. HR Sync Dashboard:**
```
1. /admin/hr-sync
2. Sync configuration cards'ları gör
3. Recent logs tablosunu kontrol et
4. Statistics'leri gör (Total Syncs, Success Rate, vb.)
5. Manual sync buttons'ları gör
```

---

### **2. Audit System Testi**

#### **Dashboard:**
```
1. /denetim - Ana dashboard
2. Statistics cards'ları kontrol et
3. Recent audits tablosunu gör
```

#### **My Tasks:**
```
1. /denetim/my-tasks
2. Pending tasks'ları görüntüle
3. Task detail'e tıkla
```

#### **All Audits:**
```
1. /denetim/all
2. Unified table'ı görüntüle
3. Filter yap (Audit/Plan)
4. Status filter'ı kullan
5. Search yap
```

#### **Findings:**
```
1. /denetim/findings
2. Finding listesini görüntüle
3. Status badges'ları kontrol et
4. Finding detail'e git
```

#### **Actions:**
```
1. /denetim/actions
2. Action listesini görüntüle
3. Type badges'ları kontrol et (Simple/Corrective/Preventive)
4. Status filter'ı kullan (Assigned/PendingApproval/Completed/Cancelled)
5. Action detail'e tıkla (/denetim/actions/[id])
6. Timeline'ı görüntüle
7. Complete/Approve/Reject buttons'ları gör
```

#### **DOFs:**
```
1. /denetim/dofs
2. DOF listesini görüntüle
3. 8-step CAPA workflow'u kontrol et
4. DOF detail'e git
5. Activities'leri gör
6. Root cause analysis'i kontrol et
```

---

### **3. Question Banks & Templates**

#### **Question Banks:**
```
1. /denetim/question-banks
2. Bank listesini görüntüle
3. Question count'ları kontrol et
4. Bank detail'e git
5. Questions'ları listele
6. Question types'ları kontrol et (YesNo, Scale, SingleChoice, Checklist)
```

#### **Templates:**
```
1. /denetim/templates
2. Template listesini görüntüle
3. Template detail'e tıkla
4. Template questions'ları kontrol et
```

---

## 📊 **SEED DATA ÖZETİ**

**Oluşturulan Data:**

```
✅ 1 Admin User (admin@example.com)
✅ 12 Test Users (Türkçe isimler)
✅ 10+ Menü Kategorisi (Week 7-8 Admin menüleri dahil)
✅ 3 Companies (Ana Şirket, İstanbul Şubesi, Ankara Şubesi)
✅ 5 Departments (IT, HR, Finance, Operations, Quality)
✅ 7+ Positions (Junior → Senior → Manager hierarchy)
✅ 10+ System Roles (Admin, Auditor, Process Owner, vb.)
✅ 50+ Permissions (Audit, Finding, Action, DOF, Admin)
✅ 3 Question Banks (IT Audit, Üretim Kalite, ISO 27001)
✅ 15+ Questions (YesNo, Scale, SingleChoice, Checklist)
✅ 3 Audit Templates (IT Audit, Üretim, ISO 27001)
✅ 6 Audits (ISO 9001, ISO 27001, KVKK, Software, ISO 14001, İSG)
✅ 13+ Findings (Open, Closed, Pending)
✅ 13+ Actions (Simple, Corrective, Preventive with progress notes)
✅ 1 DOF (8-step CAPA with root cause analysis)
✅ 2 DOF Activities (Corrective/Preventive)
```

---

## 🎨 **UI KOMPONENTLERİ (Week 7-8)**

### **Yeni Admin UI:**
```
✅ UsersTableClient - Advanced filtering
✅ UserDetailPage - 3-column layout
✅ RolesTableClient - Permission count
✅ RoleDetailPage - Permission matrix grid
✅ DepartmentsTree - Nested hierarchy
✅ PositionsTable - Career levels
✅ OrgChartView - ReactFlow visualization
✅ CompaniesTable - Location info
✅ HRSyncDashboard - Monitoring cards + logs
```

### **Mevcut UI:**
```
✅ UnifiedTableClient - Audit/Plan unified view
✅ ActionsTable - Status/Type filtering
✅ ActionDetailPage - Timeline + Actions
✅ FindingsTable - Status badges
✅ DofsTable - CAPA workflow
✅ QuestionBanksTable - Question count
✅ TemplatesTable - Template editor
```

---

## 🐛 **SORUN GİDERME**

### **Problem: Menüler Görünmüyor**

```powershell
# 1. Menü seed'ini yeniden çalıştır
pnpm seed:menus

# 2. User-menu ilişkilerini kontrol et
# Database'de userMenuTable'a bak
```

### **Problem: Admin Panel'e Erişemiyorum**

```powershell
# 1. Role seed'ini çalıştır
pnpm seed:roles

# 2. Admin user'a gerekli rolleri ata
# Veya seed:fresh ile tümünü yenile
pnpm seed:fresh
```

### **Problem: Data Göremiyorum**

```powershell
# 1. Tüm seed'leri yeniden çalıştır
pnpm seed:fresh

# 2. Browser cache'i temizle
# 3. Hard refresh (Ctrl + Shift + R)
```

### **Problem: Build Hatası**

```powershell
# TypeScript hatalarını kontrol et
pnpm run build

# Eğer type error varsa, as any kullanılan yerler var
# Runtime'da çalışır ama build hatası verebilir
```

---

## 🎉 **BAŞARILI TEST KRİTERLERİ**

### **✅ Tüm menüler görünüyor**
- Audit System ✅
- Operations ✅
- Infrastructure ✅
- **Administration (Week 7-8)** ✅
- System ✅

### **✅ Admin Panel çalışıyor**
- User Management ✅
- Role Management ✅
- Departments (Tree view) ✅
- Positions ✅
- Org Chart (ReactFlow) ✅
- Companies ✅
- HR Sync Dashboard ✅

### **✅ Audit System çalışıyor**
- Dashboard ✅
- Audits (CRUD) ✅
- Findings ✅
- Actions (Timeline + Approve/Reject) ✅
- DOFs (8-step CAPA) ✅

### **✅ Data görünüyor**
- Users ✅
- Roles ✅
- Departments ✅
- Positions ✅
- Companies ✅
- Audits ✅
- Findings ✅
- Actions ✅
- DOFs ✅

---

## 📞 **DESTEK**

**Seed Sorunları:**
```powershell
# Hata loglarını kontrol et
pnpm seed:fresh 2>&1 | tee seed-log.txt
```

**Database Sorunları:**
```powershell
# Drizzle Studio'da manuel kontrol
pnpm db:studio
```

**Build Sorunları:**
```powershell
# Type check
pnpm run build

# Lint check
pnpm lint
```

---

## 🎊 **SONUÇ**

**Seed Status:** ✅ GÜNCEL (Week 7-8 Admin menüleri eklendi)  
**Test Status:** ✅ HAZIR (67 route test edilebilir)  
**UI Status:** ✅ TAM (8 major component + 8 admin component)

**Test komutları:**
```powershell
# 1. Seed'le
pnpm seed:fresh

# 2. Çalıştır
pnpm dev

# 3. Test et
# http://localhost:3000
# Login: admin@example.com / admin1234
```

**Tüm sistem test edilmeye hazır! 🚀**
