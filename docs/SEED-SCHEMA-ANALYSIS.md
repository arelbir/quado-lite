# 🔍 SEED vs SCHEMA ANALİZİ

## ❌ **EKSİK KOLONLAR - SCHEMA'DA VAR AMA SEED'DE YOK**

### **1. Companies (companies)**
Schema kolonları:
```typescript
- name ✅
- code ✅
- legalName ✅
- taxNumber ✅
- country ✅
- city ✅
- address ✅
- phone ✅
- email ✅
- website ✅
- isActive ✅
- createdById ❌ (Users oluşmadan önce, normal)
```

**Durum:** ✅ İyi (createdById dışında tamamlanmış)

---

### **2. Branches (branches)**
Schema kolonları:
```typescript
- companyId ✅
- name ✅
- code ✅
- type ✅ (Headquarters, Branch, Factory, Sales Office)
- country ✅
- city ✅
- address ✅
- phone ❌ EKSİK!
- managerId ❌ EKSİK! (Users'dan sonra atanabilir)
- isActive ✅
- createdById ❌ (Users oluşmadan önce, normal)
```

**Eksik:**
- `phone` - Her branch'in telefonu olmalı
- `managerId` - Branch manager atanmalı (users'dan sonra)

---

### **3. Departments (departments)**
Schema kolonları:
```typescript
- name ✅
- code ✅
- description ✅
- branchId ❌ EKSİK! KRİTİK!
- parentDepartmentId ❌ EKSİK!
- managerId ❌ EKSİK! (Users'dan sonra atanabilir)
- costCenter ❌ EKSİK!
- budget ❌ EKSİK!
- isActive ❌ EKSİK!
- createdById ❌ (Users oluşmadan önce, normal)
```

**KRİTİK Eksikler:**
- `branchId` - Department hangi branch'te? ⚠️ MUHTEMELİ OLMALI
- `parentDepartmentId` - Nested departments (opsiyonel)
- `managerId` - Department manager
- `costCenter` - Maliyet merkezi (opsiyonel ama iyi olur)
- `isActive` - Status

---

### **4. Positions (positions)**
Schema kolonları:
```typescript
- name ✅
- code ✅
- description ❌ EKSİK!
- level ✅
- category ✅
- salaryGrade ❌ EKSİK!
- isActive ❌ EKSİK!
- createdById ❌ (Users oluşmadan önce, normal)
```

**Eksikler:**
- `description` - Position tanımı
- `salaryGrade` - Maaş kademesi (opsiyonel)
- `isActive` - Status

---

### **5. Users (user table)**
**Kontrol Edilmeli:** 02-users.ts
- branchId
- departmentId
- positionId
- managerId
- salary/salaryGrade gibi alanlar

---

### **6. Teams (teams)**
**Kontrol Edilmeli:** 06-teams-groups.ts
- departmentId
- leaderId
- description

---

### **7. Groups (groups)**
**Kontrol Edilmeli:** 06-teams-groups.ts
- ownerId ✅ (eklendi)
- description
- category

---

## 🎯 **ÖNCELİKLİ DÜZELTMELER**

### **KRİTİK (Hemen yapılmalı):**
1. ✅ **Departments.branchId** - Departmanlar branch'lere atanmalı
2. ✅ **Departments.isActive** - Status field
3. ✅ **Positions.isActive** - Status field
4. ✅ **Branches.phone** - İletişim bilgisi

### **YÜKSEK (Öncelikli):**
5. ⚠️ **Departments.costCenter** - Finans tracking
6. ⚠️ **Positions.description** - Pozisyon detayı
7. ⚠️ **Users.branchId** - Users branch'e bağlı mı?
8. ⚠️ **Users.departmentId** - Users departmana bağlı

### **ORTA (Users'dan sonra):**
9. 🔵 **Branches.managerId** - Branch manager
10. 🔵 **Departments.managerId** - Dept manager
11. 🔵 **Teams.leaderId** - Team lead

---

## 📊 **SCHEMA UYUM SKORU**

| Tablo | Dolu Kolonlar | Toplam Kolon | Skor |
|-------|---------------|--------------|------|
| Companies | 11/12 | 12 | ⭐⭐⭐⭐⭐ 92% |
| Branches | 8/11 | 11 | ⭐⭐⭐⭐☆ 73% |
| Departments | 3/11 | 11 | ⭐⭐☆☆☆ 27% ❌ |
| Positions | 5/9 | 9 | ⭐⭐⭐☆☆ 56% |

**ORTALAMA:** ⭐⭐⭐☆☆ **62%** - İYİLEŞTİRİLMELİ!

---

## ✅ **AKSIYON PLANI**

### **Phase 1: Kritik Alanlar (5 dk)**
```typescript
// 01-organization.ts
branches: {
  phone: "+90 312 xxx xxxx" ✅ EKLE
}

departments: {
  branchId: branch.id ✅ EKLE
  isActive: true ✅ EKLE
  costCenter: "CC-xxx" ✅ EKLE
}

positions: {
  description: "..." ✅ EKLE
  isActive: true ✅ EKLE
}
```

### **Phase 2: Users Integration (10 dk)**
```typescript
// 02-users.ts
// branchId, departmentId kontrolü
// Gerçekçi dağılım
```

### **Phase 3: Manager Assignments (15 dk)**
```typescript
// Separate script veya UI'dan
// Branch managers
// Department managers
// Team leaders
```

---

## 🚨 **SONRAKİ ADIM**

1. ✅ Departments'a `branchId`, `isActive`, `costCenter` ekle
2. ✅ Positions'a `description`, `isActive` ekle
3. ✅ Branches'a `phone` ekle
4. ⚠️ 02-users.ts'i kontrol et
5. ⚠️ 06-teams-groups.ts'i kontrol et

**Target:** %90+ schema uyumu!
