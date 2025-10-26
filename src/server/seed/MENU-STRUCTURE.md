# 🎯 MODERN MENU STRUCTURE - 2025

## **📋 MENU ORGANIZATION**

Menüler işlevselliğe göre **6 ana kategoride** organize edildi:

---

## **1. 🏠 DASHBOARD & QUICK ACCESS**

**Top-level menüler** - Hızlı erişim için:

- **Dashboard** (`/`) - Ana sayfa, özet metrikler
- **My Tasks** (`/admin/workflows/my-tasks`) - Workflow görevlerim

**Amaç:** Kullanıcıların en sık ihtiyaç duydukları sayfalara anında erişim.

---

## **2. 📋 AUDIT SYSTEM**

**Path:** `/audit-system`  
**Icon:** ClipboardCheck  
**Type:** Directory

### **Alt Menüler:**
- **Audit Dashboard** (`/denetim`) - Denetim ana sayfa
- **My Audits** (`/denetim/my-audits`) - Benim denetimlerim
- **All Audits** (`/denetim/all`) - Tüm denetimler
- **Audit Plans** (`/denetim/plans`) - Denetim planları

**Amaç:** Denetim yönetimi ve planlama.

---

## **3. ⚙️ WORKFLOW OPERATIONS**

**Path:** `/workflow-operations`  
**Icon:** Workflow  
**Type:** Directory

### **Alt Menüler:**
- **Findings** (`/denetim/findings`) - Bulgular
- **Actions** (`/denetim/actions`) - Aksiyonlar
- **DOFs** (`/denetim/dofs`) - Düzeltici/Önleyici Faaliyetler
- **Workflow Analytics** (`/admin/workflows/analytics`) - Workflow analitiği

**Özellik:** Tüm bu modüller **workflow sistemi kullanır**.

**Workflow Features:**
- ✅ Step assignments (adım atamaları)
- ✅ Approval flows (onay akışları)
- ✅ Deadline tracking (son tarih takibi)
- ✅ Auto-escalation (otomatik yükseltme)
- ✅ Delegation support (delegasyon)
- ✅ Timeline tracking (timeline takibi)

---

## **4. 🏗️ INFRASTRUCTURE**

**Path:** `/infrastructure`  
**Icon:** Database  
**Type:** Directory

### **Alt Menüler:**
- **Question Banks** (`/denetim/question-banks`) - Soru bankaları
- **Audit Templates** (`/denetim/templates`) - Denetim şablonları
- **Companies** (`/admin/organization/companies`) - Şirketler
- **Branches** (`/admin/organization/branches`) - Şubeler
- **Departments** (`/admin/organization/departments`) - Departmanlar
- **Positions** (`/admin/organization/positions`) - Pozisyonlar

**Özellik:** Bu modüller **workflow KULLANMAZ** - statik/master data.

**Non-workflow Modules:**
- ❌ No approval flows
- ❌ No step assignments
- ❌ No deadlines
- ✅ Simple CRUD operations
- ✅ Master data management

---

## **5. 🛡️ ADMINISTRATION**

**Path:** `/administration`  
**Icon:** Shield  
**Type:** Directory

### **Alt Menüler:**
- **User Management** (`/admin/users`) - Kullanıcı yönetimi
- **Roles & Permissions** (`/admin/roles`) - Rol ve yetkiler
- **Organization Chart** (`/admin/organization/org-chart`) - Organizasyon şeması
- **HR Integration** (`/admin/hr-sync`) - İK entegrasyonu
- **Menu Management** (`/system/menus`) - Menü yönetimi

**Amaç:** Sistem yönetimi ve güvenlik.

---

## **6. ⚙️ SYSTEM & SETTINGS**

**Path:** `/system`  
**Icon:** Settings  
**Type:** Directory

### **Alt Menüler:**
- **Settings** (`/settings`) - Ayarlar
- **Appearance** (`/settings/appearance`) - Görünüm
- **System Users** (`/system/users`) - Sistem kullanıcıları

**Amaç:** Kişisel ayarlar ve sistem konfigürasyonu.

---

## **📊 MENU STATISTICS**

```
Total Menu Items: ~35
├── Top-level: 2 (Dashboard, My Tasks)
├── Directories: 6
└── Sub-menus: ~27

Menu Depth: 2 levels (max)
Menu Types: 2 (menu, dir)
```

---

## **🎨 MENU ICONS**

### **Category Icons:**
- 🏠 Dashboard: `LayoutDashboard`
- ✅ Tasks: `CheckSquare`
- 📋 Audits: `ClipboardCheck`
- ⚙️ Workflows: `Workflow`
- 🏗️ Infrastructure: `Database`
- 🛡️ Admin: `Shield`
- ⚙️ System: `Settings`

### **Sub-menu Icons:**
- Audits: `FileCheck`, `ListChecks`, `Calendar`
- Findings: `AlertCircle`
- Actions: `CheckCircle2`
- DOFs: `Target`
- Analytics: `BarChart3`
- Organizations: `Building`, `Building2`, `Layers`, `Briefcase`
- Users: `Users`, `ShieldCheck`, `Network`, `RefreshCw`, `Menu`
- Settings: `Settings`, `Palette`, `UserCog`

---

## **🔄 WORKFLOW vs NON-WORKFLOW**

### **Workflow Modules (3):**
```
✅ Findings → Workflow-based approval
✅ Actions → Workflow-based completion
✅ DOFs → 8-step CAPA workflow
```

### **Non-Workflow Modules (6):**
```
❌ Question Banks → Simple CRUD
❌ Audit Templates → Simple CRUD
❌ Companies → Master data
❌ Branches → Master data
❌ Departments → Master data
❌ Positions → Master data
```

### **Why Separate?**

**Workflow Modules:**
- Complex business processes
- Multi-step approvals
- Time-critical tasks
- Compliance requirements
- Audit trail needed

**Non-Workflow Modules:**
- Simple data management
- No approval needed
- No time constraints
- Reference/lookup data
- Organizational structure

---

## **🚀 USAGE**

### **Seed Command:**
```bash
pnpm run seed
```

### **Re-seed Menus Only:**
```bash
# 1. Clear menu table
DELETE FROM "Menu";

# 2. Run seed
node -r esbuild-register src/server/seed/04-menus.ts
```

### **Manual Menu Assignment:**
```typescript
// Via role-menus seed (10-role-menus.ts)
// Automatically assigns menus to roles
```

---

## **📝 NOTES**

1. **Menu Labels:** i18n keys - gerçek metinler lokalizasyon dosyalarında
2. **Icons:** Lucide-react icon names kullanılıyor
3. **Paths:** Absolute paths - routing'e uygun
4. **Status:** All menus default to `active`
5. **Hierarchy:** 2-level max (parent → children)
6. **Role Assignment:** Role-menu junction table ile yönetiliyor

---

## **🔧 MAINTENANCE**

### **Yeni Menü Eklemek:**
1. `04-menus.ts` dosyasını aç
2. İlgili kategoriye menüyü ekle
3. Label, path, icon belirle
4. Seed'i yeniden çalıştır

### **Kategori Değiştirmek:**
1. Menüyü kes
2. Yeni kategoriye yapıştır
3. Parent-child ilişkisini güncelle

### **Menü Silmek:**
1. `04-menus.ts`'den kaldır
2. Seed'i yeniden çalıştır
3. Role-menu assignments otomatik temizlenir

---

## **✅ BEST PRACTICES**

1. **Logical Grouping:** İşlevselliğe göre grupla
2. **Consistent Icons:** Her kategori için tutarlı iconlar
3. **Clear Labels:** Açık, anlaşılır etiketler
4. **Flat Structure:** Mümkünse 2 seviye ile sınırla
5. **Workflow Separation:** Workflow/non-workflow ayrımını koru
6. **Role-based Access:** Menüler role göre atansın

---

**Son Güncelleme:** 2025-01-26  
**Versiyon:** 2.0 (Modern Structure)
