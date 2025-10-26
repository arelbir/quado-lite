# 🔍 **NOT-FOUND SORUNU - DETAYLI ANALİZ**

**Tarih:** 2025-01-26  
**Sorun:** View Details butonları `/not-found` sayfasına yönlendiriyor

---

## 🚨 **TESPİT EDİLEN SORUNLAR**

### **1. PORT UYUŞMAZLIĞI (KRİTİK!)**

```
Kullanıcı erişimi:  http://localhost:3000/admin/users
Server çalışıyor:   http://localhost:3001
```

**Sebep:** Port 3000 zaten kullanımda, Next.js otomatik 3001'e geçti

**Çözüm:**
```powershell
# Option 1: Port 3000'i kullan
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
pnpm dev

# Option 2: Browser'da doğru port'u kullan
http://localhost:3001/admin/users
```

---

### **2. userRoles RELATION SORUNU**

**Dosya:** `app/(main)/admin/users/[id]/page.tsx`

**Kod (Line 51-55):**
```typescript
userRoles: {
  with: {
    role: true,
  },
},
```

**Sorun:** `userRoles` relation'ı query'de kullanılıyor ama Drizzle düzgün resolve edemeyebilir

**Test:**
```bash
# Browser Console'da kontrol et
http://localhost:3001/admin/users/{bir-user-id}
```

---

## 📋 **DETAIL SAYFALARI DURUMU**

### **✅ MEVCUT DETAIL SAYFALARI**

#### **Admin Module:**
1. ✅ `/admin/users/[id]` - User detail
2. ✅ `/admin/roles/[id]` - Role detail
3. ✅ `/admin/organization/companies/[id]` - Company detail
4. ✅ `/admin/organization/branches/[id]` - Branch detail
5. ✅ `/admin/organization/departments/[id]` - Department detail
6. ✅ `/admin/organization/positions/[id]` - Position detail

#### **Denetim Module:**
7. ✅ `/denetim/audits/[id]` - Audit detail
8. ✅ `/denetim/findings/[id]` - Finding detail
9. ✅ `/denetim/actions/[id]` - Action detail
10. ✅ `/denetim/dofs/[id]` - DOF detail
11. ✅ `/denetim/plans/[id]` - Plan detail
12. ✅ `/denetim/question-banks/[id]` - Question Bank detail
13. ✅ `/denetim/templates/[id]` - Template detail

**Toplam:** 13 detail sayfası mevcut ✅

---

## 🔧 **COLUMNS.TSX PATTERN ANALİZİ**

### **Sorunlu Pattern (window.location.href):**

```typescript
// ❌ BAD - Hard-coded navigation
<DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.id}`}>
  <Eye className="mr-2 h-4 w-4" />
  View Details
</DropdownMenuItem>
```

**Sorunlar:**
1. Full page reload
2. Client-side routing kullanmıyor
3. Next.js prefetch çalışmıyor

---

### **✅ DOĞRU PATTERN (Next.js Link + useRouter):**

```typescript
import { useRouter } from "next/navigation";

export const createColumns = (...) => {
  // Client component içinde
  const router = useRouter();
  
  return [{
    id: "actions",
    cell: ({ row }) => {
      const handleViewDetails = () => {
        router.push(`/admin/users/${row.original.id}`);
      };
      
      return (
        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
      );
    }
  }];
};
```

**Ya da:**
```typescript
<DropdownMenuItem asChild>
  <Link href={`/admin/users/${row.original.id}`}>
    <Eye className="mr-2 h-4 w-4" />
    View Details
  </Link>
</DropdownMenuItem>
```

---

## 🎯 **TÜM COLUMNS DOSYALARI KONTROLÜ**

Hangi modüllerde `window.location.href` kullanılıyor kontrol etmeliyiz:

### **Kontrol Edilmesi Gerekenler:**
- [ ] `/admin/users/columns.tsx`
- [ ] `/admin/roles/columns.tsx`
- [ ] `/admin/organization/companies/columns.tsx`
- [ ] `/admin/organization/branches/columns.tsx`
- [ ] `/admin/organization/departments/columns.tsx`
- [ ] `/admin/organization/positions/columns.tsx`
- [ ] `/denetim/audits/columns.tsx`
- [ ] `/denetim/findings/columns.tsx`
- [ ] `/denetim/actions/columns.tsx`
- [ ] `/denetim/dofs/columns.tsx`

---

## 🔍 **ROOT CAUSE ANALİZİ**

### **Neden `/not-found` Sayfasına Gidiyor?**

1. **Port Mismatch:**
   - Server: `localhost:3001`
   - Browser: `localhost:3000`
   - Result: Connection refused → 404

2. **Relation Query Error:**
   - `userRoles` relation fetch edilemiyor
   - `notFound()` fonksiyonu çağrılıyor (line 60)
   - Next.js `/not-found` sayfasına yönlendiriyor

3. **Hard-coded Navigation:**
   - `window.location.href` kullanılıyor
   - Next.js routing bypass ediliyor
   - Prefetch çalışmıyor

---

## ✅ **ÇÖZÜM ADIMLARI**

### **Step 1: Port Sorununu Çöz**
```powershell
# Terminal'i kapat ve tekrar başlat
pnpm dev
# http://localhost:3000 kullanılabilir olacak
```

### **Step 2: Browser'ı Doğru Port'a Yönlendir**
```
http://localhost:3001/admin/users
```

### **Step 3: Columns Pattern'i Düzelt**
```typescript
// users/columns.tsx - FIX
import Link from "next/link";

<DropdownMenuItem asChild>
  <Link href={`/admin/users/${user.id}`}>
    <Eye className="mr-2 h-4 w-4" />
    View Details
  </Link>
</DropdownMenuItem>
```

### **Step 4: userRoles Query Test**
```bash
# Browser'da test et
http://localhost:3001/admin/users/[valid-user-id]

# Console'da hata var mı kontrol et
```

---

## 📊 **SORUN DAĞILIMI**

| Kategori | Sorun | Öncelik | Durum |
|----------|-------|---------|-------|
| Port Mismatch | Server 3001, Browser 3000 | 🔴 Yüksek | Tespit edildi |
| Navigation Pattern | window.location.href kullanımı | 🟡 Orta | Tespit edildi |
| Relation Query | userRoles fetch hatası | 🟡 Orta | Test gerekli |
| Missing Pages | Detail sayfaları yok mu? | ✅ Hayır | Tüm sayfalar mevcut |

---

## 🚀 **NEXT STEPS**

1. **İlk:** Port sorununu çöz
2. **İkinci:** http://localhost:3001 kullan
3. **Üçüncü:** Columns pattern'ini düzelt
4. **Dördüncü:** userRoles query'i test et
5. **Beşinci:** Tüm modülleri kontrol et

---

## 🎯 **BEKLENEN SONUÇ**

**Şu an:**
```
/admin/users → View Details → /not-found ❌
```

**Olması gereken:**
```
/admin/users → View Details → /admin/users/[id] ✅
```

---

**🔧 İlk adım: Doğru port'u kullan!**
**🔗 URL:** `http://localhost:3001/admin/users`
