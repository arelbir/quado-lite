# 🌍 ÇOKLU DİL DESTEĞI (i18n) - IMPLEMENTATION PLAN

## **Status:** PLANNING
## **Öncelik:** HIGH
## **Tahmini Süre:** 8-12 saat

---

## **🎯 HEDEFLER**

### **Ana Hedefler:**
```
✅ Türkçe (TR) - Default
✅ İngilizce (EN) - Secondary
✅ Tüm UI metinleri
✅ Tüm hata mesajları
✅ PDF raporları
✅ Email şablonları
✅ Dinamik içerik (status labels, etc.)
```

### **Kapsam:**
```
1. UI Components (buttons, labels, placeholders)
2. Error Messages (validation, auth, API)
3. Success Messages (toasts, notifications)
4. Form Labels & Validation
5. Table Headers & Columns
6. PDF Reports
7. Email Templates
8. Status Labels
9. Navigation Menu
```

---

## **📚 TEKNOLOJİ SEÇİMİ**

### **Önerilen: next-intl** ⭐
```
✅ Next.js 15 native support
✅ App Router optimized
✅ Server & Client components
✅ TypeScript support
✅ Type-safe translations
✅ Performance optimized
✅ SEO friendly
```

### **Alternatifler:**
```
- react-i18next (geleneksel)
- next-i18next (eski versiyon)
- Format.js (kompleks)
```

---

## **🏗️ DOSYA YAPISI**

### **Önerilen Yapı:**
```
src/
├── i18n/
│   ├── config.ts                    # i18n konfigürasyonu
│   ├── request.ts                   # Middleware integration
│   └── locales/                     # Dil dosyaları
│       ├── tr/
│       │   ├── common.json          # Genel metinler
│       │   ├── auth.json            # Auth mesajları
│       │   ├── errors.json          # Hata mesajları
│       │   ├── validation.json      # Validasyon mesajları
│       │   ├── audit.json           # Denetim modülü
│       │   ├── action.json          # Aksiyon modülü
│       │   ├── finding.json         # Bulgu modülü
│       │   ├── dof.json             # DÖF modülü
│       │   ├── reports.json         # Raporlar
│       │   ├── email.json           # Email şablonları
│       │   └── navigation.json      # Menü & navigation
│       └── en/
│           ├── common.json
│           ├── auth.json
│           ├── errors.json
│           └── ... (same structure)
│
├── lib/
│   └── i18n/
│       ├── hooks.ts                 # useTranslations hook
│       ├── server.ts                # Server-side i18n
│       └── types.ts                 # Type definitions
│
├── middleware.ts                    # Language detection
│
└── app/
    └── [locale]/                    # Locale routing
        └── (main)/
            └── ... (existing pages)
```

---

## **📋 IMPLEMENTATION PHASES**

### **PHASE 1: Setup & Infrastructure (2 saat)**

#### **Step 1.1: Install Dependencies**
```bash
pnpm add next-intl
```

#### **Step 1.2: i18n Config**
**File:** `src/i18n/config.ts`
```typescript
export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
};
```

#### **Step 1.3: Middleware**
**File:** `src/middleware.ts` (update existing)
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // /en/... sadece gerektiğinde
});

export default function middleware(request: NextRequest) {
  // First: i18n
  const response = intlMiddleware(request);
  
  // Then: existing auth middleware
  // ... your auth logic
  
  return response;
}
```

#### **Step 1.4: Request Config**
**File:** `src/i18n/request.ts`
```typescript
import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) {
    locale = 'tr';
  }

  return {
    messages: (await import(`./locales/${locale}/common.json`)).default,
  };
});
```

---

### **PHASE 2: Translation Files (3 saat)**

#### **Step 2.1: Common Translations**
**File:** `src/i18n/locales/tr/common.json`
```json
{
  "app": {
    "name": "Denetim Yönetim Sistemi",
    "description": "ISO Denetim ve CAPA Yönetimi"
  },
  "actions": {
    "create": "Oluştur",
    "edit": "Düzenle",
    "delete": "Sil",
    "cancel": "İptal",
    "save": "Kaydet",
    "submit": "Gönder",
    "approve": "Onayla",
    "reject": "Reddet",
    "close": "Kapat",
    "download": "İndir",
    "upload": "Yükle",
    "export": "Dışa Aktar",
    "import": "İçe Aktar",
    "search": "Ara",
    "filter": "Filtrele",
    "clear": "Temizle"
  },
  "status": {
    "loading": "Yükleniyor...",
    "saving": "Kaydediliyor...",
    "success": "Başarılı!",
    "error": "Hata!",
    "noData": "Veri bulunamadı"
  }
}
```

**File:** `src/i18n/locales/en/common.json`
```json
{
  "app": {
    "name": "Audit Management System",
    "description": "ISO Audit and CAPA Management"
  },
  "actions": {
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "cancel": "Cancel",
    "save": "Save",
    "submit": "Submit",
    "approve": "Approve",
    "reject": "Reject",
    "close": "Close",
    "download": "Download",
    "upload": "Upload",
    "export": "Export",
    "import": "Import",
    "search": "Search",
    "filter": "Filter",
    "clear": "Clear"
  },
  "status": {
    "loading": "Loading...",
    "saving": "Saving...",
    "success": "Success!",
    "error": "Error!",
    "noData": "No data found"
  }
}
```

#### **Step 2.2: Error Messages**
**File:** `src/i18n/locales/tr/errors.json`
```json
{
  "auth": {
    "unauthorized": "Yetkiniz yok",
    "sessionExpired": "Oturumunuz sona erdi",
    "invalidCredentials": "Geçersiz kullanıcı adı veya şifre",
    "userNotFound": "Kullanıcı bulunamadı"
  },
  "validation": {
    "required": "Bu alan zorunludur",
    "email": "Geçerli bir e-posta adresi giriniz",
    "minLength": "En az {min} karakter olmalıdır",
    "maxLength": "En fazla {max} karakter olmalıdır",
    "invalidFormat": "Geçersiz format",
    "dateInvalid": "Geçersiz tarih"
  },
  "api": {
    "serverError": "Sunucu hatası. Lütfen daha sonra tekrar deneyiniz",
    "networkError": "Bağlantı hatası. İnternet bağlantınızı kontrol ediniz",
    "notFound": "{entity} bulunamadı",
    "alreadyExists": "{entity} zaten mevcut",
    "operationFailed": "İşlem başarısız oldu"
  }
}
```

#### **Step 2.3: Module-Specific**
**File:** `src/i18n/locales/tr/audit.json`
```json
{
  "title": "Denetimler",
  "create": "Yeni Denetim",
  "fields": {
    "title": "Denetim Başlığı",
    "description": "Açıklama",
    "auditor": "Denetçi",
    "department": "Departman",
    "startDate": "Başlangıç Tarihi",
    "endDate": "Bitiş Tarihi",
    "status": "Durum"
  },
  "status": {
    "draft": "Taslak",
    "inProgress": "Devam Ediyor",
    "completed": "Tamamlandı",
    "cancelled": "İptal Edildi"
  },
  "messages": {
    "created": "Denetim başarıyla oluşturuldu",
    "updated": "Denetim güncellendi",
    "deleted": "Denetim silindi",
    "notFound": "Denetim bulunamadı"
  }
}
```

---

### **PHASE 3: Integration (2 saat)**

#### **Step 3.1: Layout Update**
**File:** `src/app/[locale]/layout.tsx` (NEW)
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### **Step 3.2: Component Usage**
**Client Component:**
```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <button>{t('actions.create')}</button>
  );
}
```

**Server Component:**
```typescript
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('audit');
  
  return (
    <h1>{t('title')}</h1>
  );
}
```

#### **Step 3.3: Language Switcher**
**File:** `src/components/language-switcher.tsx`
```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <select value={locale} onChange={(e) => switchLocale(e.target.value)}>
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeFlags[loc]} {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
```

---

### **PHASE 4: Migration Strategy (2-3 saat)**

#### **Priority Order:**
```
1. ✅ Common UI (buttons, labels)
2. ✅ Error messages (validation, API)
3. ✅ Navigation menu
4. ✅ Auth pages
5. ✅ Audit module
6. ✅ Action module
7. ✅ Finding module
8. ✅ DOF module
9. ✅ Reports
10. ✅ Emails
```

#### **Migration Pattern:**
```typescript
// BEFORE
<button>Kaydet</button>

// AFTER
const t = useTranslations('common');
<button>{t('actions.save')}</button>
```

---

## **🎨 UI ÖRNEKLERI**

### **Language Switcher Component:**
```tsx
// Header'a eklenecek
<LanguageSwitcher />
```

### **Error Display:**
```typescript
// BEFORE
toast.error("İşlem başarısız oldu");

// AFTER
const t = useTranslations('errors');
toast.error(t('api.operationFailed'));
```

### **Form Validation:**
```typescript
// Zod schema with i18n
const t = useTranslations('validation');

const schema = z.object({
  title: z.string().min(1, t('required')),
  email: z.string().email(t('email')),
});
```

---

## **📊 TRANSLATION FILE STRUCTURE**

### **Complete File List:**
```
tr/
├── common.json          (Genel: buttons, labels)
├── errors.json          (Hatalar: validation, API)
├── validation.json      (Form validasyonları)
├── auth.json            (Login, register, permissions)
├── navigation.json      (Menu items, breadcrumbs)
├── audit.json           (Audit module)
├── action.json          (CAPA actions)
├── finding.json         (Findings)
├── dof.json             (DOF/CAPA)
├── reports.json         (PDF reports)
├── email.json           (Email templates)
├── notifications.json   (Toast messages)
└── status-labels.json   (Status labels - merkezi sistem)

en/
└── ... (same structure)
```

---

## **🔧 TECHNICAL DETAILS**

### **Type Safety:**
```typescript
// Auto-generated types from translation files
type Messages = typeof import('./i18n/locales/tr/common.json');
type IntlMessages = Messages;

declare global {
  interface IntlMessages extends Messages {}
}
```

### **Dynamic Content:**
```typescript
// With variables
t('validation.minLength', { min: 5 })
// Output: "En az 5 karakter olmalıdır"

// Pluralization
t('items.count', { count: 3 })
// Output: "3 öğe"

// Rich text
t.rich('text.bold', {
  b: (chunks) => <strong>{chunks}</strong>
})
```

---

## **📈 MIGRATION TIMELINE**

### **Week 1: Infrastructure**
```
Day 1-2: Setup & Config
- Install next-intl
- Create file structure
- Configure middleware
- Setup locale routing

Day 3-4: Common Translations
- common.json
- errors.json
- validation.json
- navigation.json
```

### **Week 2: Modules**
```
Day 5-6: Auth & Core
- auth.json
- User management
- Permissions

Day 7-8: Main Modules
- audit.json
- action.json
- finding.json
- dof.json
```

### **Week 3: Reports & Polish**
```
Day 9-10: Reports & Emails
- reports.json
- email.json
- PDF templates

Day 11-12: Testing & Refinement
- Test all pages
- Fix missing translations
- Performance optimization
```

---

## **✅ CHECKLIST**

### **Before Starting:**
```
☐ Review current hard-coded strings
☐ List all error messages
☐ Identify dynamic content
☐ Plan routing strategy
☐ Choose translation tool
```

### **During Implementation:**
```
☐ Create translation files
☐ Update middleware
☐ Add locale routing
☐ Create language switcher
☐ Migrate components
☐ Test both languages
```

### **After Completion:**
```
☐ Full application test
☐ SEO optimization
☐ Performance check
☐ Documentation
☐ User guide (language switching)
```

---

## **🎯 BEST PRACTICES**

### **Translation Keys:**
```typescript
// ✅ GOOD - Hierarchical & descriptive
t('audit.fields.title')
t('errors.validation.required')
t('actions.create')

// ❌ BAD - Flat & unclear
t('title')
t('error1')
t('btn')
```

### **Avoid:**
```typescript
// ❌ ANTI-PATTERN
const text = locale === 'tr' ? 'Kaydet' : 'Save';

// ✅ CORRECT
const t = useTranslations('common');
const text = t('actions.save');
```

---

## **💡 BONUS FEATURES**

### **Future Enhancements:**
```
☐ Language detection (browser)
☐ User preference storage
☐ RTL support (Arabic)
☐ Date/time localization
☐ Number formatting
☐ Currency formatting
☐ Timezone handling
```

---

## **📚 RESOURCES**

### **Documentation:**
```
- next-intl: https://next-intl-docs.vercel.app/
- Next.js i18n: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- ICU Message Format: https://unicode-org.github.io/icu/userguide/format_parse/messages/
```

---

## **🚀 NEXT STEPS**

### **Decision Required:**
```
1. Approve plan? (Y/N)
2. Start with Phase 1? (Y/N)
3. Which languages to support?
   ☐ TR + EN (recommended)
   ☐ Add more?
4. Timeline acceptable? (3 weeks)
```

---

**HAZIRIZ! BAŞLAYALIM MI? 🌍**

**ÖNERİM:** Phase 1'den (Setup & Infrastructure) başlayalım - 2 saat!
