# Status Labels - Quick Reference Guide ⚡

## 🚀 Hızlı Başlangıç

### Import
```typescript
// Labels ve Colors
import { 
  AUDIT_STATUS_LABELS, 
  AUDIT_STATUS_COLORS,
  FINDING_STATUS_LABELS,
  ACTION_STATUS_LABELS
} from "@/lib/constants/status-labels";

// Helper Functions
import { 
  getAuditStatusLabel, 
  getAuditStatusColor 
} from "@/lib/constants/status-labels";

// Types
import type { 
  AuditStatus, 
  FindingStatus, 
  ActionStatus 
} from "@/lib/constants/status-labels";
```

---

## 📋 Yaygın Kullanımlar

### 1. Badge Component
```tsx
<Badge className={AUDIT_STATUS_COLORS[status]}>
  {AUDIT_STATUS_LABELS[status]}
</Badge>
```

### 2. Helper Function
```tsx
<Badge className={getAuditStatusColor(status)}>
  {getAuditStatusLabel(status)}
</Badge>
```

### 3. Filter Options
```tsx
const filterFields = [{
  label: "Durum",
  value: "status",
  options: Object.entries(FINDING_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
}];
```

### 4. Type-Safe Props
```tsx
interface Props {
  status: ActionStatus; // Type-safe!
}
```

---

## 🎨 Mevcut Constants

### Audit
```typescript
AUDIT_STATUS_LABELS    // 5 durum
AUDIT_STATUS_COLORS    // Renk class'ları
```

### Finding
```typescript
FINDING_STATUS_LABELS  // 6 durum
FINDING_STATUS_COLORS
```

### Action
```typescript
ACTION_STATUS_LABELS   // 5 durum
ACTION_STATUS_COLORS
ACTION_TYPE_LABELS     // 3 tip
ACTION_TYPE_COLORS
```

### DOF
```typescript
DOF_STATUS_LABELS      // 9 durum
DOF_STATUS_COLORS
```

### Risk
```typescript
RISK_TYPE_LABELS       // 4 seviye
RISK_TYPE_COLORS
```

---

## 🔧 Helper Functions

### Audit
```typescript
getAuditStatusLabel(status: string): string
getAuditStatusColor(status: string): string
```

### Finding
```typescript
getFindingStatusLabel(status: string): string
getFindingStatusColor(status: string): string
```

### Action
```typescript
getActionStatusLabel(status: string): string
getActionStatusColor(status: string): string
getActionTypeLabel(type: string): string
getActionTypeColor(type: string): string
```

### DOF
```typescript
getDofStatusLabel(status: string): string
getDofStatusColor(status: string): string
```

### Risk
```typescript
getRiskTypeLabel(riskType: string): string
getRiskTypeColor(riskType: string): string
```

---

## 📊 Status Mapping

### Audit Status
| Key | Label |
|-----|-------|
| `Active` | Devam Ediyor |
| `InReview` | İnceleme Aşamasında |
| `PendingClosure` | Kapanış Bekliyor |
| `Closed` | Tamamlandı |
| `Archived` | Arşivlendi |

### Finding Status
| Key | Label |
|-----|-------|
| `New` | Yeni |
| `Assigned` | Atandı |
| `InProgress` | İşlemde |
| `PendingAuditorClosure` | Onay Bekliyor |
| `Completed` | Tamamlandı |
| `Rejected` | Reddedildi |

### Action Status
| Key | Label |
|-----|-------|
| `Assigned` | Atandı |
| `PendingManagerApproval` | Onay Bekliyor |
| `Completed` | Tamamlandı |
| `Rejected` | Reddedildi |
| `Cancelled` | İptal Edildi |

### Action Type
| Key | Label |
|-----|-------|
| `Simple` | Basit |
| `Corrective` | Düzeltici |
| `Preventive` | Önleyici |

---

## 💡 Best Practices

### ✅ DO
```tsx
// ✅ Constants kullan
<Badge className={AUDIT_STATUS_COLORS[status]}>
  {AUDIT_STATUS_LABELS[status]}
</Badge>

// ✅ Helper function kullan
<Badge className={getAuditStatusColor(status)}>
  {getAuditStatusLabel(status)}
</Badge>

// ✅ Type kullan
interface Props {
  status: AuditStatus;
}
```

### ❌ DON'T
```tsx
// ❌ Hard-coded KULLANMA
<Badge className="bg-blue-100 text-blue-800">
  Aktif
</Badge>

// ❌ Manuel mapping YAPMA
const statusLabels = {
  Active: "Aktif",
  // ...
};
```

---

## 🔍 Hızlı Arama

### Label değiştirmek istiyorum
→ `status-labels.ts` → İlgili `_LABELS` constant'ını düzenle

### Renk değiştirmek istiyorum
→ `status-labels.ts` → İlgili `_COLORS` constant'ını düzenle

### Yeni status eklemek istiyorum
→ `status-labels.ts` → Type + Labels + Colors + Helper ekle

### Kullanım örneği görmek istiyorum
→ Bu dosya veya `README.md`

### Tüm status'leri görmek istiyorum
→ Bu dosyanın "Status Mapping" bölümü

---

## 📞 Yardım

**Dokümantasyon:** `README.md`  
**Değişiklikler:** `CHANGELOG-STATUS-REFACTOR.md`  
**Ana Dosya:** `status-labels.ts`

---

**Pro Tip:** Bu dosyayı bookmark'la ve sık sık başvur! 🌟
