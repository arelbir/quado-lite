# 🌍 i18n FRONTEND INTEGRATION GUIDE

## **Status:** ✅ Phase 3 - Frontend Integration Started

---

## **🎯 INTEGRATION STRATEGY**

### **Completed:**
```
✅ Status translations (status.json TR + EN)
✅ Status helper hooks (status-helpers.ts)
✅ StatusBadge component updated
✅ i18n infrastructure ready
```

### **To Do:**
```
☐ Update all common buttons
☐ Update error messages
☐ Update form labels
☐ Update table headers
☐ Update navigation menu
☐ Update page titles
```

---

## **📚 USAGE PATTERNS**

### **Pattern 1: Status Labels (✅ COMPLETE)**

**Before:**
```tsx
import { ACTION_STATUS_LABELS } from '@/lib/constants/status-labels';

<Badge>{ACTION_STATUS_LABELS[status]}</Badge>
```

**After (i18n):**
```tsx
'use client';
import { useActionStatusLabel } from '@/lib/i18n/status-helpers';

function MyComponent() {
  const getLabel = useActionStatusLabel();
  return <Badge>{getLabel(status)}</Badge>;
}
```

**Example (StatusBadge):**
```tsx
// ✅ Already updated!
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="Assigned" type="action" />
// TR: "Atandı"
// EN: "Assigned"
```

---

### **Pattern 2: Common Buttons**

**Before:**
```tsx
<Button>Kaydet</Button>
<Button>İptal</Button>
<Button>Sil</Button>
```

**After (i18n):**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function MyForm() {
  const t = useTranslations('common');
  
  return (
    <>
      <Button>{t('actions.save')}</Button>
      <Button>{t('actions.cancel')}</Button>
      <Button>{t('actions.delete')}</Button>
    </>
  );
}
```

---

### **Pattern 3: Error Messages**

**Before:**
```tsx
toast.error("İşlem başarısız oldu");
toast.error("Bu alan zorunludur");
```

**After (i18n):**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('errors');
  
  const handleError = () => {
    toast.error(t('api.operationFailed'));
    toast.error(t('validation.required'));
  };
}
```

---

### **Pattern 4: Form Labels**

**Before:**
```tsx
<Label>Başlık</Label>
<Input placeholder="Başlık giriniz" />
```

**After (i18n):**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function MyForm() {
  const t = useTranslations('audit');
  
  return (
    <>
      <Label>{t('fields.title')}</Label>
      <Input placeholder={t('placeholders.enterTitle')} />
    </>
  );
}
```

---

### **Pattern 5: Table Headers**

**Before:**
```tsx
const columns: ColumnDef<Audit>[] = [
  {
    accessorKey: "title",
    header: "Başlık",
  },
  {
    accessorKey: "status",
    header: "Durum",
  },
];
```

**After (i18n):**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function useAuditColumns() {
  const t = useTranslations('audit');
  
  return [
    {
      accessorKey: "title",
      header: t('fields.title'),
    },
    {
      accessorKey: "status",
      header: t('fields.status'),
    },
  ];
}
```

---

### **Pattern 6: Navigation Menu**

**Before:**
```tsx
const menuItems = [
  { label: "Denetimler", href: "/denetim/audits" },
  { label: "Bulgular", href: "/denetim/findings" },
  { label: "Aksiyonlar", href: "/denetim/actions" },
];
```

**After (i18n):**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function Navigation() {
  const t = useTranslations('navigation');
  
  const menuItems = [
    { label: t('menu.audits'), href: "/denetim/audits" },
    { label: t('menu.findings'), href: "/denetim/findings" },
    { label: t('menu.actions'), href: "/denetim/actions" },
  ];
}
```

---

### **Pattern 7: Page Titles**

**Before:**
```tsx
export default function AuditPage() {
  return (
    <div>
      <h1>Denetimler</h1>
      <p>Tüm denetimlerinizi buradan yönetebilirsiniz</p>
    </div>
  );
}
```

**After (i18n):**
```tsx
import { useTranslations } from 'next-intl';

export default function AuditPage() {
  const t = useTranslations('audit');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

---

### **Pattern 8: Confirmation Dialogs**

**Before:**
```tsx
<AlertDialog>
  <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
  <AlertDialogDescription>
    Bu işlem geri alınamaz.
  </AlertDialogDescription>
  <AlertDialogCancel>İptal</AlertDialogCancel>
  <AlertDialogAction>Onayla</AlertDialogAction>
</AlertDialog>
```

**After (i18n):**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function ConfirmDialog() {
  const t = useTranslations('common');
  
  return (
    <AlertDialog>
      <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
      <AlertDialogDescription>
        {t('cannotBeUndone')}
      </AlertDialogDescription>
      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
      <AlertDialogAction>{t('confirm')}</AlertDialogAction>
    </AlertDialog>
  );
}
```

---

## **🚀 MIGRATION CHECKLIST**

### **High Priority (Common Components):**
```
✅ StatusBadge - DONE
☐ Common Buttons (Create, Edit, Delete, Save, Cancel)
☐ Error Toast Messages
☐ Confirmation Dialogs
☐ Loading States
☐ Empty States
```

### **Medium Priority (Module Pages):**
```
☐ Audit List Page
☐ Action List Page
☐ Finding List Page
☐ DOF List Page
☐ Detail Pages
```

### **Low Priority (Forms):**
```
☐ Create Forms
☐ Edit Forms
☐ Filter Forms
☐ Search Inputs
```

---

## **📊 COMPLETED COMPONENTS**

### **1. StatusBadge** ✅

**File:** `src/components/ui/status-badge.tsx`

**Changes:**
- Added `'use client'` directive
- Imported status helper hooks
- Replaced static labels with translated labels
- Maintained color system (no changes)

**Usage:**
```tsx
<StatusBadge status="Assigned" type="action" />
// TR: Shows "Atandı" 
// EN: Shows "Assigned"
```

**Result:**
- ✅ Full i18n support
- ✅ Backward compatible
- ✅ Type-safe
- ✅ Auto-switches with language

---

## **🔧 HELPER FUNCTIONS**

### **Status Helpers**

**File:** `src/lib/i18n/status-helpers.ts`

**Available Hooks:**
```typescript
// Audit
const getLabel = useAuditStatusLabel();
getLabel('Active') // "Devam Ediyor" / "In Progress"

// Finding
const getLabel = useFindingStatusLabel();
getLabel('New') // "Yeni" / "New"

// Action
const getLabel = useActionStatusLabel();
getLabel('Assigned') // "Atandı" / "Assigned"

// DOF
const getLabel = useDofStatusLabel();
getLabel('Step1_Problem') // "1. Problem Tanımı" / "1. Problem Definition"

// Risk
const getLabel = useRiskTypeLabel();
getLabel('Yüksek') // "Yüksek" / "High"

// Activity
const getLabel = useActivityTypeLabel();
getLabel('Düzeltici') // "Düzeltici" / "Corrective"
```

---

## **📝 BEST PRACTICES**

### **DO ✅**

1. **Use hooks in client components:**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <Button>{t('actions.save')}</Button>;
}
```

2. **Group related translations:**
```tsx
const t = useTranslations('audit'); // All audit translations
const tCommon = useTranslations('common'); // Common translations
const tErrors = useTranslations('errors'); // Error messages
```

3. **Use status helpers for status labels:**
```tsx
const getStatusLabel = useActionStatusLabel();
<Badge>{getStatusLabel(status)}</Badge>
```

### **DON'T ❌**

1. **Don't hardcode strings:**
```tsx
❌ <Button>Kaydet</Button>
✅ <Button>{t('actions.save')}</Button>
```

2. **Don't use translations in Server Components without proper setup:**
```tsx
❌ 'use server';
    const t = useTranslations(); // Won't work

✅ import { useTranslations } from 'next-intl';
   function ServerComponent() {
     const t = useTranslations('common');
     // Works!
   }
```

3. **Don't mix static and translated content:**
```tsx
❌ <Badge>{"Status: " + t('status')}</Badge>
✅ <Badge>{t('status')}</Badge>
```

---

## **🎯 NEXT STEPS**

### **Phase 3.1: Status Integration** ✅
```
✅ Create status.json (TR + EN)
✅ Create status-helpers.ts
✅ Update StatusBadge component
```

### **Phase 3.2: Common Components** (Next)
```
☐ Update Button components
☐ Update Dialog components
☐ Update Toast messages
☐ Update Loading states
```

### **Phase 3.3: Page Integration**
```
☐ Audit module pages
☐ Action module pages
☐ Finding module pages
☐ DOF module pages
```

### **Phase 3.4: Form Integration**
```
☐ Create forms
☐ Edit forms
☐ Filter components
☐ Search components
```

---

## **💡 TIPS & TRICKS**

### **Dynamic Translations:**
```tsx
// With variables
t('validation.minLength', { min: 5 })
// Output: "En az 5 karakter olmalıdır"

// With entity name
t('api.notFound', { entity: 'User' })
// Output: "User bulunamadı"
```

### **Plural Forms:**
```tsx
t('items.count', { count: 3 })
// TR: "3 öğe"
// EN: "3 items"
```

### **Rich Text:**
```tsx
t.rich('text.bold', {
  b: (chunks) => <strong>{chunks}</strong>
})
```

---

## **📚 RESOURCES**

```
✅ src/i18n/README.md - Full i18n documentation
✅ I18N-IMPLEMENTATION-PLAN.md - Complete plan
✅ src/i18n/locales/ - All translation files
✅ src/lib/i18n/ - Helper functions
```

---

**INTEGRATION STARTED! FIRST COMPONENT UPDATED! 🎉**

**Next:** Update common buttons and error messages
