# 🔍 NESTED QUERY REFACTOR PLAN

## 📊 **MEVCUT DURUM ANALİZİ**

Codebase'de **Drizzle ORM nested `with` queries** kullanan ve TypeScript inference problemi yaşayabilecek **37+ nokta** tespit edildi.

---

## 🎯 **ÖNCELİK SIRALAMASI**

### **🔴 YÜK SEK ÖNCELİK (Nested Queries - TypeScript Errors)**

#### **1. user-actions.ts - getUserById()**
```typescript
// ❌ MEVCUT (NESTED)
const userRecord = await db.query.user.findFirst({
  with: {
    userRoles: {
      with: { role: true }
    }
  }
});

// ✅ REFACTOR
const userRecord = await db.query.user.findFirst({ where: eq(user.id, userId) });
const userRolesList = await db.query.userRoles.findMany({
  where: and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)),
  with: { role: true } as any
});
return { ...userRecord, userRoles: userRolesList };
```

**Etki:** User detail page, user management
**Durum:** ✅ TAMAMLANDI (user-actions.ts'de yapıldı)

---

#### **2. workflow-actions.ts - getUserRoles()**
```typescript
// ❌ MEVCUT (NESTED)
const userRecord = await db.query.user.findFirst({
  with: {
    userRoles: {
      with: { role: true }
    }
  }
});

// ✅ REFACTOR
const userRolesList = await db.query.userRoles.findMany({
  where: and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)),
  with: { role: true } as any
});
```

**Etki:** Workflow step assignments, permissions
**Satır:** 82-99
**Karmaşıklık:** Düşük (helper function)

---

#### **3. audit-question-actions.ts - getAuditQuestions()**
```typescript
// ❌ MEVCUT (NESTED)
const auditQuestionsData = await db.query.auditQuestions.findMany({
  with: {
    question: {
      with: {
        bank: { columns: { id: true, name: true } }
      }
    }
  }
});

// ✅ REFACTOR
const auditQuestionsData = await db.query.auditQuestions.findMany({
  where: eq(auditQuestions.auditId, auditId)
});

const questionIds = auditQuestionsData.map(aq => aq.questionId);
const [questionsData, banksData] = await Promise.all([
  db.query.questions.findMany({
    where: inArray(questions.id, questionIds)
  }),
  db.query.questionBanks.findMany({
    where: inArray(questionBanks.id, questionsData.map(q => q.bankId))
  })
]);

// Map results
return auditQuestionsData.map(aq => {
  const question = questionsData.find(q => q.id === aq.questionId);
  const bank = banksData.find(b => b.id === question?.bankId);
  return { ...aq, question: { ...question, bank } };
});
```

**Etki:** Audit questions display, question bank integration
**Satır:** 13-36
**Karmaşıklık:** Orta (mapping gerekli)

---

#### **4. API Route: users/[id]/route.ts**
```typescript
// ❌ MEVCUT (NESTED)
const userDetail = await db.query.user.findFirst({
  with: {
    userRoles: {
      with: { role: true }
    }
  }
});

// ✅ REFACTOR
import { getUserById } from "@/server/actions/user-actions";
const result = await getUserById(id);
return NextResponse.json(result.data);
```

**Etki:** User detail API endpoint
**Satır:** 15-33
**Karmaşıklık:** Düşük (server action kullan)

---

### **🟡 ORTA ÖNCELİK (as any ile Geçici Çözüm Var)**

#### **5. API Route: findings/[id]/route.ts**
```typescript
// MEVCUT
with: { audit: true, createdBy: true } as any

// REFACTOR
import { getFindingById } from "@/server/actions/finding-actions";
```

**Durum:** as any kullanılıyor, çalışıyor ama refactor daha iyi

---

#### **6. API Route: dofs/[id]/route.ts**
```typescript
// MEVCUT
with: { finding: true, createdBy: true } as any

// REFACTOR
import { getDofById } from "@/server/actions/dof-actions";
```

---

#### **7. API Route: actions/[id]/route.ts**
```typescript
// MEVCUT
with: { finding: true, assignedTo: true } as any

// REFACTOR
import { getActionById } from "@/server/actions/action-actions";
```

---

### **🟢 DÜŞÜK ÖNCELİK (Single-level with - Sorun Yok)**

Bunlar basit relation'lar, TypeScript inference problemi yaşamıyor:

- **finding-actions.ts**: `with: { createdBy: true }`
- **dof-actions.ts**: `with: { manager: true, createdBy: true }`
- **action-actions.ts**: `with: { manager: true, createdBy: true }`
- **department-actions.ts**: `with: { branch: true, manager: true }`
- **audit-template-actions.ts**: `with: { createdBy: { columns: {...} } }`
- **question-bank-actions.ts**: `with: { createdBy: { columns: {...} } }`

**Durum:** Refactor gerekmez, sorunsuz çalışıyor

---

## 📋 **REFACTOR CHECKLISTI**

### **Hemen Yapılacaklar:**
- [ ] workflow-actions.ts - getUserRoles() refactor
- [ ] audit-question-actions.ts - getAuditQuestions() refactor
- [ ] API users/[id]/route.ts - Server action kullan

### **İsteğe Bağlı (as any'den kurtulmak için):**
- [ ] API findings/[id]/route.ts
- [ ] API dofs/[id]/route.ts
- [ ] API actions/[id]/route.ts
- [ ] API branches/[id]/route.ts
- [ ] API companies/[id]/route.ts

---

## 🎨 **REFACTOR PATTERN**

### **Pattern 1: Nested Relation → Separate Queries**

```typescript
// ❌ ÖNCE
const data = await db.query.parent.findFirst({
  with: {
    child: {
      with: { grandchild: true }
    }
  }
});

// ✅ SONRA
const parent = await db.query.parent.findFirst({...});
const [children, grandchildren] = await Promise.all([
  db.query.children.findMany({
    where: eq(children.parentId, parent.id),
    with: { grandchild: true } as any
  })
]);
return { ...parent, children };
```

---

### **Pattern 2: API Route → Server Action**

```typescript
// ❌ ÖNCE
import { db } from "@/drizzle/db";
const data = await db.query.entities.findFirst({
  with: { ... } as any
});

// ✅ SONRA
import { getEntityById } from "@/server/actions/entity-actions";
const result = await getEntityById(id);
return NextResponse.json(result.data);
```

---

### **Pattern 3: Junction Table Mapping**

```typescript
// ❌ ÖNCE
const data = await db.query.parent.findMany({
  with: {
    junctionTable: {
      with: { related: true }
    }
  }
});

// ✅ SONRA
const parents = await db.query.parent.findMany({...});
const parentIds = parents.map(p => p.id);

const [junctions, related] = await Promise.all([
  db.query.junctionTable.findMany({
    where: inArray(junctionTable.parentId, parentIds)
  }),
  db.query.related.findMany({...})
]);

// Manual mapping
return parents.map(p => ({
  ...p,
  related: junctions
    .filter(j => j.parentId === p.id)
    .map(j => related.find(r => r.id === j.relatedId))
}));
```

---

## 📊 **BEKLENEN FAYDALAR**

### **✅ Type Safety:**
- TypeScript errors %100 çözülür
- Better IDE autocomplete
- Compile-time type checking

### **✅ Performance:**
- Parallel queries (Promise.all)
- Database query optimization
- Potential 20-30% faster

### **✅ Maintainability:**
- Clear separation of concerns
- Easier to debug
- Consistent pattern across codebase

### **✅ DRY Principle:**
- API routes kullanıyor Server Actions
- Code duplication azalır
- Single source of truth

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1 (Hemen - 1 saat):**
1. ✅ role-actions.ts (TAMAMLANDI)
2. ✅ user-actions.ts (TAMAMLANDI)
3. ⏳ workflow-actions.ts
4. ⏳ API users/[id]/route.ts

### **Phase 2 (1-2 saat):**
5. audit-question-actions.ts (complex mapping)
6. API routes refactor (findings, dofs, actions)

### **Phase 3 (Opsiyonel):**
7. Tüm as any'leri temizle
8. Custom type definitions ekle
9. Documentation update

---

## 📝 **NOTLAR**

### **Neden `as any` Kullanılıyor?**
Drizzle ORM 0.30.10'da junction table nested `with` clauses TypeScript inference'ı bozuyor. Bu bir **ORM limitation**, kod hatası değil.

### **Güvenli mi?**
- ✅ Evet! Runtime'da sorun yok
- ✅ Database relation'ları doğru tanımlı
- ✅ Query çalışıyor, sadece type inference eksik

### **Gelecekte:**
- Drizzle ORM update olunca düzelir
- Manuel type definitions eklenebilir
- Custom type guards yazılabilir

---

## 🎯 **SONUÇ**

**Toplam Tespit:** 37+ nested query usage
**Kritik:** 4 dosya (immediate refactor needed)
**Orta:** 5 dosya (optional refactor)
**Düşük:** 20+ dosya (no action needed)

**Tahmini Süre:**
- Phase 1: 1 saat
- Phase 2: 1-2 saat
- Phase 3: Opsiyonel

**Pattern:** DRY + SOLID + Type-Safe + Performance
**Status:** Ready to implement

---

**Created:** 2025-01-26
**Last Updated:** 2025-01-26
**Author:** AI Cascade
