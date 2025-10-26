# 📋 **NEXT.JS 15 UPGRADE PLAN**

## 🎯 **KARAR: BEKLE (Önerilen)** ⭐

**Neden şimdi değil?**
- ✅ Next.js 14.2.3 stable ve support'ta
- ✅ Params Promise fix zaten yapıldı (Next.js 15'e hazırsın)
- ⚠️ Auth.js v5 çok yeni (risk)
- ⚠️ 2-5 gün iş yükü
- ⚠️ Proje kritik aşamada

**Ne zaman yükseltmeli?**
- 📅 **6-12 ay sonra** (Next.js 15.2+ çıktığında)
- 🔒 Auth.js v5 mature olduğunda
- 📚 Best practices oturduğunda

---

## 📊 **ETKİ ANALİZİ**

### **Breaking Changes:**

| Change | Dosya Sayısı | İş Yükü | Risk |
|--------|-------------|---------|------|
| **Params Promise** | 13 routes | ✅ YAPILDI | YOK |
| **Async cookies/headers** | ~20 dosya | 3-5 saat | ⚠️ ORTA |
| **API Route Changes** | ~10 routes | 2-3 saat | ⚠️ ORTA |
| **Auth Migration** | 5-10 dosya | 4-8 saat | 🔥 YÜKSEK |
| **Fetch Caching** | ~15 yer | 2-3 saat | ⚠️ ORTA |

**Toplam İş Yükü:** 16-34 saat (2-5 gün)

---

## 🔥 **EN RİSKLİ ALAN: AUTH SYSTEM**

### **Şu Anki Sistem:**
```typescript
// NextAuth v4 (Next.js 14 uyumlu)
import NextAuth from "next-auth";
```

### **Next.js 15 Gerektiriyor:**
```typescript
// Auth.js v5 (Breaking changes!)
import { auth } from "@auth/nextjs";
```

**Auth.js v5 Changes:**
- Configuration format değişti
- Provider setup farklı
- Session handling farklı
- Callbacks API değişti
- Middleware integration farklı

**Migration Risk:** 🔥🔥🔥 Çok Yüksek
**Estimated Time:** 8-16 saat

---

## 📋 **EĞER YÜKSELTMEYE KARAR VERİRSEN**

### **Phase 1: Hazırlık (1 gün)**

#### **1.1. Dependency Audit**
```bash
npm outdated
npm audit
```

#### **1.2. Compatibility Check**
```bash
# Dependencies Next.js 15 destekliyor mu?
npm info next-intl versions
npm info @auth/nextjs versions
npm info drizzle-orm versions
```

#### **1.3. Backup & Branch**
```bash
git checkout -b upgrade/nextjs-15
git push origin upgrade/nextjs-15
```

---

### **Phase 2: Upgrade (2-3 gün)**

#### **2.1. Next.js 15 Kurulumu**
```bash
# Core packages
npm install next@15 react@19 react-dom@19

# TypeScript types
npm install -D @types/react@19 @types/react-dom@19
```

#### **2.2. Dependency Updates**
```bash
# i18n
npm install next-intl@latest

# Auth (BREAKING CHANGE!)
npm uninstall next-auth
npm install @auth/nextjs @auth/drizzle-adapter

# ORM
npm install drizzle-orm@latest drizzle-kit@latest

# UI
npm install @radix-ui/react-*@latest
```

#### **2.3. Automated Codemod**
```bash
# Next.js resmi codemod tool
npx @next/codemod@latest upgrade

# Specific codemods
npx @next/codemod@15 async-request-api ./src
npx @next/codemod@15 replace-use-form-state ./src
```

---

### **Phase 3: Manual Fixes (2-3 gün)**

#### **3.1. Async Request APIs** (3-5 saat)

**Değiştirilmesi Gereken Dosyalar:**

```typescript
// ❌ BEFORE (Next.js 14)
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE');
}
```

```typescript
// ✅ AFTER (Next.js 15)
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();  // AWAIT!
  const locale = cookieStore.get('NEXT_LOCALE');
}
```

**Etkilenen Dosyalar:**
- `src/app/(main)/layout.tsx`
- `src/app/(main)/*/page.tsx` (20+ dosya)
- `src/components/layout/sidebar/index.tsx`
- `src/i18n/*` (i18n sistemi)

---

#### **3.2. Auth Migration** (8-16 saat) 🔥

**NextAuth v4 → Auth.js v5**

##### **A) auth.ts Refactor:**
```typescript
// ❌ BEFORE
import NextAuth from "next-auth";
import { authConfig } from "./config/auth";

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
```

```typescript
// ✅ AFTER
import NextAuth from "@auth/nextjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./drizzle/db";

export const { auth, signIn, signOut, handlers } = NextAuth({
  adapter: DrizzleAdapter(db),
  // Yeni config format
  providers: [
    // Farklı syntax
  ],
  callbacks: {
    // Farklı API
  },
});
```

##### **B) Middleware Update:**
```typescript
// src/middleware.ts - Tamamen değişecek
import { auth } from "./server/auth";

export default auth((req) => {
  // Yeni API
});
```

##### **C) Session Kullanımları:**
```typescript
// ❌ BEFORE
import { getServerSession } from "next-auth";

const session = await getServerSession(authOptions);
```

```typescript
// ✅ AFTER
import { auth } from "@/server/auth";

const session = await auth();  // Daha basit
```

---

#### **3.3. API Routes** (2-3 saat)

```typescript
// ❌ BEFORE
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
}
```

```typescript
// ✅ AFTER
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
}
```

**Etkilenen Dosyalar:**
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/get-user-permission/route.ts`
- `src/app/api/uploadthing/route.ts`

---

#### **3.4. Fetch Caching** (2-3 saat)

```typescript
// ❌ BEFORE (default cached)
const data = await fetch('https://api.example.com/data');

// ✅ AFTER (explicitly cache)
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache',  // or 'no-store'
  next: { revalidate: 3600 }  // 1 hour
});
```

**Audit Edilmesi Gereken:**
- Tüm `fetch()` çağrıları
- External API calls
- Database queries (Drizzle etkilenmez)

---

#### **3.5. Dynamic Routes** (ZATEN YAPILDI ✅)

```typescript
// ✅ Already fixed
params: Promise<{ id: string }>
const { id } = await params;
```

**13 route fix edilmeli:**
- ✅ /admin/users/[id]
- ⏳ /admin/organization/*/[id] (4 route)
- ⏳ /admin/roles/[id]
- ⏳ /denetim/*/[id] (6 route)

---

### **Phase 4: Testing (2-3 gün)**

#### **4.1. Unit Tests**
```bash
npm run test
```

#### **4.2. Manual Testing Checklist:**
- [ ] Login/Logout
- [ ] User management
- [ ] Dynamic routes (all 13)
- [ ] API routes
- [ ] File upload
- [ ] i18n (language switch)
- [ ] Permissions
- [ ] Audit flows
- [ ] Finding workflows
- [ ] Action workflows

#### **4.3. Performance Testing:**
```bash
# Lighthouse audit
npm run build
npm start
# Open Chrome DevTools → Lighthouse
```

---

## ⚠️ **RİSK MATRİSİ**

| Risk | Olasılık | Etki | Mitigation |
|------|----------|------|------------|
| **Auth patlar** | 🔴 Yüksek | 🔴 Kritik | Auth.js docs oku, staging test et |
| **Dependencies uyumsuz** | 🟡 Orta | 🟡 Orta | Önceden check et, alternatif bul |
| **Performance düşer** | 🟡 Orta | 🟡 Orta | Caching stratejisi gözden geçir |
| **i18n patlar** | 🟢 Düşük | 🟡 Orta | next-intl@latest test et |
| **Build fails** | 🟡 Orta | 🔴 Kritik | TypeScript strict check |

---

## 📚 **REFERANSLAR**

### **Official Docs:**
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Auth.js v5 Migration](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js 15 Codemods](https://nextjs.org/docs/app/building-your-application/upgrading/codemods)

### **Breaking Changes:**
- [Async Request APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Caching Defaults](https://nextjs.org/docs/app/building-your-application/caching)
- [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)

---

## 🎯 **FİNAL ÖNERİ**

### **ŞİMDİ YAPILACAKLAR:**

1. **✅ Params Promise Fix'i Tamamla** (Devam ediyor)
   - 13 dynamic route'u fix et
   - Bu seni Next.js 15'e hazırlar

2. **✅ Mevcut Projeni Stable Et**
   - Tüm features çalışıyor olsun
   - Production'a al

3. **✅ Dokümantasyon**
   - Kod temiz ve documented
   - Team onboarded

4. **⏸️ Next.js 15'i Bekle**
   - 6-12 ay sonra tekrar değerlendir
   - 15.2 veya 15.3 çıktığında (daha stable)
   - Auth.js v5 mature olduğunda

---

### **UPGRADE ZAMANI (Gelecekte):**

**Şu koşullar sağlanınca:**
- ✅ Next.js 15.2+ release oldu
- ✅ Auth.js v5 production-ready (community adoption yüksek)
- ✅ Kritik dependencies uyumlu
- ✅ 1-2 haftalık upgrade window'un var
- ✅ Dedicated testing zamanın var
- ✅ Rollback planın hazır

---

## 📝 **DECISION LOG**

**Date:** 2025-01-26  
**Decision:** ❌ Upgrade NOW  
**Rationale:**
- Mevcut versiyon (14.2.3) stable ve support'ta
- Params Promise fix zaten yapılıyor (Next.js 15'e hazır)
- Auth migration çok risky (8-16 saat + test)
- Proje kritik aşamada, risk almaya gerek yok
- 6-12 ay sonra daha uygun olacak

**Next Review:** 2025-07-01

---

**Status:** 📌 POSTPONED  
**Priority:** 🟡 LOW (Future Enhancement)  
**Risk:** 🔴 HIGH if done now | 🟢 LOW if done later

**Recommended:** ⏸️ **WAIT 6-12 MONTHS**
