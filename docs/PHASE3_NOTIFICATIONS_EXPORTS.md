# Phase 3: Bildirim & Export Sistemi - Planlama

## 🎯 Hedef: Ortak Modüller (DRY & SOLID)

---

## 📧 1. BİLDİRİM SİSTEMİ

### 1.1 Database Schema

```typescript
// notifications table
{
  id: uuid
  userId: uuid (FK -> User)
  type: enum ('email', 'in_app', 'both')
  category: enum ('finding_assigned', 'action_assigned', 'dof_assigned', 
                  'action_approved', 'action_rejected', 'dof_approved', 
                  'plan_created', 'audit_completed')
  title: string
  message: string
  relatedEntityType: enum ('finding', 'action', 'dof', 'audit', 'plan')
  relatedEntityId: uuid
  isRead: boolean (default: false)
  sentAt: timestamp
  readAt: timestamp?
  emailSentAt: timestamp?
}

// notification_preferences table
{
  id: uuid
  userId: uuid (FK -> User)
  emailEnabled: boolean (default: true)
  inAppEnabled: boolean (default: true)
  findingNotifications: boolean (default: true)
  actionNotifications: boolean (default: true)
  dofNotifications: boolean (default: true)
  planNotifications: boolean (default: true)
}
```

### 1.2 Bildirim Tetikleme Noktaları

| Olay | Kimler Bildirim Alır | Kategori |
|------|---------------------|----------|
| **Finding Oluşturuldu** | Süreç Sahibi | `finding_assigned` |
| **Finding Atandı** | Yeni Süreç Sahibi | `finding_assigned` |
| **Aksiyon Oluşturuldu** | Aksiyon Sorumlusu | `action_assigned` |
| **Aksiyon Tamamlandı** | Aksiyon Yöneticisi | `action_pending_approval` |
| **Aksiyon Onaylandı** | Aksiyon Sorumlusu | `action_approved` |
| **Aksiyon Reddedildi** | Aksiyon Sorumlusu | `action_rejected` |
| **DÖF Oluşturuldu** | DÖF Sorumlusu | `dof_assigned` |
| **DÖF Onaya Gitti** | DÖF Yöneticisi | `dof_pending_approval` |
| **DÖF Onaylandı** | DÖF Sorumlusu | `dof_approved` |
| **Planlı Denetim Oluştu** | Denetim Sahibi | `plan_created` |
| **Denetim Tamamlandı** | Bulgu Sahipleri | `audit_completed` |

### 1.3 Notification Service (Ortak Modül)

```typescript
// src/lib/notifications/notification-service.ts

interface NotificationData {
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  relatedEntityType: 'finding' | 'action' | 'dof' | 'audit' | 'plan';
  relatedEntityId: string;
  sendEmail?: boolean;
  sendInApp?: boolean;
}

class NotificationService {
  // Ana method - hem email hem in-app
  async send(data: NotificationData): Promise<void>
  
  // Sadece in-app
  async createInAppNotification(data): Promise<void>
  
  // Sadece email
  async sendEmail(data): Promise<void>
  
  // Toplu bildirim
  async sendBulk(notifications: NotificationData[]): Promise<void>
  
  // Kullanıcı tercihlerini kontrol et
  async shouldSendNotification(userId: string, category: string): Promise<boolean>
}
```

### 1.4 Email Templates (React Email)

```typescript
// src/emails/
├── finding-assigned.tsx        // Bulgu atandı
├── action-assigned.tsx         // Aksiyon atandı
├── action-approved.tsx         // Aksiyon onaylandı
├── dof-assigned.tsx           // DÖF atandı
├── plan-created.tsx           // Planlı denetim oluştu
└── layouts/
    └── base-template.tsx      // Ortak layout
```

### 1.5 In-App Notifications UI

```
Navbar → Bildirim ikonu (🔔)
      → Badge (okunmamış sayısı)
      → Dropdown:
         [Yeni Bulgu Atandı] - 2 dk önce
         [Aksiyonunuz Onaylandı] - 1 saat önce
         [DÖF Sorumlusu Olarak Atandınız] - dün
      → "Tümünü Gör" → /notifications sayfası
```

---

## 📊 2. EXCEL EXPORT SİSTEMİ (Ortak Modül)

### 2.1 Export Service

```typescript
// src/lib/export/excel-export-service.ts

interface ExportOptions {
  filename: string;
  sheetName: string;
  data: any[];
  columns: ColumnDefinition[];
  includeFilters?: boolean;
  includeTimestamp?: boolean;
}

class ExcelExportService {
  // Generic export
  async exportToExcel(options: ExportOptions): Promise<Buffer>
  
  // Styled export (başlıklar, renkler)
  async exportStyledExcel(options: ExportOptions): Promise<Buffer>
  
  // Multi-sheet export
  async exportMultiSheet(sheets: ExportOptions[]): Promise<Buffer>
}
```

### 2.2 Export Kullanım Yerleri

| Sayfa | Export İçeriği |
|-------|---------------|
| **Bulgular** | Tüm bulgular listesi (durum, risk, tarih) |
| **Aksiyonlar** | Aksiyonlar listesi (sorumlu, durum) |
| **DÖF'ler** | DÖF listesi (7 adım durumları) |
| **Denetim Detay** | Denetim + Bulgular + Sorular + Cevaplar |
| **Soru Havuzu** | Havuz + Tüm sorular |
| **Planlar** | Plan listesi |

### 2.3 Export Buttons

```tsx
// Her liste sayfasında:
<Button onClick={() => exportToExcel()}>
  <Download className="mr-2 h-4 w-4" />
  Excel İndir
</Button>

// Server Action:
export async function exportFindings() {
  const findings = await getFindings();
  const buffer = await ExcelExportService.exportToExcel({
    filename: `bulgular_${Date.now()}.xlsx`,
    sheetName: "Bulgular",
    data: findings,
    columns: [
      { header: "Bulgu", key: "details" },
      { header: "Durum", key: "status" },
      { header: "Risk", key: "riskType" },
      // ...
    ]
  });
  return buffer;
}
```

---

## 📝 3. EKSİK SAYFALAR

### 3.1 Question Bank Detay
```
/denetim/question-banks/[id]
├── Havuz bilgileri (Card)
├── Soru listesi (DataTable)
│   ├── Sıra
│   ├── Soru metni
│   ├── Tip
│   ├── Zorunlu
│   └── Actions (Düzenle, Sil, Sırala)
└── "Yeni Soru Ekle" butonu
```

### 3.2 Soru Ekleme/Düzenleme Formu
```
/denetim/question-banks/[id]/questions/new
/denetim/question-banks/[id]/questions/[questionId]/edit

Form alanları:
- Soru metni *
- Soru tipi * (YesNo, Scale, Text, Checklist)
- Yardım metni
- [Eğer Checklist] Seçenekler (dinamik input)
- Zorunlu mu? (checkbox)
- Sıra numarası
```

### 3.3 Template Detay
```
/denetim/templates/[id]
├── Şablon bilgileri
├── Kullanılan Soru Havuzları (liste)
│   └── Her havuzun soru sayısı
├── Toplam soru sayısı
└── "Denetim Başlat" butonu
```

### 3.4 Audit Detay - Soruları Göster
```
/denetim/audits/[id]
├── Denetim bilgileri
├── Tab: "Bulgular" | "Sorular" | "İlerleme"
│   
└── Sorular Tab:
    ├── İlerleme (%75 tamamlandı)
    ├── Soru havuzlarına göre gruplu
    ├── Her soru:
    │   ├── Soru metni
    │   ├── Cevap (badge)
    │   ├── Uygunsuzluk durumu
    │   └── Cevaplayan kişi
    └── "Soruları Cevapla" butonu
```

---

## 🤖 4. CRON JOB DEPLOYMENT

### 4.1 API Route
```typescript
// src/app/api/cron/create-scheduled-audits/route.ts

export async function GET(request: Request) {
  try {
    // 1. Authorization kontrolü
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // 2. Scheduled audits oluştur
    const result = await createScheduledAudits();
    
    // 3. Her oluşturulan denetim için bildirim gönder
    if (result.success) {
      // Notification service kullan
    }
    
    return Response.json({ 
      success: true, 
      created: result.data.created 
    });
  } catch (error) {
    return Response.json({ success: false, error }, { status: 500 });
  }
}
```

### 4.2 Vercel Cron Config
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/create-scheduled-audits",
    "schedule": "0 0 * * *"  // Her gün 00:00
  }]
}
```

### 4.3 Environment Variables
```env
CRON_SECRET=your-super-secret-cron-token-here
```

---

## 📦 5. NPM PACKAGES GEREKLİ

```json
{
  "dependencies": {
    // Email
    "resend": "^2.0.0",           // Email servisi
    "@react-email/components": "latest",
    
    // Excel
    "exceljs": "^4.4.0",          // Excel oluşturma
    
    // Notifications (optional)
    "pusher": "^5.2.0",           // Real-time (opsiyonel)
    "pusher-js": "^8.4.0"
  }
}
```

---

## 🗓️ İMPLEMENTASYON PLANI

### Week 1: Bildirim Sistemi (3-4 gün)
**Day 1-2: Database & Service**
- [ ] notifications tablosu
- [ ] notification_preferences tablosu
- [ ] NotificationService class
- [ ] Kullanıcı tercihleri CRUD

**Day 3: Email Templates**
- [ ] Base template
- [ ] 5 ana email template (finding, action, dof, plan, audit)
- [ ] Resend entegrasyonu

**Day 4: In-App UI**
- [ ] Navbar bildirim ikonu
- [ ] Notification dropdown
- [ ] /notifications sayfası
- [ ] Mark as read functionality

### Week 2: Excel Export (2 gün)
**Day 1: Export Service**
- [ ] ExcelExportService class
- [ ] Generic export function
- [ ] Styled export (renkler, başlıklar)

**Day 2: Integration**
- [ ] Findings export
- [ ] Actions export
- [ ] DOFs export
- [ ] Audit report export

### Week 3: Eksik Sayfalar (2-3 gün)
**Day 1:**
- [ ] Question Bank detay sayfası
- [ ] Soru listesi (DataTable)

**Day 2:**
- [ ] Soru ekleme formu
- [ ] Soru düzenleme formu
- [ ] Sıralama (order_index update)

**Day 3:**
- [ ] Template detay
- [ ] Audit detay - Sorular tab

### Week 4: CRON & Polish (1-2 gün)
**Day 1:**
- [ ] CRON API route
- [ ] vercel.json config
- [ ] Authorization
- [ ] Notification entegrasyonu

**Day 2:**
- [ ] Testing
- [ ] Bug fixes
- [ ] Documentation

---

## 🎯 ÖNCELİK SIRASI

### P0 (Kritik - Hemen)
1. ✅ Bildirim Servisi (NotificationService)
2. ✅ Email Templates (5 temel template)
3. ✅ In-App Notifications UI

### P1 (Yüksek - Bu hafta)
4. ✅ Excel Export Service
5. ✅ Export buttons (Findings, Actions, DOFs)
6. ✅ Question Bank detay + Soru ekleme

### P2 (Orta - Sonraki hafta)
7. ✅ CRON Job deployment
8. ✅ Template detay
9. ✅ Audit detay - Sorular tab

### P3 (Düşük - Gelecek)
10. Real-time notifications (Pusher)
11. PDF export (denetim raporu)
12. Excel import (soru toplu ekleme)

---

## 🔥 HEMEN BAŞLAYALIM!

Hangi modülden başlamak istersiniz?

**A)** Bildirim Sistemi (Database + Service)
**B)** Excel Export (ExcelJS entegre)
**C)** Question Bank detay + Soru ekleme
**D)** CRON Job setup

**Tavsiyem: A → B → C → D sırasıyla!**
