# Status Labels & Constants System 🎯

## 📋 Genel Bakış

Bu klasör, projede kullanılan tüm status label'larını, renk kodlarını ve helper fonksiyonlarını merkezi olarak yöneten sistemin ana dosyasını içerir.

**Dosya:** `status-labels.ts`

---

## 🎨 İçerik

### 1. Type Definitions
Tüm status ve type'lar için TypeScript type exports:

```typescript
import type { 
  AuditStatus, 
  FindingStatus, 
  ActionStatus,
  DofStatus,
  RiskType 
} from "./status-labels";
```

### 2. Label Mappings
Her status için Türkçe label'lar:

```typescript
import { 
  AUDIT_STATUS_LABELS,
  FINDING_STATUS_LABELS,
  ACTION_STATUS_LABELS,
  DOF_STATUS_LABELS
} from "./status-labels";
```

### 3. Color Configurations
Her status için Tailwind CSS renk class'ları:

```typescript
import { 
  AUDIT_STATUS_COLORS,
  FINDING_STATUS_COLORS,
  ACTION_STATUS_COLORS,
  DOF_STATUS_COLORS
} from "./status-labels";
```

### 4. Helper Functions
Type-safe label ve renk getter fonksiyonları:

```typescript
import { 
  getAuditStatusLabel,
  getAuditStatusColor,
  getFindingStatusLabel,
  getActionStatusLabel
} from "./status-labels";
```

---

## 🚀 Kullanım Örnekleri

### Örnek 1: Badge Component

```tsx
import { Badge } from "@/components/ui/badge";
import { AUDIT_STATUS_LABELS, AUDIT_STATUS_COLORS } from "@/lib/constants/status-labels";

function AuditBadge({ status }: { status: string }) {
  return (
    <Badge className={AUDIT_STATUS_COLORS[status]}>
      {AUDIT_STATUS_LABELS[status]}
    </Badge>
  );
}
```

### Örnek 2: Helper Function ile

```tsx
import { getAuditStatusLabel, getAuditStatusColor } from "@/lib/constants/status-labels";

function AuditStatus({ status }: { status: string }) {
  return (
    <Badge className={getAuditStatusColor(status)}>
      {getAuditStatusLabel(status)}
    </Badge>
  );
}
```

### Örnek 3: Filter Options (Dynamic)

```tsx
import { FINDING_STATUS_LABELS } from "@/lib/constants/status-labels";

const filterFields = [
  {
    label: "Durum",
    value: "status",
    options: Object.entries(FINDING_STATUS_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
  },
];
```

### Örnek 4: Type-Safe Props

```tsx
import type { ActionStatus } from "@/lib/constants/status-labels";

interface ActionCardProps {
  status: ActionStatus; // Type-safe!
  title: string;
}
```

---

## 📊 Mevcut Status Türleri

### Audit Status
- `Active` → "Devam Ediyor"
- `InReview` → "İnceleme Aşamasında"
- `PendingClosure` → "Kapanış Bekliyor"
- `Closed` → "Tamamlandı"
- `Archived` → "Arşivlendi"

### Finding Status
- `New` → "Yeni"
- `Assigned` → "Atandı"
- `InProgress` → "İşlemde"
- `PendingAuditorClosure` → "Onay Bekliyor"
- `Completed` → "Tamamlandı"
- `Rejected` → "Reddedildi"

### Action Status
- `Assigned` → "Atandı"
- `PendingManagerApproval` → "Onay Bekliyor"
- `Completed` → "Tamamlandı"
- `Rejected` → "Reddedildi"
- `Cancelled` → "İptal Edildi"

### DOF Status
- `Step1_Problem` → "1. Problem Tanımı"
- `Step2_TempMeasures` → "2. Geçici Önlemler"
- `Step3_RootCause` → "3. Kök Neden Analizi"
- `Step4_Activities` → "4. Faaliyetler"
- `Step5_Implementation` → "5. Uygulama"
- `Step6_EffectivenessCheck` → "6. Etkinlik Kontrolü"
- `PendingManagerApproval` → "Yönetici Onayı"
- `Completed` → "Tamamlandı"
- `Rejected` → "Reddedildi"

### Risk Types
- `Kritik` → Kırmızı (text-red-600 font-bold)
- `Yüksek` → Turuncu (text-orange-600 font-semibold)
- `Orta` → Sarı (text-yellow-600 font-medium)
- `Düşük` → Yeşil (text-green-600 font-normal)

---

## ✅ Avantajlar

### 1. DRY (Don't Repeat Yourself)
- Tek bir dosyada tüm label'lar
- Kod tekrarı yok
- Güncelleme tek yerden

### 2. SOLID Principles
- **Single Responsibility:** Her constant tek amaca hizmet eder
- **Open/Closed:** Yeni status eklemek kolay
- **Dependency Inversion:** High-level modüller abstraction'a bağlı

### 3. Type Safety
- TypeScript type exports
- Compile-time hata yakalama
- IDE autocomplete desteği

### 4. Maintainability
- Label değişikliği 1 dakika
- Renk güncellemesi 1 saniye
- Yeni status eklemek 2 dakika

### 5. Consistency
- Tüm UI tutarlı
- Aynı terminology
- Aynı renk paleti

---

## 🔧 Yeni Status Ekleme

### Adım 1: Type Tanımla
```typescript
export type MyNewStatus = "Status1" | "Status2" | "Status3";
```

### Adım 2: Label Mapping Ekle
```typescript
export const MY_NEW_STATUS_LABELS = {
  Status1: "Durum 1",
  Status2: "Durum 2",
  Status3: "Durum 3",
} as const;
```

### Adım 3: Color Mapping Ekle
```typescript
export const MY_NEW_STATUS_COLORS = {
  Status1: "bg-blue-100 text-blue-800",
  Status2: "bg-green-100 text-green-800",
  Status3: "bg-red-100 text-red-800",
} as const;
```

### Adım 4: Helper Function Ekle (Opsiyonel)
```typescript
export function getMyNewStatusLabel(status: string): string {
  return MY_NEW_STATUS_LABELS[status as keyof typeof MY_NEW_STATUS_LABELS] || status;
}

export function getMyNewStatusColor(status: string): string {
  return MY_NEW_STATUS_COLORS[status as keyof typeof MY_NEW_STATUS_COLORS] || "";
}
```

---

## 🌍 i18n Hazırlığı

Bu sistem i18n/localization için hazır:

```typescript
// tr.ts
export const tr = {
  status: {
    audit: AUDIT_STATUS_LABELS,
    finding: FINDING_STATUS_LABELS,
    // ...
  }
};

// en.ts
export const en = {
  status: {
    audit: {
      Active: "In Progress",
      InReview: "Under Review",
      // ...
    }
  }
};
```

---

## 📝 Best Practices

### ✅ DO
- Constants'ı import et ve kullan
- Type definitions kullan
- Helper functions kullan
- Yeni status eklerken dokümante et

### ❌ DON'T
- Hard-coded label kullanma
- Inline color strings kullanma
- Status string'leri manuel yaz
- Constants'ı duplicate etme

---

## 🔗 İlgili Dosyalar

- **Status Badge Component:** `@/components/ui/status-badge.tsx`
- **Action Columns:** `@/app/(main)/denetim/actions/columns.tsx`
- **Finding Columns:** `@/app/(main)/denetim/findings/columns.tsx`
- **DOF Columns:** `@/app/(main)/denetim/dofs/columns.tsx`
- **Audit Detail Page:** `@/app/(main)/denetim/audits/[id]/page.tsx`

---

## 📚 Daha Fazla Bilgi

Sorularınız için:
- Project Wiki
- Technical Documentation
- Code Review Guidelines

---

**Son Güncelleme:** 23 Ekim 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready
