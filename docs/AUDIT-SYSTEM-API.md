# 🔌 Denetim Sistemi - API & Backend

## 📋 İçindekiler
- [API Endpoints](#api-endpoints)
- [Server Actions](#server-actions)
- [Business Logic](#business-logic)
- [Bildirim Sistemi](#bildirim-sistemi)

---

## API Endpoints

### Audit Plans
```
POST   /api/plans                 - Plan oluştur
GET    /api/plans                 - Planları listele
GET    /api/plans/[id]            - Plan detay
PATCH  /api/plans/[id]            - Plan güncelle
DELETE /api/plans/[id]            - Plan sil (soft)
```

### Audits
```
POST   /api/audits                - Denetim oluştur
GET    /api/audits                - Denetimleri listele
GET    /api/audits/[id]           - Denetim detay
PATCH  /api/audits/[id]           - Denetim güncelle
POST   /api/audits/[id]/start     - Denetim başlat
POST   /api/audits/[id]/close     - Denetim kapat

GET    /api/audits/[id]/findings  - Bulguları listele
POST   /api/audits/[id]/findings  - Bulgu oluştur
```

### Findings
```
GET    /api/findings              - Bulguları listele
GET    /api/findings/[id]         - Bulgu detay
PATCH  /api/findings/[id]         - Bulgu güncelle
POST   /api/findings/[id]/approve - Bulgu onayla (denetçi)
POST   /api/findings/[id]/reject  - Bulgu reddet (denetçi)
```

### CAPAs
```
POST   /api/capas                 - CAPA oluştur
GET    /api/capas/[id]            - CAPA detay
PATCH  /api/capas/[id]            - CAPA güncelle

GET    /api/capas/[id]/actions    - CAPA aksiyonları
POST   /api/capas/[id]/actions    - CAPA aksiyonu ekle
```

### Actions
```
POST   /api/actions               - Aksiyon oluştur
GET    /api/actions               - Aksiyonları listele
GET    /api/actions/[id]          - Aksiyon detay
PATCH  /api/actions/[id]          - Aksiyon güncelle

POST   /api/actions/[id]/complete - Tamamla (sorumlu)
POST   /api/actions/[id]/approve  - Onayla (yönetici)
POST   /api/actions/[id]/reject   - Reddet (yönetici)
POST   /api/actions/[id]/cancel   - İptal et
```

---

## Server Actions

### Plan Actions
```typescript
createScheduledPlan(data)  // Scheduled plan oluştur
startAdhocAudit(data)      // Adhoc denetim başlat
updatePlan(id, data)       // Plan güncelle
```

### Audit Actions
```typescript
startAudit(auditId)        // Denetim başlat
closeAudit(auditId)        // Denetim kapat
addQuestion(auditId, data) // Soru ekle
answerQuestion(id, data)   // Soru cevapla
```

### Finding Actions
```typescript
createFinding(data)        // Bulgu oluştur
approveFinding(id)         // Bulgu onayla
rejectFinding(id, reason)  // Bulgu reddet
```

### CAPA Actions
```typescript
createCapa(data)           // CAPA oluştur
updateCapa(id, data)       // CAPA güncelle
```

### Action Actions
```typescript
createAction(data)         // Aksiyon oluştur
completeAction(id, notes)  // Aksiyon tamamla
approveAction(id)          // Aksiyon onayla
rejectAction(id, reason)   // Aksiyon reddet
cancelAction(id, reason)   // Aksiyon iptal et
```

---

## Business Logic

### Status Transitions

```typescript
// Audit tamamlanma kontrolü
async function checkAuditCompletion(auditId) {
  const findings = await getFindings(auditId);
  if (findings.every(f => f.status === "Closed")) {
    await updateAudit(auditId, { status: "PendingClosure" });
  }
}

// Finding tamamlanma kontrolü
async function checkFindingCompletion(findingId) {
  const simpleActions = await getSimpleActions(findingId);
  const capas = await getCapas(findingId);
  
  const simpleComplete = simpleActions.every(a => a.status === "Completed");
  const capasComplete = await areCapasComplete(capas);
  
  if (simpleComplete && capasComplete) {
    await updateFinding(findingId, { status: "PendingClosure" });
  }
}

// CAPA status hesaplama
function getCapaStatus(capaId) {
  const actions = getCapaActions(capaId);
  
  if (actions.length === 0) return "Draft";
  if (actions.every(a => a.status === "Completed")) return "Closed";
  if (actions.some(a => a.status === "PendingManagerApproval")) return "UnderReview";
  if (actions.some(a => a.status === "Assigned")) return "InProgress";
  
  return "Open";
}
```

---

## Bildirim Sistemi

### Bildirim Tipleri
```typescript
"AUDIT_SCHEDULED"          // Denetim tarihi yaklaştı
"FINDING_ASSIGNED"         // Bulgu atandı
"ACTION_ASSIGNED"          // Aksiyon atandı
"ACTION_PENDING_APPROVAL"  // Aksiyon onay bekliyor
"ACTION_APPROVED"          // Aksiyon onaylandı
"ACTION_REJECTED"          // Aksiyon reddedildi
"FINDING_PENDING_CLOSURE"  // Bulgu onay bekliyor
"FINDING_APPROVED"         // Bulgu onaylandı
"FINDING_REJECTED"         // Bulgu reddedildi
"AUDIT_PENDING_CLOSURE"    // Denetim onay bekliyor
"AUDIT_CLOSED"             // Denetim kapandı
"ACTION_OVERDUE"           // Aksiyon gecikti
```

### Bildirim Gönderme
```typescript
async function sendNotification(
  userId: string,
  type: NotificationType,
  data: any
) {
  // 1. Database'e kaydet
  await db.insert(notifications).values({
    userId,
    type,
    title: getNotificationTitle(type),
    message: getNotificationMessage(type, data),
    data,
  });
  
  // 2. Email gönder (opsiyonel)
  if (shouldSendEmail(userId, type)) {
    await sendEmail(userId, type, data);
  }
  
  // 3. Push notification (opsiyonel)
  if (shouldSendPush(userId, type)) {
    await sendPush(userId, type, data);
  }
}
```

---

**Versiyon:** 1.0  
**Son Güncelleme:** 23 Ekim 2025  
**Durum:** Planlama Aşaması
