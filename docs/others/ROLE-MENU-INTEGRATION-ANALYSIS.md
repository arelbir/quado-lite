# 🔐 ROL-MENÜ ENTEGRASYON ANALİZİ

**Date:** 2025-01-26  
**Status:** 🔍 Analysis Phase  
**Priority:** 🔥 HIGH - Critical System Architecture

---

## 📊 **MEVCUT DURUM ANALİZİ**

### **1. ESKİ ROL YAPISI** ❌

```sql
-- Role tablosu (Deprecated - User'a 1-1 bağlı)
CREATE TABLE "Role" (
  id UUID PRIMARY KEY,
  name VARCHAR,
  userRole VARCHAR DEFAULT 'user',  -- admin, manager, auditor, user
  superAdmin BOOLEAN DEFAULT false,
  userId UUID UNIQUE REFERENCES "User"(id)  -- 1-to-1 relation
);
```

**Sorunlar:**
- ❌ Her user sadece 1 role
- ❌ Context-based roller yok (Department bazlı vs.)
- ❌ Time-limited roller yok
- ❌ Granular permissions yok
- ❌ Scalability düşük

---

### **2. YENİ ROL SİSTEMİ** ✅

```sql
-- Roles tablosu (Enterprise-grade)
CREATE TABLE "Roles" (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,  -- "SUPER_ADMIN", "QUALITY_MANAGER"
  category RoleCategory,  -- System, Functional, Project, Custom
  scope RoleScope,        -- Global, Company, Branch, Department
  isSystem BOOLEAN,       -- Protected roles
  isActive BOOLEAN
);

-- UserRoles (Many-to-Many junction)
CREATE TABLE "UserRoles" (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES "User"(id),
  roleId UUID REFERENCES "Roles"(id),
  contextType ContextType,  -- Global, Company, Branch, Department
  contextId UUID,           -- Which company/branch/dept?
  validFrom TIMESTAMP,      -- Time-based roles
  validTo TIMESTAMP,
  isActive BOOLEAN
);

-- Permissions (Granular)
CREATE TABLE "Permissions" (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,  -- "audit.create"
  resource VARCHAR(50),  -- Audit, Finding, Action, DOF
  action VARCHAR(50),    -- Create, Read, Update, Delete, Approve
  isActive BOOLEAN
);

-- RolePermissions (Role'e Permission atama)
CREATE TABLE "RolePermissions" (
  id UUID PRIMARY KEY,
  roleId UUID REFERENCES "Roles"(id),
  permissionId UUID REFERENCES "Permissions"(id),
  constraints JSON  -- {"department": "IT"} gibi context-based kısıtlar
);
```

**Avantajlar:**
- ✅ Multiple roles per user
- ✅ Context-based (Department, Branch, Company)
- ✅ Time-limited roles
- ✅ Granular permissions (audit.create, finding.approve)
- ✅ Scalable & flexible

---

### **3. MENÜ SİSTEMİ** 🔄

```sql
-- Menu tablosu
CREATE TABLE "Menu" (
  id UUID PRIMARY KEY,
  label VARCHAR NOT NULL,
  path VARCHAR NOT NULL,
  type menuType DEFAULT 'menu',  -- menu, dir
  status menuStatus DEFAULT 'active',
  icon VARCHAR,
  parentId UUID REFERENCES "Menu"(id)
);

-- UserMenu (User bazında menu atama)
CREATE TABLE "user_menu" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "User"(id),
  menu_id UUID REFERENCES "Menu"(id)
);
```

**Mevcut Durum:**
- ✅ User bazında menu atama çalışıyor
- ❌ Role bazında menu atama YOK
- ❌ Permission bazında menu erişim kontrolü YOK
- ❌ Dinamik menu oluşturma YOK

---

## 🎯 **HEDEF MİMARİ**

### **İdeal Yapı:**

```
User
  ↓
UserRoles (Many-to-Many)
  ↓
Roles (SUPER_ADMIN, QUALITY_MANAGER, etc.)
  ↓
RolePermissions (Many-to-Many)
  ↓
Permissions (audit.create, finding.read, etc.)
  ↓
??? MENU ???
```

**Soru:** Menu'yü nereye bağlamalıyız?

---

## 🔍 **ENTEGRASYON SEÇENEKLERİ**

### **Seçenek 1: ROLE-BASED MENU** (Önerilen ✅)

```sql
-- YENİ TABLO: RoleMenus
CREATE TABLE "RoleMenus" (
  id UUID PRIMARY KEY,
  roleId UUID REFERENCES "Roles"(id),
  menuId UUID REFERENCES "Menu"(id),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Akış:**
```
User → UserRoles → Roles → RoleMenus → Menus
```

**Avantajlar:**
- ✅ Role bazlı menu yönetimi
- ✅ Bir role menu atarsın, o roledeki tüm userlar görür
- ✅ Kolay yönetim
- ✅ Ölçeklenebilir

**Örnek:**
```sql
-- SUPER_ADMIN rolü tüm menüleri görsün
INSERT INTO "RoleMenus" (roleId, menuId)
SELECT 
  (SELECT id FROM "Roles" WHERE code = 'SUPER_ADMIN'),
  id
FROM "Menu";

-- QUALITY_MANAGER sadece denetim menülerini görsün
INSERT INTO "RoleMenus" (roleId, menuId)
SELECT 
  (SELECT id FROM "Roles" WHERE code = 'QUALITY_MANAGER'),
  id
FROM "Menu"
WHERE path LIKE '/denetim%';
```

---

### **Seçenek 2: PERMISSION-BASED MENU**

```sql
-- Menu tablosuna permission requirement ekle
ALTER TABLE "Menu" 
ADD COLUMN requiredPermission VARCHAR(100);  -- "audit.create"
```

**Akış:**
```
User → UserRoles → Roles → RolePermissions → Permissions
                                                   ↓
Menu.requiredPermission === Permission.code  →  Show Menu
```

**Avantajlar:**
- ✅ En granular kontrol
- ✅ Permission-based access
- ✅ Otomatik menu filtreleme

**Dezavantajlar:**
- ❌ Her menüye permission tanımlamak gerekir
- ❌ Karmaşık

---

### **Seçenek 3: HİBRİT (Role + Permission)** (En İyisi 🏆)

```sql
-- 1. RoleMenus tablosu (Rol bazında default menüler)
CREATE TABLE "RoleMenus" (
  id UUID PRIMARY KEY,
  roleId UUID REFERENCES "Roles"(id),
  menuId UUID REFERENCES "Menu"(id)
);

-- 2. Menu tablosuna permission field (Opsiyonel extra kontrol)
ALTER TABLE "Menu" 
ADD COLUMN requiredPermission VARCHAR(100);
```

**Akış:**
```
1. User login → Rolleri al
2. Rollere atanmış menüleri al (RoleMenus)
3. Her menü için requiredPermission varsa kontrol et
4. Permission yoksa veya varsa göster
```

**Avantajlar:**
- ✅ Esnek: Hem role hem permission bazlı
- ✅ Kolay yönetim (default role menus)
- ✅ Extra security (permission check)
- ✅ Backward compatible

---

## 🛠️ **ÖNERİLEN ÇÖZÜM**

### **PHASE 1: Role-Based Menus (Quick Win)**

**Yapılacaklar:**

1. **YENİ TABLO:** `RoleMenus`
```sql
CREATE TABLE "RoleMenus" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roleId UUID NOT NULL REFERENCES "Roles"(id) ON DELETE CASCADE,
  menuId UUID NOT NULL REFERENCES "Menu"(id) ON DELETE CASCADE,
  createdAt TIMESTAMP DEFAULT NOW(),
  createdById UUID REFERENCES "User"(id),
  UNIQUE(roleId, menuId)  -- Prevent duplicates
);
```

2. **SEED DATA:** Rollere menu atama
```typescript
// seed/10-role-menus.ts
export async function seedRoleMenus(adminId: string) {
  // SUPER_ADMIN → ALL MENUS
  const superAdminRole = await db.query.roles.findFirst({
    where: eq(roles.code, 'SUPER_ADMIN')
  });
  
  const allMenus = await db.query.menuTable.findMany();
  
  await db.insert(roleMenus).values(
    allMenus.map(menu => ({
      roleId: superAdminRole.id,
      menuId: menu.id,
      createdById: adminId
    }))
  );
  
  // QUALITY_MANAGER → Audit menus only
  // etc...
}
```

3. **API ROUTE GÜNCELLEMESİ:** `get-user-permission`
```typescript
// Eski: User bazında menu
const menus = await getMenusByUserId(userinfo.id);

// Yeni: User'ın rollerine göre menu
const menus = await getMenusByUserRoles(userinfo.id);
```

4. **YENİ DATA FUNCTION:**
```typescript
// server/data/menu.ts
export async function getMenusByUserRoles(userId: string) {
  // 1. User'ın rollerini al
  const userRoles = await db.query.userRoles.findMany({
    where: and(
      eq(userRoles.userId, userId),
      eq(userRoles.isActive, true)
    ),
    with: { role: true }
  });
  
  // 2. Rollere atanmış menüleri al
  const roleIds = userRoles.map(ur => ur.roleId);
  const roleMenus = await db.query.roleMenus.findMany({
    where: inArray(roleMenus.roleId, roleIds),
    with: { menu: true }
  });
  
  // 3. Unique menüleri döndür
  const uniqueMenus = [...new Map(
    roleMenus.map(rm => [rm.menuId, rm.menu])
  ).values()];
  
  return uniqueMenus;
}
```

---

### **PHASE 2: Permission-Based Extra Security (Optional)**

**Yapılacaklar:**

1. **Menu Schema Güncellemesi:**
```typescript
// drizzle/schema/menu.ts
export const menuTable = pgTable("Menu", {
  // ... existing fields
  requiredPermission: varchar("requiredPermission", { length: 100 }),  // NEW
});
```

2. **Menu Filtreleme Logic:**
```typescript
export async function getMenusByUserRoles(userId: string) {
  const menus = await getRoleBasedMenus(userId);
  const userPermissions = await getUserPermissions(userId);
  
  // Filter menus by permission
  return menus.filter(menu => {
    if (!menu.requiredPermission) return true;  // No permission needed
    return userPermissions.some(p => p.code === menu.requiredPermission);
  });
}
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Role-Based Menus**

- [ ] 1. Create `RoleMenus` schema
- [ ] 2. Create migration file
- [ ] 3. Run migration
- [ ] 4. Create seed file `10-role-menus.ts`
- [ ] 5. Update master seed to include role-menus
- [ ] 6. Create `getMenusByUserRoles()` function
- [ ] 7. Update `/api/get-user-permission` route
- [ ] 8. Test with different roles

### **Phase 2: Permission-Based (Optional)**

- [ ] 1. Add `requiredPermission` to Menu schema
- [ ] 2. Create migration
- [ ] 3. Update menu seed to include permissions
- [ ] 4. Create `getUserPermissions()` function
- [ ] 5. Add permission filter to menu fetch
- [ ] 6. Test permission-based access

### **Phase 3: Cleanup**

- [ ] 1. Deprecate old `user_menu` table
- [ ] 2. Migrate existing user menus to role menus
- [ ] 3. Remove old `Role` table
- [ ] 4. Update all references

---

## 🎯 **EXPECTED BENEFITS**

### **Öncesi:** ❌
```
- Her user'a manuel menu atama
- Rol değişince menüler güncellenmiyor
- Ölçeklenmiyor
- Yönetim zor
```

### **Sonrası:** ✅
```
- Role menu ata, tüm users otomatik alır
- Rol değişince menüler otomatik güncellenir
- Ölçeklenebilir (1000+ user için kolay)
- Kolay yönetim (Admin UI'dan)
```

---

## 🚀 **NEXT STEPS**

**Hemen Yapılacak:**
1. `RoleMenus` schema oluştur
2. Migration çalıştır
3. Seed data hazırla
4. API route güncelle
5. Test et

**Sonraki Sprint:**
1. Admin UI: Role-Menu yönetim sayfası
2. Permission-based extra security
3. Old system cleanup

---

**Created:** 2025-01-26  
**Version:** 1.0  
**Status:** 📝 Analysis Complete - Ready for Implementation
