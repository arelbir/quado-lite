# 🌍 i18n (Internationalization) Setup

## **Status:** ✅✅ Phase 1 & 2 Complete - All Translations Ready!

---

## **Supported Languages**

```
🇹🇷 Türkçe (TR) - Default
🇬🇧 English (EN)
```

---

## **File Structure**

```
src/i18n/
├── config.ts                    # Locale configuration
├── request.ts                   # Server-side request config
└── locales/
    ├── tr/
    │   ├── common.json          # ✅ Ready (40+ translations)
    │   ├── errors.json          # ✅ Ready (30+ errors)
    │   ├── navigation.json      # ✅ Ready (Menu & breadcrumb)
    │   ├── audit.json           # ✅ Ready (Audit module)
    │   ├── action.json          # ✅ Ready (Action/CAPA)
    │   ├── finding.json         # ✅ Ready (Findings)
    │   ├── dof.json             # ✅ Ready (DOF/CAPA)
    │   └── reports.json         # ✅ Ready (Reports)
    └── en/
        ├── common.json          # ✅ Ready
        ├── errors.json          # ✅ Ready
        ├── navigation.json      # ✅ Ready
        ├── audit.json           # ✅ Ready
        ├── action.json          # ✅ Ready
        ├── finding.json         # ✅ Ready
        ├── dof.json             # ✅ Ready
        └── reports.json         # ✅ Ready
```

---

## **Usage**

### **Client Components**

```typescript
'use client';

import { useTranslations } from '@/lib/i18n/hooks';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <div>
      <button>{t('actions.save')}</button>
      <p>{t('status.loading')}</p>
    </div>
  );
}
```

### **Server Components**

```typescript
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
```

### **With Variables**

```typescript
// Translation: "En az {min} karakter olmalıdır"
const t = useTranslations('errors');
const message = t('validation.minLength', { min: 5 });
// Output: "En az 5 karakter olmalıdır"
```

### **Error Messages**

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('errors');

// Auth errors
t('auth.unauthorized')
t('auth.sessionExpired')

// Validation errors
t('validation.required')
t('validation.email')
t('validation.minLength', { min: 5 })

// API errors
t('api.serverError')
t('api.notFound', { entity: 'User' })
```

---

## **Language Switcher**

Add to your header/navbar:

```typescript
import { LanguageSwitcher } from '@/components/language-switcher';

export function Header() {
  return (
    <header>
      {/* ... other header content ... */}
      <LanguageSwitcher />
    </header>
  );
}
```

---

## **Available Translations**

### **common.json** (40+ translations)
```
- app.name, app.description
- actions.* (create, edit, delete, save, submit, approve, reject, etc.)
- status.* (loading, success, error, processing, etc.)
- common.* (yes, no, confirm, confirmDelete, etc.)
```

### **errors.json** (30+ errors)
```
- auth.* (unauthorized, sessionExpired, etc.)
- validation.* (required, email, minLength, maxLength, etc.)
- api.* (serverError, networkError, notFound, etc.)
- database.* (connectionError, duplicateEntry, etc.)
- file.* (uploadFailed, fileTooLarge, etc.)
```

### **navigation.json** ✅ NEW
```
- menu.* (dashboard, audits, findings, actions, dofs, reports, etc.)
- breadcrumb.* (home, details, edit, create, etc.)
- tabs.* (overview, details, timeline, documents, etc.)
```

### **audit.json** ✅ NEW
```
- fields.* (title, description, auditor, department, status, etc.)
- status.* (draft, planned, inProgress, completed, cancelled)
- types.* (internal, external, supplier, process, compliance)
- messages.* (created, updated, deleted, etc.)
- sections.* (overview, findings, team, timeline, etc.)
```

### **action.json** ✅ NEW
```
- fields.* (title, responsiblePerson, dueDate, status, type, priority, etc.)
- status.* (assigned, inProgress, pendingApproval, completed, rejected, cancelled)
- types.* (corrective, preventive, improvement, followUp)
- priority.* (low, medium, high, critical)
- messages.* (created, completed, approved, rejected, etc.)
```

### **finding.json** ✅ NEW
```
- fields.* (title, audit, type, severity, processOwner, rootCause, etc.)
- status.* (open, assigned, inProgress, pendingClosure, closed, rejected)
- types.* (majorNC, minorNC, observation, opportunity, compliance)
- severity.* (critical, high, medium, low)
- messages.* (created, assigned, closed, etc.)
```

### **dof.json** ✅ NEW (Largest - 100+ translations!)
```
- fields.* (problemTitle, finding, status, responsiblePerson, etc.)
- status.* (step1 through step7, completed, rejected)
- steps.*.* (7-step CAPA process with all fields)
  - step1: Problem Definition (5W1H)
  - step2: Temporary Measures
  - step3: Root Cause Analysis
  - step4: Activity Planning
  - step5: Implementation
  - step6: Effectiveness Check
  - step7: Manager Approval
- activities.* (title, add, edit, complete, status, etc.)
- messages.* (created, submitted, approved, rejected, etc.)
```

### **reports.json** ✅ NEW
```
- types.* (audit, finding, action, dof, summary, detailed, custom)
- formats.* (pdf, excel, csv)
- sections.* (header, overview, summary, details, statistics, etc.)
- audit.* (auditInfo, findings, actions, etc.)
- action.* (actionInfo, progress, timeline, etc.)
- dof.* (dofInfo, activities, rootCause, effectiveness, etc.)
- summary.* (total, open, closed, overdue, trends, etc.)
```

---

## **✅ Implementation Complete!**

### **Phase 1: Infrastructure** ✅
- next-intl installed & configured
- Middleware integration
- Language switcher component
- Base translation files

### **Phase 2: Module Translations** ✅
- Navigation (menu, breadcrumb, tabs)
- Audit module (full translations)
- Action module (CAPA workflow)
- Finding module (all statuses & types)
- DOF module (7-step process)
- Reports module (all report types)

### **Total:** 400+ translations in 8 files × 2 languages = 800+ strings!

---

## **TypeScript Support**

Types are automatically generated from translation files:

```typescript
// Full autocomplete and type safety
t('actions.save')  // ✅ Valid
t('actions.foo')   // ❌ TypeScript error
```

---

## **Testing**

Test both locales:

```bash
# Turkish (default)
http://localhost:3000/denetim

# English
http://localhost:3000/en/denetim
```

---

## **Migration Pattern**

```typescript
// BEFORE
<button>Kaydet</button>

// AFTER
const t = useTranslations('common');
<button>{t('actions.save')}</button>
```

---

**Documentation:** https://next-intl-docs.vercel.app/
