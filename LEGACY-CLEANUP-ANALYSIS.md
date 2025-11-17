# 🔍 Legacy & Tutarsızlık Analizi - Framework Core

**Tarih**: 17 Kasım 2025  
**Branch**: `framework-core`  
**Durum**: Analiz Tamamlandı ❌

---

## 📊 Genel Durum

Framework dönüşümü sonrası **önemli miktarda domain-specific kod** hala projede mevcut:

- ❌ **66 dosya** hala `audit` referansı içeriyor (829 eşleşme)
- ❌ **59 dosya** hala `finding` referansı içeriyor (646 eşleşme)
- ❌ **Server Actions**: 13 domain-specific action dosyası
- ❌ **Email Templates**: 5 domain-specific email
- ❌ **Seed Files**: 7 domain-specific seed
- ❌ **Reporting**: 7 domain-specific rapor template'i
- ❌ **i18n Files**: 10 domain-specific çeviri dosyası
- ❌ **Hooks**: Domain-specific hook'lar
- ❌ **Types**: Domain-specific type tanımları

---

## 🚨 KRİTİK: Silinmesi Gereken Domain-Specific Dosyalar

### 📧 **1. Email Templates** (5 dosya)
**Konum**: `src/emails/`

```
❌ action-approved.tsx          - Action approval email
❌ action-assigned.tsx          - Action assignment email
❌ dof-assigned.tsx             - DOF assignment email
❌ finding-assigned.tsx         - Finding assignment email
❌ plan-created.tsx             - Audit plan email
```

**Öneri**: Tümü silinmeli, generic notification template kalmalı.

---

### 🔧 **2. Server Actions** (13 dosya)
**Konum**: `src/server/actions/`

```
❌ action-actions.ts            - 14KB - Action CRUD
❌ audit-actions.ts             - 11KB - Audit CRUD
❌ audit-plan-actions.ts        - 16KB - Audit planning
❌ audit-question-actions.ts    - 10KB - Audit questions
❌ audit-template-actions.ts    - 5KB  - Audit templates
❌ dof-actions.ts               - 17KB - DOF CRUD
❌ finding-actions.ts           - 12KB - Finding CRUD
❌ question-actions.ts          - 7KB  - Question CRUD
❌ question-bank-actions.ts     - 6KB  - Question bank CRUD
❌ report-actions.ts            - 5KB  - Domain reports
❌ dashboard-actions.ts         - 5KB  - Domain dashboard stats
❌ my-tasks-actions.ts          - 319B - Domain tasks
❌ workflow-analytics-actions.ts - 9KB - (Partially domain-specific)
```

**Toplam**: ~122KB domain-specific code

**Öneri**: 
- ✅ **KEEP**: `auth.ts`, `user-actions.ts`, `role-actions.ts`, `organization-actions.ts`, `hr-sync-actions.ts`, `notification-actions.ts`, `menu.ts`, `workflow-actions.ts`, `visual-workflow-actions.ts`, `workflow-data-actions.ts`, `custom-field-*`
- ❌ **DELETE**: Yukarıdaki 13 dosya

---

### 🌱 **3. Seed Files** (7 dosya)
**Konum**: `src/server/seed/`

```
❌ 05-question-banks.ts         - 6KB  - Question bank seed
❌ 07-sample-data.ts            - 13KB - Audit/Finding/Action sample data
❌ 08-assignments.ts            - 4KB  - Sample assignments
❌ 09-workflows.ts              - 13KB - Domain-specific workflows
❌ 11-workflows.ts              - 9KB  - Additional domain workflows
❌ 11-unified-permissions.ts    - 34KB - Domain permissions (HEAVY!)
⚠️  cleanup.ts                   - 4KB  - Contains domain cleanup
```

**Toplam**: ~83KB domain-specific seed code

**Öneri**:
- ❌ **DELETE**: Yukarıdaki dosyalar
- ✅ **KEEP & CLEAN**: 
  - `00-admin.ts`, `00-master.ts`
  - `01-organization.ts` (örnek company/branch)
  - `02-users.ts` (örnek users)
  - `03-roles.ts` (core roles only - audit rolleri temizle)
  - `04-menus.ts` (core menus only - audit menüleri temizle)
  - `06-teams-groups.ts` (generic examples)
  - `10-role-menus.ts` (core menu assignments)

---

### 📊 **4. Reporting Templates** (7 dosya)
**Konum**: `src/lib/reporting/templates/`

```
❌ action-report.ts             - Action detail report
❌ actions-list-report.ts       - Actions list report
❌ audit-report.ts              - Audit detail report
❌ dof-report.ts                - DOF detail report
❌ findings-list-report.ts      - Findings list report
⚠️  base-report.tsx              - Generic (KEEP but review)
⚠️  simple-test.tsx              - Test file (KEEP but review)
```

**Öneri**: Domain-specific report'ları sil, base-report.tsx'i generic tut.

---

### 🔐 **5. Permission Checkers** (1 dosya)
**Konum**: `src/lib/permissions/`

```
❌ finding-permissions.ts       - 5KB - Finding-specific permissions
⚠️  unified-permission-checker.ts - 13KB - Contains domain references
```

**Öneri**: 
- ❌ **DELETE**: `finding-permissions.ts`
- 🔧 **CLEAN**: `unified-permission-checker.ts` - Remove domain-specific checks

---

### 🌐 **6. i18n Translation Files** (10 dosya)
**Konum**: `src/i18n/locales/tr/` & `src/i18n/locales/en/`

```
❌ action.json                  - 4KB  - Action translations
❌ audit.json                   - 6KB  - Audit translations
❌ dof.json                     - 6KB  - DOF translations
❌ finding.json                 - 3KB  - Finding translations
❌ myTasks.json                 - 1KB  - Domain task translations
❌ plans.json                   - 246B - Audit plan translations
❌ questionBanks.json           - 328B - Question bank translations
❌ questions.json               - 1KB  - Question translations
❌ templates.json               - 2KB  - Audit template translations
❌ reports.json                 - 3KB  - Domain report translations
```

**Toplam**: ~26KB domain-specific translations (TR + EN = 52KB)

**Öneri**: Hepsini sil.

**✅ KEEP**:
- `common.json`, `auth.json`, `dashboard.json` (generic version), `errors.json`, `hrSync.json`, `navigation.json` (cleaned), `organization.json`, `roles.json`, `settings.json`, `status.json` (generic), `users.json`, `workflow.json`

---

### 🪝 **7. Custom Hooks** (1 dosya)
**Konum**: `src/hooks/`

```
❌ use-task-categories.tsx      - Domain-specific task categorization
```

**Öneri**: Sil veya generic hale getir.

---

### 📝 **8. Types** (1 dosya)
**Konum**: `src/types/`

```
❌ my-tasks.ts                  - Domain-specific task types
```

**Öneri**: Sil.

---

### 🛠️ **9. Utility Functions** (2 dosya)
**Konum**: `src/lib/`

```
❌ parse-finding.ts             - Finding parsing utility
⚠️  export.ts                    - Contains domain export logic (review)
```

**Öneri**: 
- ❌ **DELETE**: `parse-finding.ts`
- 🔧 **REVIEW**: `export.ts` - Clean domain-specific exports

---

### 🗄️ **10. Database Queries** (1 dosya)
**Konum**: `src/lib/db/`

```
⚠️  query-helpers.ts             - Contains domain queries (audit, finding)
```

**Öneri**: Clean domain-specific queries.

---

### 🔔 **11. Notification & Email Services** (2 dosya)
**Konum**: `src/lib/`

```
⚠️  email/email-service.ts       - Contains domain email sending
⚠️  notifications/notification-service.ts - Contains domain notifications
```

**Öneri**: Remove domain-specific email/notification logic.

---

### 🔄 **12. Workflow Integration** (1 dosya)
**Konum**: `src/lib/workflow/`

```
⚠️  workflow-integration.ts      - Contains Audit/Finding/Action entity mappings
```

**Öneri**: Clean or make generic with plugin pattern.

---

### 📱 **13. Main Dashboard Page** (1 dosya)
**Konum**: `src/app/(main)/page.tsx`

```
⚠️  page.tsx                     - Dashboard with domain stats & links
```

**Öneri**: Create generic framework dashboard.

---

### 🎨 **14. UI Components** (Scattered)
**Konum**: `src/components/`

```
⚠️  ui/status-badge.tsx          - Contains finding/action status badges
⚠️  notifications/notification-list.tsx - Domain notification rendering
```

**Öneri**: Make generic or clean domain logic.

---

### 📚 **15. Constants & Helpers** (Multiple files)
**Konum**: `src/lib/constants/`, `src/lib/helpers/`, `src/lib/i18n/`

```
⚠️  constants/status-labels.ts   - Domain status labels
⚠️  helpers/revalidation-helpers.ts - Domain revalidation paths
⚠️  i18n/button-labels.ts         - Domain button labels
⚠️  i18n/status-helpers.ts        - Domain status helpers
⚠️  i18n/toast-messages.ts        - Domain toast messages
⚠️  i18n/use-action-translations.ts - Domain action translations
```

**Öneri**: Clean all domain-specific logic.

---

## 📂 Korunacak & Temizlenecek Dosyalar

### ✅ **Core Files to KEEP** (Minimal changes needed)

**Server Actions**:
- `auth.ts` ✅
- `user-actions.ts` ✅
- `role-actions.ts` ✅
- `organization-actions.ts` ✅
- `department-actions.ts` ✅
- `hr-sync-actions.ts` ✅
- `notification-actions.ts` ✅
- `menu.ts` ✅
- `workflow-actions.ts` ✅
- `visual-workflow-actions.ts` ✅
- `workflow-data-actions.ts` ✅
- `custom-field-definition-actions.ts` ✅
- `custom-field-value-actions.ts` ✅
- `uploadthing.ts` ✅
- `user.ts` ✅

**Seed Files**:
- `00-admin.ts` ✅ (Clean domain refs)
- `00-master.ts` ✅
- `01-organization.ts` ✅
- `02-users.ts` ✅ (Clean domain roles)
- `03-roles.ts` 🔧 (Remove audit roles, keep core)
- `04-menus.ts` 🔧 (Remove audit menus, keep core)
- `06-teams-groups.ts` ✅
- `10-role-menus.ts` 🔧 (Clean audit menu assignments)

**i18n Files**:
- `common.json` ✅
- `auth.json` ✅
- `dashboard.json` 🔧 (Make generic)
- `errors.json` ✅
- `hrSync.json` ✅
- `navigation.json` 🔧 (Remove audit links)
- `organization.json` ✅
- `roles.json` ✅
- `settings.json` ✅
- `status.json` 🔧 (Keep only generic statuses)
- `users.json` ✅
- `workflow.json` ✅

---

## 🎯 Temizlik Öncelik Sıralaması

### **Priority 1: CRITICAL** 🔴
Bu dosyalar framework ile **hiçbir alakası yok**, hemen silinmeli:

1. ❌ **Email templates** (5 dosya) - `src/emails/*.tsx`
2. ❌ **Domain server actions** (13 dosya) - `src/server/actions/*-actions.ts`
3. ❌ **Domain seed files** (7 dosya) - `src/server/seed/05,07,08,09,11*.ts`
4. ❌ **Reporting templates** (5 dosya) - `src/lib/reporting/templates/*-report.ts`
5. ❌ **Domain i18n** (10 dosya x2 lang) - `src/i18n/locales/*/action|audit|dof|finding|*.json`

**Etki**: ~150 dosya, ~300KB kod

---

### **Priority 2: HIGH** 🟠
Bu dosyalar domain logic içeriyor, temizlenmeli veya silinmeli:

6. 🔧 **Permission checker** - Clean `unified-permission-checker.ts`
7. ❌ **Finding permissions** - Delete `finding-permissions.ts`
8. ❌ **Parse finding utility** - Delete `parse-finding.ts`
9. ❌ **Task types** - Delete `my-tasks.ts`
10. ❌ **Task hook** - Delete `use-task-categories.tsx`
11. 🔧 **Dashboard page** - Clean `app/(main)/page.tsx`
12. 🔧 **Workflow integration** - Clean `lib/workflow/workflow-integration.ts`

**Etki**: ~30KB kod temizliği

---

### **Priority 3: MEDIUM** 🟡
Bu dosyalar partial domain logic içeriyor:

13. 🔧 **Email service** - Clean domain emails
14. 🔧 **Notification service** - Clean domain notifications
15. 🔧 **Query helpers** - Clean domain queries
16. 🔧 **Status badge** - Make generic
17. 🔧 **Export utility** - Clean domain exports
18. 🔧 **Constants & helpers** - Clean domain constants

**Etki**: ~20KB kod temizliği

---

### **Priority 4: LOW** 🟢
Seed ve config temizliği:

19. 🔧 **Seed files** - Clean domain data from core seeds
20. 🔧 **Menu seed** - Remove audit menus
21. 🔧 **i18n core files** - Clean domain references

**Etki**: ~50KB kod temizliği

---

## 📋 Temizlik Sonrası Hedef Yapı

```
src/
├── server/
│   ├── actions/
│   │   ├── auth.ts                     ✅ Core
│   │   ├── user-actions.ts             ✅ Core
│   │   ├── role-actions.ts             ✅ Core
│   │   ├── organization-actions.ts     ✅ Core
│   │   ├── department-actions.ts       ✅ Core
│   │   ├── hr-sync-actions.ts          ✅ Core
│   │   ├── notification-actions.ts     ✅ Core
│   │   ├── workflow-actions.ts         ✅ Core
│   │   ├── visual-workflow-actions.ts  ✅ Core
│   │   ├── custom-field-*.ts           ✅ Core
│   │   └── menu.ts                     ✅ Core
│   └── seed/
│       ├── 00-admin.ts                 ✅ Core
│       ├── 00-master.ts                ✅ Core
│       ├── 01-organization.ts          ✅ Core
│       ├── 02-users.ts                 ✅ Core
│       ├── 03-roles.ts                 🔧 Cleaned
│       ├── 04-menus.ts                 🔧 Cleaned
│       ├── 06-teams-groups.ts          ✅ Core
│       └── 10-role-menus.ts            🔧 Cleaned
├── lib/
│   ├── auth/                           ✅ Core
│   ├── db/
│   │   └── query-helpers.ts            🔧 Cleaned (generic only)
│   ├── email/
│   │   └── email-service.ts            🔧 Cleaned (generic only)
│   ├── notifications/
│   │   └── notification-service.ts     🔧 Cleaned (generic only)
│   ├── permissions/
│   │   └── unified-permission-checker.ts 🔧 Cleaned
│   ├── workflow/
│   │   └── workflow-integration.ts     🔧 Generic with plugin support
│   ├── constants/                      🔧 Core only
│   ├── helpers/                        🔧 Core only
│   ├── i18n/                           🔧 Core only
│   └── reporting/                      ✅ Generic framework only
├── emails/
│   ├── layouts/                        ✅ Core
│   └── notification-template.tsx       ✅ Generic template
├── i18n/
│   └── locales/
│       ├── en/
│       │   ├── common.json             ✅ Core
│       │   ├── auth.json               ✅ Core
│       │   ├── dashboard.json          🔧 Generic
│       │   ├── navigation.json         🔧 Core menus only
│       │   ├── organization.json       ✅ Core
│       │   ├── workflow.json           ✅ Core
│       │   └── ...
│       └── tr/ (same structure)
├── hooks/                              ✅ Core hooks only
├── types/                              ✅ Core types only
└── components/                         ✅ Already cleaned
```

---

## 🔢 Temizlik İstatistikleri

### **Silinecek Dosyalar**
- **Email templates**: 5 dosya (~10KB)
- **Server actions**: 13 dosya (~122KB)
- **Seed files**: 7 dosya (~83KB)
- **Reporting templates**: 5 dosya (~30KB)
- **i18n files**: 20 dosya (TR+EN) (~52KB)
- **Utilities**: 3 dosya (~5KB)
- **Hooks**: 1 dosya (~3KB)
- **Types**: 1 dosya (~2KB)

**Toplam Silinecek**: ~55 dosya, ~307KB

### **Temizlenecek Dosyalar**
- **Seed files**: 5 dosya (domain refs)
- **i18n files**: 6 dosya (domain refs)
- **Services**: 3 dosya (domain logic)
- **Helpers**: 10+ dosya (domain logic)
- **Components**: 5 dosya (domain logic)
- **Dashboard**: 1 dosya (domain UI)

**Toplam Temizlenecek**: ~30 dosya, ~100KB temizlik

### **Genel Toplam**
- **Etkilenecek dosyalar**: ~85 dosya
- **Temizlenecek kod**: ~400KB
- **Dosya referansları**: 829 (audit) + 646 (finding) = 1,475 referans

---

## ✅ Sonraki Adımlar

### **Aşama 1: Dosya Silme** (2-3 saat)
1. Email templates sil
2. Domain server actions sil
3. Domain seed files sil
4. Reporting templates sil
5. Domain i18n files sil
6. Utility/hooks/types sil

### **Aşama 2: Kod Temizliği** (3-4 saat)
7. Core seed files'ı temizle
8. Core i18n files'ı temizle
9. Services'leri temizle
10. Helpers'ları temizle
11. Components'leri temizle
12. Dashboard'u yeniden yaz

### **Aşama 3: Test & Doğrulama** (2 saat)
13. Build hatalarını düzelt
14. Type errors'ları düzelt
15. Test et
16. Documentation güncelle

**Toplam Süre**: ~8-9 saat

---

## 🚀 Başarı Kriterleri

Framework temizliği başarılı sayılır eğer:

- ✅ `audit`, `finding`, `action`, `dof` string'leri sadece example/demo amaçlı dokümantasyonda geçiyor
- ✅ Tüm server actions core/generic
- ✅ Tüm seed files core/generic examples içeriyor
- ✅ i18n files sadece framework çevirilerini içeriyor
- ✅ Email templates generic
- ✅ Reporting system generic ve plugin-ready
- ✅ Dashboard generic framework UI
- ✅ No type errors
- ✅ Build successful
- ✅ `pnpm dev` çalışıyor

---

## 📝 Notlar

1. **Breaking Changes**: Bu temizlik breaking change'ler içerecek. Domain-specific uygulama yeniden yazılmalı.

2. **Plugin Pattern**: Workflow integration gibi modüller plugin pattern'e dönüştürülmeli.

3. **Generic Dashboard**: Yeni dashboard framework özellikleri göstermeli (users, roles, org, workflows).

4. **Example Domain Module**: Temizlik sonrası bir "example domain module" oluşturulmalı (documentation amaçlı).

5. **Migration Guide**: Domain-specific app'ler için migration guide yazılmalı.

---

**Hazırlayan**: Cascade AI  
**Son Güncelleme**: 17 Kasım 2025  
**Durum**: 🔴 Acil Temizlik Gerekli
