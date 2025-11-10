# 🗑️ **ESKİ ROL SİSTEMİ SİLİNMELİ**

## 📋 **MANUEL İŞLEMLER**

### **1. Bu Dosyayı Sil:**
```
src/drizzle/schema/role.ts
```

**Neden:** Deprecated legacy role system. Yeni `role-system.ts` kullanılıyor.

---

### **2. User Schema'dan Role Relation Kaldır**

**Dosya:** `src/drizzle/schema/user.ts`

**Kaldırılacak satırlar:**
```typescript
// Bu relation'ı bul ve SİL:
export const userRelations = relations(user, ({ one, many }) => ({
  role: one(role, {  // <-- Bu satırı kaldır
    fields: [user.id],
    references: [role.userId],
    relationName: "user_role",
  }),
  // ... diğer relations kalsın
}));
```

---

### **3. Schema Index'ten Role Export Kaldır**

**Dosya:** `src/drizzle/schema/index.ts`

**Kaldırılacak satır:**
```typescript
export * from "./role";  // <-- Bu satırı SİL veya comment yap
```

---

### **4. Migration Oluştur**

```powershell
pnpm run db:generate
```

Bu:
- Role tablosunu DROP edecek migration oluşturur
- User tablosundan role_id foreign key'i kaldırır

---

### **5. Migration Çalıştır**

```powershell
pnpm run db:migrate
```

---

### **6. Seed Test Et**

```powershell
pnpm run seed:fresh
```

---

## ✅ **KONTROL LİSTESİ**

- [ ] `role.ts` dosyası silindi
- [ ] User schema'dan role relation kaldırıldı
- [ ] Schema index'ten role export kaldırıldı
- [ ] Migration oluşturuldu
- [ ] Migration çalıştırıldı
- [ ] Seed başarılı çalıştı
- [ ] Login test edildi
- [ ] Menu görünürlüğü test edildi

---

## 🎯 **SONUÇ**

Eski role sistemi tamamen kaldırıldıktan sonra:

**KALAN:**
- ✅ `role-system.ts` (YENİ sistem)
- ✅ `Roles`, `UserRoles`, `Permissions`, `RolePermissions`, `RoleMenus` tabloları
- ✅ Role-based menu sistemi

**SİLİNEN:**
- ❌ `role.ts` (ESKİ sistem)
- ❌ `Role` tablosu
- ❌ User.role relation

**Status:** 🟢 Tam geçiş tamamlandı!
