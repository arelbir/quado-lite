# 🌱 SEED SYSTEM - TEMİZ VE MODÜLER

## 📦 FİNAL YAPI (Modüler & DRY & Schema Uyumlu)

```
seed/
├── 00-master.ts              # ✅ Master orchestrator (RUN THIS!)
├── 00-admin.ts               # ✅ Admin user (first user)
├── 01-organization.ts        # ✅ Companies, Branches, Depts, Positions
├── 02-users.ts               # ✅ 150 users - Smart generator
├── 03-roles.ts               # ✅ Roles & permissions system
├── 04-menus.ts               # ✅ Menu items
├── 05-question-banks.ts      # ✅ Question banks & templates
├── 06-teams-groups.ts        # ✅ Teams & groups
├── 07-sample-data.ts         # ✅ Sample audits/findings/actions/dofs
├── 08-assignments.ts         # ✅ Manager & leader assignments
├── 09-workflows.ts           # ✅ Workflow definitions ✨ NEW
├── cleanup.ts                # ✅ Utility - database cleanup
├── README.md                 # ✅ Documentation
└── SEED-STATUS.md            # ✅ Status report
```

## 🚀 KULLANIM

### **Ana Seed (150 Kişilik Şirket)**
```powershell
npx tsx src/server/seed/00-master.ts
```

Bu çalıştırır:
- ✅ 1 Şirket (ABC Teknoloji A.Ş.)
- ✅ 5 Şube (Ankara HQ, İstanbul, İzmir, Bursa, Antalya)
- ✅ 12 Departman
- ✅ 15 Pozisyon (Hiyerarşik)
- ✅ **150 Kullanıcı** (Akıllı dağıtım)
- ✅ 4 Rol (Admin, Manager, Auditor, User)
- ✅ Menüler, Question Banks, Teams

### **Sadece Organization**
```powershell
npx tsx src/server/seed/01-organization.ts
```

### **Sadece Users**
```powershell
# Requires companyId
```

## 📊 KULLANICI DAĞILIMI (150 Kişi)

| Departman | Kişi | Açıklama |
|-----------|------|----------|
| CEO | 2 | Genel Müdürlük |
| Kalite | 8 | Quality & Audit |
| **Üretim** | 35 | Production (En kalabalık) |
| Satış | 20 | Sales & Marketing |
| İK | 6 | HR |
| Finans | 8 | Finance |
| IT | 12 | Information Technology |
| AR-GE | 15 | R&D |
| Tedarik | 15 | Supply Chain |
| Bakım | 18 | Maintenance |
| Hukuk | 5 | Legal |
| İdari | 6 | Administrative |
| **TOPLAM** | **150** | |

### **Pozisyon Dağılımı**
- %2 C-Level (CEO, VPs)
- %15 Management (Directors, Managers, Supervisors)
- %40 Professional (Specialists, Engineers)
- %43 Operational (Operators, Technicians, Staff)

## 🔑 LOGIN

**Email Format:**
```
[firstname].[lastname]@abcteknoloji.com
```

**Türkçe Karakter Dönüşümü:**
```
ç → c, ğ → g, ı → i, ö → o, ş → s, ü → u, İ → i
```

**Password (herkes):**
```
123456
```

**Email Verification:**
```
✅ Tüm seed kullanıcıları emailVerified = true
📧 Email doğrulaması gerekmez, direkt giriş yapılabilir
```

**Örnekler:**
- `mehmet.yilmaz@abcteknoloji.com` ← Name: Mehmet Yılmaz
- `ayse.demir@abcteknoloji.com` ← Name: Ayşe Demir
- `selin.yildirim@abcteknoloji.com` ← Name: Selin Yıldırım (ı→i)
- `gizem.cetin@abcteknoloji.com` ← Name: Gizem Çetin (ç→c)

## ✨ ÖZELLİKLER

### **Smart User Generator**
- ✅ Gerçekçi Türkçe isimler
- ✅ Türkçe karaktersiz email (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u)
- ✅ Departmana göre otomatik dağıtım
- ✅ Pozisyon hiyerarşisi
- ✅ Random hire dates (son 5 yıl)
- ✅ Role auto-assignment
- ✅ %40 female ratio
- ✅ Email verified (direkt giriş)

### **Modüler Yapı**
- ✅ Kısa dosyalar (150-200 satır)
- ✅ Tek sorumluluk
- ✅ Kolay bakım
- ✅ No duplication

### **Production Ready**
- ✅ Conflict handling (onConflictDoNothing)
- ✅ Error handling
- ✅ Progress logging
- ✅ Summary reporting

## 🗑️ ESKİ DOSYALAR (TEMİZLENDİ)

- ~~admin.ts~~ ✅ Silindi
- ~~users.ts~~ ✅ Silindi
- ~~roles.ts~~ ✅ Silindi
- ~~tasks.ts~~ ✅ Silindi
- ~~large-org-seed.ts~~ ✅ Silindi
- ~~comprehensive-audit-seed.ts~~ ✅ Silindi
- ~~audit-seed.ts~~ ✅ Silindi
- ~~index.ts~~ ✅ Silindi (eski master)
- ~~organization-seed.ts~~ ✅ Silindi (duplicate)
- ~~drizzle/seed/*~~ ✅ Silindi (duplicate klasör)

## ✅ TAMAMLANAN İYİLEŞTİRMELER

1. ✅ **Modüler yapı** - Her seed ayrı dosya, tek sorumluluk
2. ✅ **Schema uyumlu** - Tüm seedler schema ile uyumlu
3. ✅ **150 kişilik şirket** - Gerçekçi organizasyon yapısı
4. ✅ **Smart user generator** - Akıllı kullanıcı dağılımı
5. ✅ **Sample data** - Audit, Finding, Action, DOF örnekleri
6. ✅ **DRY principle** - Kod tekrarı yok
7. ✅ **Type-safe** - TypeScript type güvenliği
8. ✅ **Production ready** - Hemen kullanılabilir

## 🎯 KULLANIM SENARYOLARI

### **Senaryo 1: İlk Kurulum (Boş DB)**
```powershell
npx tsx src/server/seed/00-master.ts
```

### **Senaryo 2: Sadece Organizasyon**
```powershell
npx tsx src/server/seed/01-organization.ts
```

### **Senaryo 3: Sadece Kullanıcılar**
```powershell
# Requires organization seed first
npx tsx src/server/seed/02-users.ts
```

### **Senaryo 4: Temizlik + Yeniden Seed**
```powershell
# 1. Tüm seed datayı temizle
npx tsx src/server/seed/cleanup.ts

# 2. Yeniden seed
npx tsx src/server/seed/00-master.ts
```

---

**Created:** 2025-01-24  
**Status:** ✅ PRODUCTION READY  
**Pattern:** Modüler, DRY, Clean
