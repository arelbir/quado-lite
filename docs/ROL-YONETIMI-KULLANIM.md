# 🎯 ROL YÖNETİMİ KULLANIM KILAVUZU

## 📊 **DATABASE YAPISI**

### **Tables:**
```
1. Roles - Rol tanımları
2. UserRoles - Kullanıcı-Rol ilişkisi (Many-to-Many)
3. Permissions - İzin tanımları
4. RolePermissions - Rol-İzin ilişkisi
```

### **Schema:**
```typescript
// UserRoles Table (Junction Table)
{
  id: UUID,
  userId: UUID,           // Kullanıcı
  roleId: UUID,           // Rol
  contextType: Enum,      // Global, Company, Branch, Department
  contextId: UUID,        // Context ID (opsiyonel)
  validFrom: Date,        // Geçerlilik başlangıcı (opsiyonel)
  validTo: Date,          // Geçerlilik bitişi (opsiyonel)
  isActive: Boolean,      // Aktif mi?
  assignedBy: UUID,       // Kim atadı?
  createdAt: Date
}
```

---

## 🔧 **BACKEND ACTIONS**

### **1. assignRoleToUser**
Kullanıcıya rol atar.

```typescript
await assignRoleToUser(
  userId: string,
  roleId: string,
  options?: {
    contextType?: "Global" | "Company" | "Branch" | "Department",
    contextId?: string,
    validFrom?: Date,
    validTo?: Date
  }
)
```

**Özellikler:**
- ✅ Duplicate check (aynı rol 2 kez atanamaz)
- ✅ User ve Role validation
- ✅ Context support (Global/Department/etc)
- ✅ Time-based roles (validFrom/validTo)
- ✅ Admin-only access

---

### **2. removeRoleFromUser**
Kullanıcıdan rol kaldırır.

```typescript
await removeRoleFromUser(
  userId: string,
  roleId: string
)
```

**Özellikler:**
- ✅ Assignment validation
- ✅ Hard delete (UserRoles kaydı silinir)
- ✅ Admin-only access

---

### **3. getUserRoles**
Kullanıcının tüm rollerini getirir.

```typescript
const result = await getUserRoles(userId: string)
// Returns: UserRole[] with role details
```

---

## 🎨 **FRONTEND COMPONENT**

### **UserRoleManagement Component**

**Location:** `src/components/admin/user-role-management.tsx`

**Props:**
```typescript
{
  userId: string,
  userName: string,
  userRoles: UserRole[],        // Mevcut roller
  availableRoles: AvailableRole[] // Atanabilecek roller
}
```

**Features:**
- ✅ View current roles with badges (Global/System)
- ✅ Add new roles with dropdown
- ✅ Remove roles with confirmation dialog
- ✅ Loading states
- ✅ Toast notifications
- ✅ Auto-refresh on changes

---

## 📋 **KULLANIM ÖRNEKLERİ**

### **1. User Detail Sayfasında Kullanım**

```tsx
// src/app/(main)/admin/users/[id]/page.tsx (Server Component)

import { UserRoleManagement } from "@/components/admin/user-role-management";
import { db } from "@/drizzle/db";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch user with roles
  const userDetail = await db.query.user.findFirst({
    where: eq(user.id, id),
    with: {
      userRoles: {
        where: eq(userRoles.isActive, true),
        with: {
          role: true,
        },
      },
    },
  });

  // Fetch all available roles
  const allRoles = await db.query.roles.findMany({
    where: eq(roles.isActive, true),
    orderBy: [asc(roles.name)],
  });

  return (
    <div>
      {/* ... other user info ... */}
      
      <UserRoleManagement
        userId={id}
        userName={userDetail.name || userDetail.email}
        userRoles={userDetail.userRoles}
        availableRoles={allRoles}
      />
    </div>
  );
}
```

---

### **2. Role Sayfasında Users Listesi**

```tsx
// src/app/(main)/admin/roles/[id]/page.tsx

// Fetch role with users
const roleDetail = await db.query.roles.findFirst({
  where: eq(roles.id, roleId),
  with: {
    userRoles: {
      where: eq(userRoles.isActive, true),
      with: {
        user: true,
      },
    },
  },
});

// Display users with this role
<Card>
  <CardHeader>
    <CardTitle>Users with this Role ({roleDetail.userRoles.length})</CardTitle>
  </CardHeader>
  <CardContent>
    {roleDetail.userRoles.map((ur) => (
      <div key={ur.id}>
        {ur.user.name} - {ur.user.email}
        <Button onClick={() => removeRoleFromUser(ur.userId, roleId)}>
          Remove
        </Button>
      </div>
    ))}
  </CardContent>
</Card>
```

---

## 🔄 **WORKFLOW**

### **User'a Rol Atama:**
```
1. User Detail sayfasını aç
2. "Role Assignments" kartında "Add Role" butonuna tıkla
3. Dropdown'dan rol seç
4. "Assign Role" butonuna tıkla
5. Toast notification + Auto refresh
6. Rol listesinde görünür
```

### **Rol Kaldırma:**
```
1. Rolün yanındaki X butonuna tıkla
2. Confirmation dialog açılır
3. "Remove Role" butonuna tıkla
4. Toast notification + Auto refresh
5. Rol listesinden kaybolur
```

---

## 🎯 **CONTEXT-BASED ROLES**

Roller farklı context'lerde atanabilir:

### **Global (Default):**
```typescript
assignRoleToUser(userId, roleId)
// contextType: "Global"
// Tüm şirkette geçerli
```

### **Department-Specific:**
```typescript
assignRoleToUser(userId, roleId, {
  contextType: "Department",
  contextId: departmentId
})
// Sadece belirtilen departmanda geçerli
```

### **Time-Based:**
```typescript
assignRoleToUser(userId, roleId, {
  validFrom: new Date("2025-01-01"),
  validTo: new Date("2025-12-31")
})
// Belirtilen tarihler arasında geçerli
```

---

## 📊 **DATABASE QUERIES**

### **Kullanıcının Aktif Rollerini Getir:**
```typescript
const userRoles = await db.query.userRoles.findMany({
  where: and(
    eq(userRoles.userId, userId),
    eq(userRoles.isActive, true)
  ),
  with: {
    role: true,
  },
});
```

### **Role Sahip Kullanıcıları Getir:**
```typescript
const usersWithRole = await db.query.userRoles.findMany({
  where: and(
    eq(userRoles.roleId, roleId),
    eq(userRoles.isActive, true)
  ),
  with: {
    user: true,
  },
});
```

### **Kullanıcının Permission'larını Kontrol Et:**
```typescript
const hasPermission = await db.query.userRoles.findFirst({
  where: and(
    eq(userRoles.userId, userId),
    eq(userRoles.isActive, true)
  ),
  with: {
    role: {
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
      },
    },
  },
});
```

---

## ✅ **TAMAMLANAN**

- ✅ Backend actions (assignRoleToUser, removeRoleFromUser, getUserRoles)
- ✅ Frontend component (UserRoleManagement)
- ✅ Validation & error handling
- ✅ Toast notifications
- ✅ Loading states
- ✅ Confirmation dialogs
- ✅ Auto-refresh

---

## 📌 **SIRA SİZDE**

### **Implement Etmeniz Gereken:**

1. **User Detail Page'i Server Component'e Çevir:**
   - `user-detail/page.tsx` → Server Component
   - Fetch user with roles
   - Fetch available roles
   - Pass to UserRoleManagement component

2. **Role Detail Page'e Users Ekle:**
   - `roles/[id]/page.tsx`
   - Display users with this role
   - Add/Remove user from role

3. **User Table'a Role Column Ekle (Opsiyonel):**
   - `users/columns.tsx`
   - Show roles as badges
   - Click to filter by role

---

## 🚀 **NEXT STEPS (İsteğe Bağlı)**

- [ ] Role assignment history (audit log)
- [ ] Bulk role assignment
- [ ] Role templates
- [ ] Permission matrix view
- [ ] Role hierarchy (parent-child roles)
- [ ] Temporary role assignments (auto-expire)

---

**Created:** 2025-01-26
**Status:** ✅ Backend Ready, Frontend Component Ready
**Pattern:** DRY + SOLID + Type-Safe + User-Friendly
