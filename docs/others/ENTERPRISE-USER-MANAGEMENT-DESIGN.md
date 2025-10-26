# 🏢 ENTERPRISE USER MANAGEMENT SYSTEM - DESIGN DOCUMENT

## 📋 İÇİNDEKİLER
1. [Mevcut Durum Analizi](#mevcut-durum-analizi)
2. [Kurumsal Gereksinimler](#kurumsal-gereksinimler)
3. [Önerilen Mimari](#önerilen-mimari)
4. [Database Schema](#database-schema)
5. [HR Entegrasyonu](#hr-entegrasyonu)
6. [Yetkilendirme Sistemi](#yetkilendirme-sistemi)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Best Practices](#best-practices)

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ **Mevcut Yapı:**
```typescript
// User Table
- id, name, email, password
- theme, status, timestamps
- createdBy, deletedBy (self-reference)

// Role Table (1:1 with User)
- userRole: 'user' | 'admin' | 'superAdmin'
- superAdmin: boolean
```

### ⚠️ **Eksiklikler:**
- ❌ Kurum hiyerarşisi yok
- ❌ Departman/Pozisyon yapısı yok
- ❌ Çoklu rol desteği yok
- ❌ Grup (team) yönetimi yok
- ❌ HR entegrasyonu altyapısı yok
- ❌ Granular permission system yok

---

## 🎯 KURUMSAL GEREKSİNİMLER

### **1. Organizasyon Hiyerarşisi:**
```
Şirket
  └── Bölge (Region)
      └── Şube (Branch)
          └── Departman (Department)
              └── Ekip (Team)
                  └── Kullanıcı (User)
```

### **2. Pozisyon & Raporlama:**
- Kullanıcı → Pozisyon (Job Title)
- Kullanıcı → Yönetici (Manager)
- Organizasyon Şeması (Org Chart)

### **3. Kullanıcı Grupları:**
- Functional Groups (İşlevsel: Kalite, Üretim, Satış)
- Project Groups (Proje bazlı: Project A Team)
- Role Groups (Rol bazlı: Auditors, Quality Managers)

### **4. Yetki Sistemi:**
- Role-Based Access Control (RBAC)
- Permission-Based (granular)
- Context-Based (departman/proje bazlı)

### **5. HR Entegrasyonu:**
- LDAP/Active Directory
- REST API (SAP, Oracle HCM, Workday)
- CSV/Excel Import/Export
- Otomatik senkronizasyon

---

## 🏗️ ÖNERİLEN MİMARİ

### **PHASE 1: ORGANIZATIONAL STRUCTURE** (Foundation)

#### **1.1 Company & Branches**
```typescript
// companies table
- id, name, code
- country, city
- taxNumber, legalInfo
- isActive, timestamps

// branches table
- id, companyId (FK)
- name, code, type ('Headquarters' | 'Branch' | 'Factory' | 'Office')
- address, city, country
- managerId (FK → users)
- isActive, timestamps
```

#### **1.2 Departments & Teams**
```typescript
// departments table
- id, branchId (FK)
- parentDepartmentId (FK → self) // Nested departments
- name, code
- managerId (FK → users)
- costCenter, budget
- isActive, timestamps

// teams table
- id, departmentId (FK)
- name, description
- leaderId (FK → users)
- type ('Permanent' | 'Project' | 'Virtual')
- isActive, timestamps
```

#### **1.3 Positions & Job Titles**
```typescript
// positions table (Job titles)
- id, name, code
- level (1-10) // Career level
- category ('Management' | 'Technical' | 'Administrative')
- description
- salaryGrade
- isActive, timestamps
```

---

### **PHASE 2: USER ENHANCEMENT** (Core)

#### **2.1 Enhanced User Table**
```typescript
// users table (enhanced)
+ companyId (FK)
+ branchId (FK)
+ departmentId (FK)
+ positionId (FK)
+ employeeNumber (unique)
+ managerId (FK → users) // Direct manager
+ hireDate, terminationDate
+ employmentType ('FullTime' | 'PartTime' | 'Contract' | 'Intern')
+ workLocation ('OnSite' | 'Remote' | 'Hybrid')
+ timezone, locale
+ phoneNumber, mobileNumber
+ emergencyContact
```

#### **2.2 User Teams (Many-to-Many)**
```typescript
// user_teams table
- id, userId (FK), teamId (FK)
- role ('Member' | 'Lead' | 'Coordinator')
- joinedAt, leftAt
- isPrimary (boolean)
```

---

### **PHASE 3: ROLE & PERMISSION SYSTEM** (Authorization)

#### **3.1 Roles (Multi-Role Support)**
```typescript
// roles table (decoupled from user)
- id, name, code
- description
- category ('System' | 'Functional' | 'Project')
- scope ('Global' | 'Company' | 'Branch' | 'Department')
- isSystem (boolean) // Protected system roles
- isActive, timestamps

// user_roles table (Many-to-Many)
- id, userId (FK), roleId (FK)
- contextType ('Global' | 'Company' | 'Branch' | 'Department' | 'Project')
- contextId (uuid) // FK based on contextType
- validFrom, validTo // Time-based roles
- isActive
```

#### **3.2 Permissions (Granular)**
```typescript
// permissions table
- id, name, code
- resource ('Audit' | 'Finding' | 'Action' | 'DOF' | 'User')
- action ('Create' | 'Read' | 'Update' | 'Delete' | 'Approve' | 'Export')
- description
- category

// role_permissions table
- id, roleId (FK), permissionId (FK)
- constraints (JSON) // e.g., {"department": "own", "status": ["Draft", "Active"]}
```

#### **3.3 Pre-defined Roles**
```typescript
// System Roles
- SuperAdmin (Full access)
- Admin (Company-wide management)
- Manager (Department/Team management)
- User (Basic access)

// Audit System Roles
- Quality Manager (Approve audits, findings, DOFs)
- Auditor (Conduct audits, create findings)
- Process Owner (Manage actions, close findings)
- Action Owner (Complete actions)

// Custom Roles (definable by admin)
```

---

### **PHASE 4: USER GROUPS** (Collaboration)

#### **4.1 Groups**
```typescript
// groups table
- id, name, code, description
- type ('Functional' | 'Project' | 'Committee' | 'Custom')
- ownerId (FK → users)
- companyId, departmentId (optional scope)
- visibility ('Public' | 'Private' | 'Restricted')
- isActive, timestamps

// group_members table
- id, groupId (FK), userId (FK)
- role ('Owner' | 'Admin' | 'Member')
- joinedAt, leftAt
- invitedBy (FK → users)
```

---

### **PHASE 5: HR INTEGRATION** (External Systems)

#### **5.1 HR Sync Configuration**
```typescript
// hr_sync_configs table
- id, name, type ('LDAP' | 'API' | 'CSV')
- endpoint, credentials (encrypted)
- mapping (JSON) // Field mapping: {"hr_field": "our_field"}
- syncFrequency ('Manual' | 'Hourly' | 'Daily' | 'Weekly')
- lastSyncAt, nextSyncAt
- isActive, status

// hr_sync_logs table
- id, configId (FK)
- startedAt, completedAt
- status ('Success' | 'Failed' | 'Partial')
- recordsProcessed, recordsFailed
- errors (JSON)
```

#### **5.2 External User Mapping**
```typescript
// external_user_mappings table
- id, userId (FK)
- externalSystem ('LDAP' | 'SAP' | 'Oracle' | 'Workday')
- externalId, externalUsername
- lastSyncedAt
- syncStatus
```

---

## 🔌 HR ENTEGRASYONU DETAYLARI

### **1. LDAP/Active Directory**
```typescript
// lib/integrations/ldap-sync.ts
interface LDAPConfig {
  url: string;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  searchFilter: string;
  attributes: string[];
}

class LDAPSync {
  async sync(): Promise<SyncResult> {
    // 1. Connect to LDAP
    // 2. Search users
    // 3. Map LDAP → Our fields
    // 4. Create/Update users
    // 5. Disable removed users
  }
  
  async syncUser(ldapUser: LDAPUser): Promise<User> {
    // Field mapping:
    // cn → name
    // mail → email
    // department → departmentId (lookup)
    // manager → managerId (lookup)
    // employeeNumber → employeeNumber
  }
}
```

### **2. REST API Integration**
```typescript
// lib/integrations/hr-api-sync.ts
interface HRAPIConfig {
  endpoint: string;
  apiKey: string;
  mapping: FieldMapping;
}

class HRAPISync {
  async fetchUsers(): Promise<HRUser[]> {
    // GET /api/employees
  }
  
  async webhookHandler(event: HRWebhookEvent) {
    // Real-time updates
    switch(event.type) {
      case 'employee.created': createUser(event.data);
      case 'employee.updated': updateUser(event.data);
      case 'employee.terminated': deactivateUser(event.data);
    }
  }
}
```

### **3. CSV/Excel Import**
```typescript
// lib/integrations/csv-import.ts
class CSVImport {
  async import(file: File, mapping: FieldMapping) {
    // 1. Parse CSV
    // 2. Validate data
    // 3. Create preview
    // 4. Bulk insert/update
    // 5. Generate report
  }
}
```

---

## 🔐 YETKİLENDİRME SİSTEMİ

### **1. Permission Helper**
```typescript
// lib/auth/permissions.ts
type Permission = {
  resource: string;
  action: string;
  context?: {
    department?: 'own' | 'any';
    branch?: 'own' | 'any';
    status?: string[];
  };
};

class PermissionChecker {
  async can(
    userId: string,
    permission: Permission
  ): Promise<boolean> {
    const userRoles = await getUserRoles(userId);
    const permissions = await getRolePermissions(userRoles);
    return this.evaluate(permission, permissions);
  }
  
  // Shorthand methods
  async canCreateAudit(userId: string): Promise<boolean>;
  async canApproveAction(userId: string, action: Action): Promise<boolean>;
  async canViewDOF(userId: string, dof: DOF): Promise<boolean>;
}

// Usage in actions
export async function createAudit(data: AuditData) {
  return withAuth(async (user) => {
    if (!await can(user.id, { resource: 'Audit', action: 'Create' })) {
      throw new PermissionError();
    }
    // ... create audit
  });
}
```

### **2. Context-Based Permissions**
```typescript
// Example: User can only see their department's audits
{
  resource: 'Audit',
  action: 'Read',
  context: {
    department: 'own', // User's department
    status: ['Active', 'InProgress'] // Only active audits
  }
}

// Example: Manager can approve in their branch
{
  resource: 'Action',
  action: 'Approve',
  context: {
    branch: 'own'
  }
}
```

---

## 📅 IMPLEMENTATION ROADMAP

### **SPRINT 1: Foundation (2 weeks)**
- ✅ Create organization tables (companies, branches, departments)
- ✅ Create positions table
- ✅ Enhance user table (add org fields)
- ✅ Create migrations
- ✅ Basic CRUD operations

### **SPRINT 2: Multi-Role System (2 weeks)**
- ✅ Decouple roles from users (many-to-many)
- ✅ Create permissions table
- ✅ Create role-permission mappings
- ✅ Implement permission checker
- ✅ Update existing auth helpers

### **SPRINT 3: User Groups & Teams (1 week)**
- ✅ Create groups/teams tables
- ✅ Group management UI
- ✅ Team assignment interface

### **SPRINT 4: HR Integration - Basic (2 weeks)**
- ✅ LDAP integration
- ✅ CSV import/export
- ✅ User sync service
- ✅ Sync logs & monitoring

### **SPRINT 5: HR Integration - Advanced (2 weeks)**
- ✅ REST API integration
- ✅ Webhook handlers
- ✅ Real-time sync
- ✅ Conflict resolution

### **SPRINT 6: Admin UI (2 weeks)**
- ✅ Organization management pages
- ✅ Role & permission management
- ✅ User management enhanced
- ✅ HR sync dashboard
- ✅ Org chart visualization

### **SPRINT 7: Permission Migration (1 week)**
- ✅ Audit all existing authorization code
- ✅ Replace with new permission system
- ✅ Testing & validation

**TOTAL: 12 weeks (3 months)**

---

## 🎯 BEST PRACTICES

### **1. Security**
- ✅ Encrypt sensitive HR credentials
- ✅ Audit all permission changes
- ✅ Time-based role expiration
- ✅ Failed login tracking
- ✅ 2FA support for admins

### **2. Performance**
- ✅ Cache user permissions
- ✅ Indexed foreign keys
- ✅ Lazy load organization tree
- ✅ Background HR sync jobs

### **3. Data Integrity**
- ✅ Soft deletes (no cascade delete users)
- ✅ Historical data retention
- ✅ Audit trail for all changes
- ✅ Validation rules (e.g., manager must be higher level)

### **4. Scalability**
- ✅ Partition large tables
- ✅ Async HR sync
- ✅ Microservice-ready (separate user service)
- ✅ Multi-tenant ready

### **5. UX**
- ✅ Org chart visualization (d3.js)
- ✅ Quick search users by name/dept
- ✅ Bulk operations (assign roles, move dept)
- ✅ Excel templates for import

---

## 📊 DATABASE SCHEMA SUMMARY

```
New Tables: 15
1. companies
2. branches
3. departments
4. teams
5. positions
6. user_teams (junction)
7. roles (enhanced)
8. user_roles (junction, new)
9. permissions (new)
10. role_permissions (junction)
11. groups (new)
12. group_members (junction)
13. hr_sync_configs (new)
14. hr_sync_logs (new)
15. external_user_mappings (new)

Enhanced Tables: 1
- users (add org fields)

Migration Complexity: MEDIUM-HIGH
Estimated Time: 3 months (12 sprints)
```

---

## 🚀 QUICK WINS (Priority Items)

### **Week 1-2: Immediate Value**
1. Add `departmentId`, `managerId` to users
2. Create `departments` table
3. Update user list to show department
4. Add department filter

### **Week 3-4: Multi-Role**
1. Decouple roles table
2. Add `user_roles` junction
3. Update auth helpers
4. Role assignment UI

### **Week 5-8: HR Integration**
1. CSV import (Excel template)
2. Basic sync service
3. Mapping configuration

---

## 📋 CHECKLIST FOR BAŞLAMAK

- [ ] Review this document with team
- [ ] Prioritize features (MVP vs Nice-to-have)
- [ ] Create database migration plan
- [ ] Design UI mockups (Figma)
- [ ] Set up development branches
- [ ] Create initial migrations
- [ ] Start Sprint 1

---

## 📞 NEXT STEPS

**Bu tasarımı onayladıktan sonra:**
1. Database migration dosyalarını oluşturabilirim
2. Type definitions ekleyebilirim
3. API endpoints tasarlayabilirim
4. UI component'leri başlatabilirim

**Hangi PHASE ile başlamak istersiniz?**
- Option A: PHASE 1 (Organization Structure) → Foundation
- Option B: PHASE 2+3 (Multi-Role + Groups) → Quick win
- Option C: PHASE 5 (HR Integration) → Business priority

---

**Son Güncelleme:** 2025-01-24
**Durum:** ✅ DESIGN COMPLETE - AWAITING APPROVAL
