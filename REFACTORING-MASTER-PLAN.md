# 🚀 Master Refactoring Plan - Action Files

## 📊 GENEL DURUM

**Toplam Dosya:** 16  
**Refactored:** 1 (audit-plan-actions.ts ✅)  
**Kalan:** 15  

**Hedef:** Tüm action dosyalarını DRY + SOLID + Type-Safe standardına yükseltmek

---

## 🎯 STANDART PATTERN (audit-plan-actions.ts)

### ✅ Kurulu Altyapı:
1. **lib/types/** - Merkezi type definitions
2. **lib/constants/status-labels.ts** - Status labels & colors
3. **withAuth<T>()** - Authentication wrapper
4. **createActionError()** - Error handler
5. **Helper functions** - Reusable utilities

### ✅ Refactoring Checklist:
- [ ] Import types from `@/lib/types`
- [ ] Use `withAuth()` wrapper
- [ ] Extract duplicate logic to helpers
- [ ] Remove local type definitions
- [ ] Use `createActionError()` for errors
- [ ] Apply DRY principle
- [ ] Apply SOLID principles
- [ ] Type-safe (no `any`)

---

## 📁 DOSYALAR VE PRİORİTE

### 🔴 **Yüksek Öncelik (Core Business Logic)**

#### 1. action-actions.ts ⭐⭐⭐
**Tahmini:** ~400 satır  
**Karmaşıklık:** Yüksek  
**Neden:** Action modülü, CAPA workflow, onay mekanizması  
**Beklenen İyileştirme:** %40-50 kod azalması  

#### 2. finding-actions.ts ⭐⭐⭐
**Tahmini:** ~350 satır  
**Karmaşıklık:** Orta-Yüksek  
**Neden:** Finding workflow, assignment, closure  
**Beklenen İyileştirme:** %35-45 kod azalması  

#### 3. dof-actions.ts ⭐⭐⭐
**Tahmini:** ~500 satır  
**Karmaşıklık:** Çok Yüksek  
**Neden:** 8-step workflow, approval, effectiveness check  
**Beklenen İyileştirme:** %45-55 kod azalması  

#### 4. audit-actions.ts ⭐⭐
**Tahmini:** ~300 satır  
**Karmaşıklık:** Orta  
**Neden:** Audit operations, status transitions  
**Beklenen İyileştirme:** %30-40 kod azalması  

---

### 🟡 **Orta Öncelik (Support Operations)**

#### 5. audit-question-actions.ts ⭐⭐
**Tahmini:** ~250 satır  
**Karmaşıklık:** Orta  
**Neden:** Question management, responses  

#### 6. question-bank-actions.ts ⭐
**Tahmini:** ~200 satır  
**Karmaşıklık:** Düşük-Orta  
**Neden:** Question bank CRUD  

#### 7. question-actions.ts ⭐
**Tahmini:** ~200 satır  
**Karmaşıklık:** Düşük-Orta  
**Neden:** Question CRUD  

#### 8. audit-template-actions.ts ⭐
**Tahmini:** ~150 satır  
**Karmaşıklık:** Düşük  
**Neden:** Template management  

---

### 🟢 **Düşük Öncelik (Utility & System)**

#### 9. user.ts
**Tahmini:** ~100 satır  
**Karmaşıklık:** Düşük  
**Neden:** User operations  

#### 10. my-tasks-actions.ts
**Tahmini:** ~150 satır  
**Karmaşıklık:** Düşük  
**Neden:** Task listing (mostly queries)  

#### 11. notification-actions.ts
**Tahmini:** ~100 satır  
**Karmaşıklık:** Düşük  
**Neden:** Notifications  

#### 12. export-actions.ts
**Tahmini:** ~200 satır  
**Karmaşıklık:** Orta  
**Neden:** Export functionality  

#### 13. auth.ts
**Tahmini:** ~150 satır  
**Karmaşıklık:** Orta  
**Neden:** Authentication (dikkatli!)  

#### 14. menu.ts
**Tahmini:** ~50 satır  
**Karmaşıklık:** Çok Düşük  
**Neden:** Menu data  

#### 15. uploadthing.ts
**Tahmini:** ~50 satır  
**Karmaşıklık:** Düşük  
**Neden:** File upload  

---

## 🗓️ FAZA GÖRE PLANLAMA

### **PHASE 1: Core Business Logic** (Hafta 1)
- [x] audit-plan-actions.ts (TAMAMLANDI ✅)
- [ ] action-actions.ts
- [ ] finding-actions.ts
- [ ] dof-actions.ts

**Beklenen Sonuç:**
- ~1500 satır kod azalması
- Core workflow'lar standardize
- %100 Type-safe

---

### **PHASE 2: Audit Operations** (Hafta 2)
- [ ] audit-actions.ts
- [ ] audit-question-actions.ts
- [ ] audit-template-actions.ts

**Beklenen Sonuç:**
- ~700 satır kod azalması
- Audit ecosystem standardize

---

### **PHASE 3: Question System** (Hafta 2-3)
- [ ] question-bank-actions.ts
- [ ] question-actions.ts

**Beklenen Sonuç:**
- ~400 satır kod azalması
- Question system clean

---

### **PHASE 4: System & Utilities** (Hafta 3)
- [ ] user.ts
- [ ] my-tasks-actions.ts
- [ ] notification-actions.ts
- [ ] export-actions.ts
- [ ] auth.ts
- [ ] menu.ts
- [ ] uploadthing.ts

**Beklenen Sonuç:**
- ~800 satır kod azalması
- Tüm sistem standardize

---

## 📈 BEKLENEN GENEL SONUÇLAR

### Kod Metrikleri:
```
Toplam Satır (Tahmin):     ~4000 satır
Refactor Sonrası:          ~2600 satır
Kod Azalması:              ~1400 satır (%35)
Helper Functions:          +500 satır
Net İyileştirme:          ~900 satır (%22.5)
```

### Kalite Metrikleri:
```
DRY:                       %0 → %100
Type Safety:               %40 → %100
SOLID Compliance:          %30 → %95
Cyclomatic Complexity:     8-15 → 3-5
Maintainability Index:     60 → 90
Code Duplication:          %40 → %0
```

---

## 🛠️ ORTAK HELPER FUNCTIONS (Oluşturulacak)

### lib/helpers/auth-helpers.ts
```typescript
- withAuth<T>()
- requireUser()
- requireAdmin()
- requireCreatorOrAdmin()
```

### lib/helpers/validation-helpers.ts
```typescript
- validateEntity<T>()
- validateStatus()
- validatePermission()
```

### lib/helpers/db-helpers.ts
```typescript
- updateEntityStatus()
- softDelete()
- createAuditLog()
```

### lib/helpers/error-helpers.ts
```typescript
- createActionError()
- handleDatabaseError()
- createValidationError()
```

---

## 📝 HER DOSYA İÇİN STANDART YAPISI

```typescript
"use server";

// 1. Imports
import { db } from "@/drizzle/db";
import { ... } from "@/drizzle/schema";
import type { ActionResponse, User, ... } from "@/lib/types";
import { withAuth, createActionError } from "@/lib/helpers";

// 2. Local Helpers (dosyaya özel)
async function localHelper() {
  // ...
}

// 3. Export Actions (withAuth pattern)
export async function myAction(data: any): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Business logic
  }, { requireAdmin: true });
}
```

---

## ✅ SUCCESS CRITERIA

Her dosya için:
- [ ] No local type definitions
- [ ] Using `@/lib/types`
- [ ] Using `withAuth()` wrapper
- [ ] No `any` types
- [ ] Helpers extracted
- [ ] DRY compliance
- [ ] SOLID compliance
- [ ] Test edildi
- [ ] Documentation updated

---

## 🚨 RİSKLER VE ÖNLEMLER

### Risk 1: Breaking Changes
**Önlem:** Her refactor sonrası test et, küçük adımlarla ilerle

### Risk 2: Business Logic Bozulması
**Önlem:** Logic değiştirme, sadece structure iyileştir

### Risk 3: Zaman
**Önlem:** Öncelik sırasına göre ilerle, core'dan başla

### Risk 4: Type Conflicts
**Önlem:** lib/types/ sürekli güncel tut

---

## 📊 İLERLEME TAKİP

### Tamamlanan:
- [x] audit-plan-actions.ts (564 satır, %100 DRY)

### Devam Eden:
- [ ] ...

### Bekleyen:
- [ ] 15 dosya

---

## 🎯 SONRAKİ ADIM

**Şu an:** action-actions.ts analizi ve refactoring planı
**Tahmini Süre:** 2-3 saat
**Beklenen Sonuç:** ~400 → ~250 satır (%37.5 azalma)

---

**Created:** 23 Ekim 2025  
**Status:** 🚀 In Progress (1/16)  
**Last Updated:** 23 Ekim 2025
