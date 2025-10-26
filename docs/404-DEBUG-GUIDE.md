# 🔍 **404 HATA DEBUG GUIDE**

**Tarih:** 2025-01-26  
**Sorun:** `/admin/users/[id]` → `/not-found` yönlendiriyor

---

## 🚨 **HIZLI TEST**

### **1. Port Kontrolü:**
```
❌ http://localhost:3000/admin/users
✅ http://localhost:3001/admin/users  ← SERVER BURDA!
```

**Server log:** `Local: http://localhost:3001`

---

### **2. User ID Test:**

#### **Geçerli User ID Bul:**
```sql
-- Database'de query çalıştır
SELECT id, name, email FROM "User" LIMIT 5;
```

#### **Test URL:**
```
http://localhost:3001/admin/users/[REAL_USER_ID]
```

**ÖRNEK:**
```
http://localhost:3001/admin/users/cm5a1b2c3-1234-5678-9abc-def012345678
```

---

## 🔍 **OLASI SEBEPLER**

### **1. Port Mismatch (EN MUHTEMEL!)**
```
Server:  Port 3001
Browser: Port 3000 ❌
```

**Çözüm:** Browser'da `localhost:3001` kullan

---

### **2. Hatalı User ID**
```typescript
// page.tsx Line 37
const userDetail = await db.query.user.findFirst({
  where: eq(user.id, params.id), // ← params.id hatalı?
});

if (!userDetail) {
  notFound(); // ← Buraya giriyor!
}
```

**Kontrol:**
- User ID UUID formatında mı?
- Database'de bu user var mı?

---

### **3. userRoles Relation Hatası**
```typescript
// page.tsx Line 51-55
userRoles: {
  with: {
    role: true,  // ← role table erişim var mı?
  },
},
```

**Olası hata:**
- `userRoles` table empty
- Relation tanımı eksik
- Role table'a foreign key sorunu

---

## 🧪 **DEBUG ADIMLARI**

### **Step 1: Console Log Ekle**

```typescript
// page.tsx - Line 36'dan sonra
console.log("🔍 DEBUG: Requested user ID:", params.id);

const userDetail = await db.query.user.findFirst({
  where: eq(user.id, params.id),
  with: {
    // ...
  },
});

console.log("🔍 DEBUG: User found:", userDetail ? "YES" : "NO");
console.log("🔍 DEBUG: User data:", JSON.stringify(userDetail, null, 2));

if (!userDetail) {
  console.log("❌ DEBUG: User not found, calling notFound()");
  notFound();
}
```

---

### **Step 2: Terminal'i İzle**

```bash
# Server terminal'de göreceksin:
🔍 DEBUG: Requested user ID: abc-123-...
🔍 DEBUG: User found: NO
❌ DEBUG: User not found, calling notFound()
```

---

### **Step 3: Database Kontrolü**

```sql
-- PostgreSQL
SELECT 
  id, 
  name, 
  email, 
  status,
  "createdAt"
FROM "User"
WHERE status = 'active'
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Sonuç:**
- User ID'lerini kopyala
- Browser'da test et

---

## 🎯 **HIZLI FIX**

### **Option 1: Doğru Port Kullan**
```
✅ http://localhost:3001/admin/users
```

---

### **Option 2: Users Listesinden Git**
```
1. http://localhost:3001/admin/users açıl
2. Listede bir user seç
3. ⋮ menüsünden "View Details" tıkla
4. Otomatik doğru ID ile açılır
```

---

### **Option 3: Server Restart**
```powershell
# Port 3000'i serbest bırak
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Server'ı yeniden başlat
pnpm dev
```

---

## 📊 **ERROR FLOW**

```mermaid
Browser Request
    ↓
http://localhost:3000/admin/users/[id]  ❌ Wrong Port
    ↓
Connection Refused
    ↓
404 Error
    ↓
/not-found page
```

**vs**

```mermaid
Browser Request
    ↓
http://localhost:3001/admin/users/[id]  ✅ Correct Port
    ↓
Server Fetches User
    ↓
userDetail found?
    ├─ YES → User Detail Page ✅
    └─ NO  → notFound() → /not-found
```

---

## 🔧 **GEÇİCİ DEBUG VERSION**

```typescript
// src/app/(main)/admin/users/[id]/page.tsx
export default async function UserDetailPage({ params }: { params: { id: string } }) {
  
  // 🔍 DEBUG LOGS
  console.log("=" .repeat(50));
  console.log("🔍 USER DETAIL PAGE DEBUG");
  console.log("Requested ID:", params.id);
  console.log("=" .repeat(50));

  try {
    const userDetail = await db.query.user.findFirst({
      where: eq(user.id, params.id),
      with: {
        department: true,
        position: true,
        company: true,
        branch: true,
        manager: {
          columns: { id: true, name: true, email: true },
        },
        userRoles: {
          with: { role: true },
        },
      },
    });

    console.log("User Found:", !!userDetail);
    if (userDetail) {
      console.log("User Name:", userDetail.name);
      console.log("User Email:", userDetail.email);
      console.log("User Roles Count:", userDetail.userRoles?.length || 0);
    }
    console.log("=" .repeat(50));

    if (!userDetail) {
      console.log("❌ Calling notFound()");
      notFound();
    }

    return (
      // ... existing JSX
    );
    
  } catch (error) {
    console.error("🔥 ERROR in UserDetailPage:", error);
    throw error;
  }
}
```

---

## ✅ **ÇÖZÜM KONTROL LİSTESİ**

- [ ] Browser'da **localhost:3001** kullanıyorum
- [ ] User ID **geçerli** ve **database'de var**
- [ ] `/admin/users` listesinden **View Details** çalışıyor
- [ ] Terminal'de **error log** yok
- [ ] Console'da **debug log** görüyorum

---

## 🎯 **BEKLENEN SONUÇ**

**Şu an:**
```
/admin/users → View Details → /not-found ❌
```

**Olması gereken:**
```
http://localhost:3001/admin/users → View Details → /admin/users/[id] ✅
```

---

**🔧 İLK ADIM: DOĞRU PORT KULLAN!**  
**📍 URL:** `http://localhost:3001/admin/users`
