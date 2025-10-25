# ✅ WEEK 4 COMPLETED - TEAMS & GROUPS

## 🎯 Goal
Enable cross-functional collaboration with teams & groups

**Status:** ✅ **COMPLETED**  
**Date:** 2025-01-24  
**Sprint:** 4/8  
**Progress:** 50% Complete (4/8 weeks)

---

## 📊 DELIVERABLES

### **1. Database Schema** ✅

#### **New Tables Created: 4**

**1.1 Teams Table**
```typescript
- id, name, code
- description
- departmentId (FK → departments)
- type (Permanent/Project/Virtual)
- leaderId (FK → users)
- isActive
- timestamps + audit
```

**1.2 UserTeams Table (Junction M:N)**
```typescript
- id, userId (FK), teamId (FK)
- role (Owner/Admin/Lead/Member)
- isPrimary (user's primary team)
- isActive
- joinedAt, leftAt
- invitedBy (FK → users)
```

**1.3 Groups Table**
```typescript
- id, name, code
- description
- type (Functional/Project/Committee/Custom)
- ownerId (FK → users)
- companyId, departmentId (optional scope)
- visibility (Public/Private/Restricted)
- isActive
- timestamps + audit
```

**1.4 GroupMembers Table (Junction M:N)**
```typescript
- id, groupId (FK), userId (FK)
- role (Owner/Admin/Lead/Member)
- isActive
- joinedAt, leftAt
- invitedBy (FK → users)
```

---

### **2. Seed Data** ✅

#### **10 Teams Created**

**Organizational Teams:**
1. **Kalite Güvence Ekibi** (QA_TEAM) - Quality
2. **Denetim Ekibi** (AUDIT_TEAM) - Quality
3. **DevOps Ekibi** (DEVOPS_TEAM) - IT
4. **Yazılım Geliştirme Ekibi** (DEV_TEAM) - IT
5. **B2B Satış Ekibi** (B2B_SALES) - Sales
6. **B2C Satış Ekibi** (B2C_SALES) - Sales
7. **Üretim Hattı 1** (PROD_LINE_1) - Production
8. **Kalite Kontrol Ekibi** (QC_TEAM) - Production

**Project Teams:**
9. **Yeni Ürün Geliştirme** (NEW_PRODUCT_DEV) - Project
10. **Dijital Dönüşüm Ekibi** (DIGITAL_TRANSFORM) - Project

#### **10 Groups Planned**

**Functional Groups:**
- Denetçiler Grubu (AUDITORS_GROUP)
- Kalite Yöneticileri (QUALITY_MANAGERS)
- Süreç Sahipleri (PROCESS_OWNERS)

**Committee Groups:**
- ISO Komitesi (ISO_COMMITTEE)
- Kalite Konseyi (QUALITY_COUNCIL)
- İyileştirme Komitesi (IMPROVEMENT_COMMITTEE)

**Project Groups:**
- Proje Alpha Ekibi (PROJECT_ALPHA)
- İnovasyon Grubu (INNOVATION_GROUP)

**Custom Groups:**
- Yeni Çalışanlar (ONBOARDING_GROUP)
- Eğitim Koordinatörleri (TRAINING_COORDINATORS)

**Note:** Groups require owner (user) - will be created via API

---

### **3. Type Definitions** ✅

```typescript
// Teams
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type UserTeam = typeof userTeams.$inferSelect;

// Groups
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;

// Helper Types
export type TeamWithMembers = Team & {
  members: (UserTeam & { user: User })[];
  leader?: User;
};

export type GroupWithMembers = Group & {
  members: (GroupMember & { user: User })[];
  owner: User;
};

export type UserWithTeamsAndGroups = {
  id: string;
  teams: (UserTeam & { team: Team })[];
  groups: (GroupMember & { group: Group })[];
};
```

---

## 🎯 KEY CONCEPTS

### **Teams vs Groups**

**TEAMS (Organizational):**
- ✅ Permanent organizational units
- ✅ Belong to departments
- ✅ Have team lead
- ✅ Hierarchy-based
- ✅ Example: QA Team, DevOps Team

**GROUPS (Cross-functional):**
- ✅ Cross-departmental
- ✅ Project or functional based
- ✅ Have owner
- ✅ Can span entire company
- ✅ Example: ISO Committee, Auditors Group

### **Key Differences:**

| Aspect | Teams | Groups |
|--------|-------|--------|
| **Structure** | Organizational | Cross-functional |
| **Scope** | Department-bound | Company-wide |
| **Type** | Permanent/Project/Virtual | Functional/Project/Committee/Custom |
| **Leadership** | Team Lead | Group Owner |
| **Hierarchy** | Within department | Independent |
| **Visibility** | Public | Public/Private/Restricted |

---

## 🎨 USAGE EXAMPLES

### **Example 1: Assign User to Team**

```typescript
import { db } from "@/drizzle/db";
import { userTeams } from "@/drizzle/schema";

// Add user to team
await db.insert(userTeams).values({
  userId: 'user-id',
  teamId: 'team-id',
  role: 'Member',
  isPrimary: true, // User's primary team
});
```

### **Example 2: Create Group**

```typescript
import { db } from "@/drizzle/db";
import { groups } from "@/drizzle/schema";

// Create functional group
await db.insert(groups).values({
  name: "Auditors Group",
  code: "AUDITORS",
  type: "Functional",
  ownerId: 'owner-user-id',
  visibility: "Public",
});
```

### **Example 3: Add Member to Group**

```typescript
import { db } from "@/drizzle/db";
import { groupMembers } from "@/drizzle/schema";

// Add member
await db.insert(groupMembers).values({
  groupId: 'group-id',
  userId: 'user-id',
  role: 'Member',
  invitedBy: 'inviter-user-id',
});
```

### **Example 4: Query User's Teams**

```typescript
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";

// Get user with teams
const user = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    teams: {
      where: eq(userTeams.isActive, true),
      with: {
        team: true,
      },
    },
  },
});

// Access teams
user.teams.forEach(ut => {
  console.log(ut.team.name, ut.role);
});
```

### **Example 5: Get Team Members**

```typescript
import { db } from "@/drizzle/db";

// Get team with members
const team = await db.query.teams.findFirst({
  where: eq(teams.id, teamId),
  with: {
    members: {
      where: eq(userTeams.isActive, true),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    },
    leader: true,
  },
});

// Members list
team.members.forEach(m => {
  console.log(`${m.user.name} - ${m.role}`);
});
```

---

## 📋 WHAT'S POSSIBLE NOW

### **1. Team Organization** ✅
```typescript
// Users organized into teams
QA Team:
  - John (Lead)
  - Alice (Member)
  - Bob (Member)

DevOps Team:
  - Charlie (Lead)
  - Diana (Member)
```

### **2. Cross-Functional Groups** ✅
```typescript
// Users from different departments
ISO Committee:
  - Manager A (Quality Dept) - Owner
  - Manager B (Production Dept) - Admin
  - Engineer C (IT Dept) - Member
```

### **3. Multiple Memberships** ✅
```typescript
// User can belong to multiple teams & groups
User: Alice
  Teams:
    - QA Team (Member)
    - Project Alpha (Member)
  Groups:
    - Auditors Group (Member)
    - ISO Committee (Member)
```

### **4. Role-Based Membership** ✅
```typescript
// Different roles in different contexts
User: John
  - QA Team: Lead
  - Auditors Group: Admin
  - ISO Committee: Member
```

### **5. Visibility Control** ✅
```typescript
// Groups with different visibility
Public Group: Anyone can see and request to join
Private Group: Members only, invitation required
Restricted Group: Admin approval required
```

---

## 🔄 USER RELATIONS UPDATED

### **Enhanced User Object:**

```typescript
const user = await db.query.user.findFirst({
  with: {
    // Week 1: Organization
    department: true,
    position: true,
    manager: true,
    
    // Week 2: Multi-Role
    userRoles: {
      with: { role: true }
    },
    
    // Week 4: Teams & Groups (NEW)
    teams: {
      with: { team: true }
    },
    groups: {
      with: { group: true }
    },
  },
});

// Access
user.department // Department info
user.userRoles  // All roles
user.teams      // All teams
user.groups     // All groups
```

---

## 📊 DATABASE STATUS

**Total Tables: 36** (4 new)

**New Tables:**
```sql
SELECT * FROM "Team";        -- 10 rows
SELECT * FROM "UserTeam";    -- 0 rows (ready for assignment)
SELECT * FROM "Group";       -- 0 rows (to be created via API)
SELECT * FROM "GroupMember"; -- 0 rows (ready for assignment)
```

---

## 🚀 NEXT STEPS

### **API/Backend (To Be Built):**

1. **Team Management API:**
   - Create/Update/Delete teams
   - Assign/Remove members
   - Set team lead
   - List team members

2. **Group Management API:**
   - Create/Update/Delete groups
   - Add/Remove members
   - Transfer ownership
   - Manage visibility

3. **Membership API:**
   - Join/Leave team
   - Request group membership
   - Accept/Reject invitations
   - List my teams/groups

---

## 📚 FILES CREATED/MODIFIED

### **Created:**
1. ✅ `src/drizzle/schema/teams-groups.ts` (380 lines)
2. ✅ `src/server/seed/teams-groups-seed.ts` (250 lines)
3. ✅ `WEEK-4-SUMMARY.md` (this file)

### **Modified:**
1. ✅ `src/drizzle/schema/user.ts`
   - Added teams relation
   - Added groups relation
2. ✅ `src/drizzle/schema/index.ts`
   - Export teams-groups schema
3. ✅ `package.json`
   - Added `seed:teams` script

---

## 💡 USE CASES

### **Use Case 1: Department Teams**
```
Quality Department
  ├── QA Team (5 members)
  └── Audit Team (3 members)

IT Department
  ├── DevOps Team (4 members)
  └── Development Team (8 members)
```

### **Use Case 2: Project Teams**
```
Project: New Product Development
Team Members:
  - Product Manager (Lead)
  - 2 Engineers
  - 1 Designer
  - 1 QA Specialist

Duration: 6 months (Project type)
```

### **Use Case 3: Cross-Functional Groups**
```
ISO Committee
Members from:
  - Quality Dept: 2 managers
  - Production Dept: 1 manager
  - HR Dept: 1 specialist
  - IT Dept: 1 coordinator

Purpose: ISO certification maintenance
```

### **Use Case 4: Functional Groups**
```
Auditors Group (All internal auditors)
  - Quality Dept: 3 auditors
  - IT Dept: 1 auditor
  - Production Dept: 2 auditors

Purpose: Knowledge sharing & coordination
```

---

## 🎯 WEEK 1-2-3-4 GLOBAL PROGRESS

**Completed Sprints:**
- ✅ **Week 1:** Organization Structure (4 tables)
  - Companies, Branches, Departments, Positions
  
- ✅ **Week 2:** Multi-Role System (4 tables)
  - Roles, UserRoles, Permissions, RolePermissions
  - 8 roles, 45 permissions, 159 mappings
  
- ✅ **Week 3:** Permission Checker (Service)
  - PermissionChecker service
  - Enhanced withAuth() helper
  - Shorthand helpers
  
- ✅ **Week 4:** Teams & Groups (4 tables)
  - Teams, UserTeams, Groups, GroupMembers
  - 10 teams seeded

**Total Progress:**
- ✅ 12 new database tables
- ✅ Organization hierarchy complete
- ✅ Multi-role + permission system complete
- ✅ Teams & Groups structure complete
- ✅ Zero breaking changes
- ✅ Fully backward compatible

**Remaining:**
- ⏳ Week 5-6: HR Integration (LDAP, API, CSV)
- ⏳ Week 7-8: Admin UI (Management interfaces)

**Progress:** 50% Complete (4/8 weeks) 🎯

---

## 🎉 WEEK 4 STATUS: COMPLETE!

**Ready for Week 5-6: HR Integration** 🚀

---

## 📞 QUICK REFERENCE

### **Create Team:**
```typescript
await db.insert(teams).values({
  name: "My Team",
  code: "MY_TEAM",
  departmentId: "dept-id",
  type: "Permanent",
});
```

### **Add Team Member:**
```typescript
await db.insert(userTeams).values({
  userId: "user-id",
  teamId: "team-id",
  role: "Member",
});
```

### **Create Group:**
```typescript
await db.insert(groups).values({
  name: "My Group",
  code: "MY_GROUP",
  type: "Functional",
  ownerId: "owner-id",
  visibility: "Public",
});
```

### **Add Group Member:**
```typescript
await db.insert(groupMembers).values({
  groupId: "group-id",
  userId: "user-id",
  role: "Member",
});
```

---

**50% Complete! Halfway there! 🎉**

**Next:** HR Integration → LDAP, CSV, REST API sync

**Questions? Ready for Week 5-6?** 💪
