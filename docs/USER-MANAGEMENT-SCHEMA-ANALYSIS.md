# USER MANAGEMENT - DATABASE SCHEMA ANALYSIS

**Date:** 2025-01-25  
**Analysis:** User table vs User Management implementation  
**Status:** ⚠️ **GAPS IDENTIFIED**

---

## 📊 CURRENT SCHEMA (user.ts)

### **User Table Fields:**

```typescript
// Organization fields
companyId: uuid("companyId"),           // ❌ Not used in UI
branchId: uuid("branchId"),             // ❌ Not used in UI
departmentId: uuid("departmentId"),     // ✅ Used in UI
positionId: uuid("positionId"),         // ✅ Used in UI
managerId: uuid("managerId"),           // ❌ Not used in UI
employeeNumber: varchar("employeeNumber", { length: 50 }),  // ❌ Not used

// Employment details
hireDate: timestamp("hireDate"),        // ❌ Not used
terminationDate: timestamp("terminationDate"),  // ❌ Not used
employmentType: varchar("employmentType", { length: 50 }),  // ❌ Not used
workLocation: varchar("workLocation", { length: 50 }),      // ❌ Not used

// Contact
phoneNumber: varchar("phoneNumber", { length: 50 }),        // ❌ Not used
mobileNumber: varchar("mobileNumber", { length: 50 }),      // ❌ Not used
emergencyContact: varchar("emergencyContact", { length: 255 }),  // ❌ Not used

// Core fields
name: varchar("name"),                  // ✅ Used in UI
email: varchar("email"),                // ✅ Used in UI
status: userStatus("status"),           // ✅ Used in UI
```

---

## ⚠️ IDENTIFIED GAPS

### **1. Missing Foreign Key Constraints** 🔴

**Issue:** Organization fields exist but have NO foreign key constraints in schema.

**Current Schema:**
```typescript
export const user = pgTable("User", {
  companyId: uuid("companyId"),       // ❌ No FK constraint
  branchId: uuid("branchId"),         // ❌ No FK constraint
  departmentId: uuid("departmentId"), // ❌ No FK constraint
  positionId: uuid("positionId"),     // ❌ No FK constraint
  managerId: uuid("managerId"),       // ✅ Has FK constraint
}, (table) => {
  return {
    // Missing FK definitions for organization fields!
  }
});
```

**Expected:**
```typescript
(table) => {
  return {
    // ... existing FKs
    userCompanyIdFkey: foreignKey({
      columns: [table.companyId],
      foreignColumns: [companies.id],
      name: "User_companyId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    userBranchIdFkey: foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: "User_branchId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    userDepartmentIdFkey: foreignKey({
      columns: [table.departmentId],
      foreignColumns: [departments.id],
      name: "User_departmentId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    userPositionIdFkey: foreignKey({
      columns: [table.positionId],
      foreignColumns: [positions.id],
      name: "User_positionId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
  }
}
```

---

### **2. Incomplete UI Implementation** 🟡

**Current UI (user-dialog.tsx):**
- ✅ Name
- ✅ Email
- ✅ Department (dropdown)
- ✅ Position (dropdown)
- ✅ Status (active/inactive)
- ❌ Company (missing)
- ❌ Branch (missing)
- ❌ Employee Number (missing)
- ❌ Manager (missing)

**Schema has but UI doesn't:**
- companyId
- branchId
- managerId
- employeeNumber
- hireDate
- terminationDate
- employmentType
- workLocation
- phoneNumber
- mobileNumber
- emergencyContact

---

### **3. Server Actions Incomplete** 🟡

**Current (user-actions.ts):**
```typescript
export async function updateUser(userId, data: {
  name: string;
  email: string;
  departmentId: string;  // ✅
  positionId: string;    // ✅
  status: "active" | "inactive";
}) { ... }
```

**Schema supports but actions don't:**
- companyId
- branchId
- managerId
- employeeNumber
- employmentType
- workLocation
- phoneNumber
- hireDate

---

## 🎯 RECOMMENDATIONS

### **Priority 1: Critical (Database Integrity)** 🔴

#### **A. Add Missing Foreign Keys**

**File:** Create migration `migrations/add-user-organization-foreign-keys.sql`

```sql
-- Add foreign key constraints for organization fields
ALTER TABLE "User" 
ADD CONSTRAINT "User_companyId_fkey" 
FOREIGN KEY ("companyId") 
REFERENCES "Company"("id") 
ON UPDATE CASCADE 
ON DELETE SET NULL;

ALTER TABLE "User" 
ADD CONSTRAINT "User_branchId_fkey" 
FOREIGN KEY ("branchId") 
REFERENCES "Branch"("id") 
ON UPDATE CASCADE 
ON DELETE SET NULL;

ALTER TABLE "User" 
ADD CONSTRAINT "User_departmentId_fkey" 
FOREIGN KEY ("departmentId") 
REFERENCES "Department"("id") 
ON UPDATE CASCADE 
ON DELETE SET NULL;

ALTER TABLE "User" 
ADD CONSTRAINT "User_positionId_fkey" 
FOREIGN KEY ("positionId") 
REFERENCES "Position"("id") 
ON UPDATE CASCADE 
ON DELETE SET NULL;
```

#### **B. Update Schema Definition**

**File:** `src/drizzle/schema/user.ts`

Add foreign key definitions in the table config (after line 76).

---

### **Priority 2: High (Core Functionality)** 🟡

#### **A. Add Company & Branch to UI**

**Benefits:**
- Better organizational hierarchy
- Complete user profile
- Filtering by company/branch

**Files to Update:**
1. `user-dialog.tsx` - Add company & branch dropdowns
2. `user-actions.ts` - Support companyId & branchId
3. `page.tsx` - Fetch companies & branches
4. `columns.tsx` - Display company & branch

#### **B. Add Employee Number**

**Benefits:**
- Unique employee identification
- HR integration ready
- Professional user management

---

### **Priority 3: Medium (Enhanced Features)** 🟢

#### **A. Add Manager Field**

**Benefits:**
- Organizational hierarchy
- Approval workflows
- Reporting structure

**Implementation:**
- Manager dropdown (filtered by same department/branch)
- Display in user profile
- Used in audit/action assignments

#### **B. Add Contact Information**

**Fields:**
- Phone Number
- Mobile Number
- Emergency Contact

**Usage:**
- User profile page
- Contact directory
- Emergency situations

---

### **Priority 4: Low (Optional)** ⚪

#### **A. Employment Details**

**Fields:**
- Hire Date
- Termination Date
- Employment Type (Full-time, Part-time, Contract, Intern)
- Work Location (On-site, Remote, Hybrid)

**Usage:**
- HR reporting
- Access control (terminated users)
- Work arrangement tracking

---

## 📋 IMPLEMENTATION PLAN

### **Phase 1: Database Integrity (Immediate)**

```
1. ✅ Create migration for foreign keys
2. ✅ Run migration on database
3. ✅ Update schema definition in code
4. ✅ Verify constraints are working
```

### **Phase 2: Core Fields (Next)**

```
1. Add companyId & branchId to:
   - user-dialog.tsx (dropdowns)
   - user-actions.ts (update function)
   - columns.tsx (display)
   - page.tsx (fetch lists)

2. Add employeeNumber field:
   - user-dialog.tsx (input)
   - user-actions.ts (update function)
   - columns.tsx (display)
```

### **Phase 3: Manager Field (Optional)**

```
1. Add managerId to:
   - user-dialog.tsx (filtered dropdown)
   - user-actions.ts (update function)
   - columns.tsx (display)
```

### **Phase 4: Extended Profile (Future)**

```
1. Create detailed user profile page
2. Add employment details tab
3. Add contact information tab
4. Add document management
```

---

## 🔍 CURRENT VS EXPECTED STATE

### **Database Schema:**
| Field | Exists in DB | Has FK | Used in UI | Priority |
|-------|--------------|--------|------------|----------|
| departmentId | ✅ | ❌ | ✅ | 🔴 Add FK |
| positionId | ✅ | ❌ | ✅ | 🔴 Add FK |
| companyId | ✅ | ❌ | ❌ | 🟡 Add FK + UI |
| branchId | ✅ | ❌ | ❌ | 🟡 Add FK + UI |
| managerId | ✅ | ✅ | ❌ | 🟢 Add UI |
| employeeNumber | ✅ | N/A | ❌ | 🟡 Add UI |
| phoneNumber | ✅ | N/A | ❌ | ⚪ Future |
| hireDate | ✅ | N/A | ❌ | ⚪ Future |

### **Current Coverage:**
```
Database fields: 20+ fields
UI implementation: 5 fields (25%)
Missing FK constraints: 4 critical
```

---

## ✅ IMMEDIATE ACTION ITEMS

### **Must Do (Database Integrity):**
1. [ ] Create foreign key migration
2. [ ] Run migration
3. [ ] Update schema definition
4. [ ] Test constraints

### **Should Do (Completeness):**
5. [ ] Add company dropdown to user dialog
6. [ ] Add branch dropdown to user dialog
7. [ ] Update user-actions.ts for company/branch
8. [ ] Display company/branch in table

### **Could Do (Enhancement):**
9. [ ] Add employee number field
10. [ ] Add manager selection
11. [ ] Create detailed user profile page
12. [ ] Add contact information

---

## 🎯 RECOMMENDED NEXT STEPS

**Step 1:** Fix database integrity (FK constraints)  
**Step 2:** Add company & branch to UI  
**Step 3:** Add employee number  
**Step 4:** Consider manager field  
**Step 5:** Plan extended profile page

---

## 📊 RISK ASSESSMENT

### **High Risk (Must Fix):**
- ❌ **Missing FK constraints** - Data integrity at risk
  - Users can reference non-existent departments
  - Orphaned records possible
  - No cascade delete behavior

### **Medium Risk:**
- ⚠️ **Incomplete organizational hierarchy** - company/branch unused
  - Can't filter users by company
  - Can't enforce company-level permissions
  - Branch-based reporting not possible

### **Low Risk:**
- ℹ️ **Missing optional fields** - Can be added later
  - Employee number, phone, hire date, etc.
  - No immediate impact on core functionality

---

## 💡 CONCLUSION

**Current State:** 
- Schema is comprehensive ✅
- Foreign keys are missing ❌
- UI uses only 25% of available fields ⚠️

**Recommended Priority:**
1. 🔴 **Critical:** Add foreign key constraints
2. 🟡 **High:** Add company & branch to UI
3. 🟢 **Medium:** Add employee number & manager
4. ⚪ **Low:** Extended profile with all fields

**Estimated Effort:**
- FK migration: 30 minutes
- Company/Branch UI: 2 hours
- Employee Number: 1 hour
- Full profile page: 4-6 hours

---

**Status:** ⚠️ **Action Required**  
**Next:** Create FK migration and update schema
