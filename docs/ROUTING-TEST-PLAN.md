# 🧪 **ROUTING TEST PLAN**

## 🎯 **Test Amacı:**
User detail page'e erişilemiyor. Sorun tüm dynamic route'larda mı yoksa sadece users'da mı?

---

## ✅ **TEST 1: Companies Detail Page**

### **Adımlar:**
1. `http://localhost:3000/admin/organization/companies` aç
2. Bir company seç
3. View Details tıkla
4. Açılan URL: `/admin/organization/companies/[COMPANY_ID]`

### **Beklenen Sonuç:**
- ✅ Company detail page açılır → **Dynamic routing çalışıyor**
- ❌ 404 not-found → **Tüm dynamic route'larda sorun var**

---

## ✅ **TEST 2: Roles Detail Page**

### **Adımlar:**
1. `http://localhost:3000/admin/roles` aç
2. Bir role seç (eğer view details varsa)
3. URL: `/admin/roles/[ROLE_ID]`

### **Beklenen Sonuç:**
- ✅ Role detail page açılır → **Dynamic routing çalışıyor**
- ❌ 404 not-found → **Sorun tüm dynamic route'larda**

---

## ✅ **TEST 3: Direct URL Access**

### **Test A - Companies:**
```
http://localhost:3000/admin/organization/companies/[GERÇEK_COMPANY_ID]
```

**Beklenen:** 
- Company detail page açılır ✅
- 404 alıyorsan → Routing sorunu

---

### **Test B - Users:**
```
http://localhost:3000/admin/users/004fd62e-2a22-49ac-ab17-04c909a89e05
```

**Beklenen:**
- User detail page açılır ✅
- 404 alıyorsan → Sadece users'da sorun

---

## 📊 **SONUÇ SENARYOLARI**

### **SENARYO 1: Sadece Users Çalışmıyor**
```
Companies ✅ ÇALIŞIYOR
Roles     ✅ ÇALIŞIYOR
Users     ❌ 404
```

**Sebep:** `users/[id]/page.tsx` dosyasında syntax error veya import hatası

**Çözüm:**
- page.tsx'i silip yeniden oluştur
- Minimal version ile başla
- Imports tek tek ekle

---

### **SENARYO 2: Hiçbir Dynamic Route Çalışmıyor**
```
Companies ❌ 404
Roles     ❌ 404
Users     ❌ 404
```

**Sebep:** Next.js config veya build sorunu

**Çözüm:**
- `next.config.js` kontrol et
- TypeScript config kontrol et
- Full rebuild: `rm -rf .next && pnpm dev`

---

### **SENARYO 3: İlk Tıklamada 404, İkincide Açılıyor**
```
1. Tıklama ❌ 404
2. Tıklama ✅ Açılıyor
```

**Sebep:** Next.js prefetch/cache sorunu

**Çözüm:**
```typescript
// Link component'inde prefetch kapat
<Link href="/admin/users/[id]" prefetch={false}>
  View Details
</Link>
```

---

## 🔍 **DEBUG NOKTLARI**

### **1. Terminal Log Kontrol:**
```bash
# Dynamic route compile ediliyor mu?
○ Compiling /admin/users/[id] ...
✓ Compiled /admin/users/[id] in XXXms

# Yoksa sorun compile hatası
```

### **2. Browser Network Tab:**
```
# Hangi URL'ye istek atılıyor?
GET /admin/users/[id] → 200 ✅
GET /not-found → 404 ❌
```

### **3. Next.js Build Log:**
```bash
# Build sırasında route görünüyor mu?
Routes:
  ✓ /admin/users (static)
  ✓ /admin/users/[id] (dynamic)  ← BURASI OLMALI
```

---

## 🚀 **HIZLI TEST KOMUTU**

### **Test Script Oluştur:**

```typescript
// scripts/test-routes.ts
const routes = [
  '/admin/organization/companies/test-id',
  '/admin/roles/test-id',
  '/admin/users/test-id',
];

routes.forEach(route => {
  fetch(`http://localhost:3000${route}`)
    .then(res => console.log(route, res.status))
    .catch(err => console.error(route, err));
});
```

---

## 📋 **ŞİMDİ YAP**

1. **Companies test et:**
   ```
   http://localhost:3000/admin/organization/companies
   → Herhangi bir company → View Details
   ```

2. **Sonucu bildir:**
   - Açıldı mı? ✅
   - 404 aldın mı? ❌
   - Terminal log ne diyor?

3. **Users'ı tekrar dene:**
   ```
   http://localhost:3000/admin/users
   → User seç → View Details
   ```

---

**🎯 Test sonuçlarını bekl

iyorum!**

**Hangi senaryoya girdiğimizi anlamaya çalışıyoruz.**
