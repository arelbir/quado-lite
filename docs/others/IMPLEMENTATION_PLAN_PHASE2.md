# Soru Havuzu & Denetim Planlama Sistemi - İmplementasyon Planı

## 📋 Genel Bakış

Denetim sistemine eklenecek yeni modüller:
1. Soru Havuzu (Question Bank)
2. Denetim Şablonları (Audit Templates)
3. Denetim Planlama (Scheduled/Adhoc Audits)
4. Soru-Cevap Sistemi

---

## 🗄️ Database Şeması (5 Yeni Tablo)

### 1. question_banks
```sql
- id (uuid, PK)
- name (text)
- description (text)
- category (enum: Kalite, Çevre, İSG, Bilgi Güvenliği, Gıda Güvenliği, Diğer)
- is_active (boolean)
- created_by_id (uuid, FK -> users)
- timestamps
```

### 2. questions
```sql
- id (uuid, PK)
- bank_id (uuid, FK -> question_banks)
- question_text (text)
- question_type (enum: YesNo, Scale, Text, Checklist)
- help_text (text)
- checklist_options (json array)
- is_mandatory (boolean)
- order_index (numeric)
- timestamps
```

### 3. audit_templates
```sql
- id (uuid, PK)
- name (text)
- description (text)
- category (enum)
- question_bank_ids (json array of UUIDs)
- estimated_duration_minutes (numeric)
- timestamps
```

### 4. audit_plans
```sql
- id (uuid, PK)
- title (text)
- schedule_type (enum: Scheduled, Adhoc)
- status (enum: Pending, Created, Cancelled)
- template_id (uuid, FK -> audit_templates)
- scheduled_date (timestamp)
- created_audit_id (uuid, FK -> audits)
- timestamps
```

### 5. audit_questions
```sql
- id (uuid, PK)
- audit_id (uuid, FK -> audits)
- question_id (uuid, FK -> questions)
- answer (text)
- notes (text)
- is_non_compliant (boolean)
- answered_by_id (uuid, FK -> users)
- answered_at (timestamp)
- timestamps
```

---

## 🔄 İş Akışı

### Akış 1: Soru Havuzu Oluşturma
```
1. Admin → Soru Havuzu Oluştur (Kalite, İSG vb.)
2. Admin → Havuza Sorular Ekle
   - Soru tipi seç (Evet/Hayır, Ölçek, Metin)
   - Soru metnini gir
   - Zorunlu mu? işaretle
3. Sorular sıralanabilir (drag-drop)
```

### Akış 2: Denetim Şablonu Oluşturma
```
1. Admin → Denetim Şablonu Oluştur
2. Şablon bilgileri gir (ad, kategori, açıklama)
3. Kullanılacak Soru Havuzlarını seç
4. Tahmini süre gir
5. Şablonu kaydet
```

### Akış 3: Planlı Denetim Oluşturma
```
1. Admin → Denetim Planla
2. Plan tipi: "Planlı" seç
3. Şablon seç
4. Tarih belirle
5. Plan kaydet
---
[CRON JOB] Her gün 00:00'da çalışır
- Bugünün tarihindeki planları bul
- Her plan için:
  * Yeni Audit oluştur
  * Şablondaki soru havuzlarından soruları kopyala
  * audit_questions tablosuna ekle
  * Plan durumunu "Created" yap
```

### Akış 4: Plansız Denetim Başlatma
```
1. Denetçi → Plansız Denetim Başlat
2. Plan tipi: "Plansız" seç
3. Şablon seç
4. Hemen "Denetim Başlat" butonu
5. Denetim oluşur, sorular eklenir
6. Denetçi soruları cevaplar
```

### Akış 5: Denetim Cevaplama
```
1. Denetçi → Denetim Aç
2. Soru listesi gösterilir
3. Her soru için:
   - Cevap ver (Evet/Hayır/Ölçek/Metin)
   - Not ekle
   - Uygunsuzluk varsa işaretle
4. Uygunsuzluk işaretlenenler → Otomatik Finding olur
```

---

## 📁 Dosya Yapısı

### Backend (Server Actions)
```
src/action/
  ├── question-bank-actions.ts     # Soru havuzu CRUD
  ├── question-actions.ts          # Soru CRUD
  ├── audit-template-actions.ts    # Şablon CRUD
  ├── audit-plan-actions.ts        # Plan CRUD
  └── audit-question-actions.ts    # Soru cevaplama
```

### Frontend (Pages)
```
src/app/(main)/denetim/
  ├── question-banks/
  │   ├── page.tsx                 # Soru havuzu listesi
  │   ├── new/page.tsx             # Yeni havuz
  │   └── [id]/
  │       ├── page.tsx             # Havuz detay + sorular
  │       └── questions/new/       # Yeni soru
  │
  ├── templates/
  │   ├── page.tsx                 # Şablon listesi
  │   ├── new/page.tsx             # Yeni şablon
  │   └── [id]/page.tsx            # Şablon detay
  │
  ├── plans/
  │   ├── page.tsx                 # Plan listesi
  │   ├── new/page.tsx             # Yeni plan (planlı/plansız)
  │   └── [id]/page.tsx            # Plan detay
  │
  └── audits/[id]/
      └── questions/page.tsx       # Soru cevaplama sayfası
```

### Components
```
src/components/
  ├── question-form.tsx            # Soru ekleme formu
  ├── question-list.tsx            # Soru listesi (drag-drop)
  ├── question-bank-selector.tsx  # Havuz seçici
  ├── template-selector.tsx        # Şablon seçici
  └── question-answer-form.tsx     # Soru cevaplama
```

---

## ⏰ Cron Job (Planlı Denetim Otomasyonu)

### Seçenek 1: Vercel Cron (Önerilen)
```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/cron/create-scheduled-audits",
    "schedule": "0 0 * * *"  // Her gün 00:00
  }]
}

// src/app/api/cron/create-scheduled-audits/route.ts
export async function GET(request: Request) {
  // Authorization check (cron secret)
  // Bugünkü planları bul
  // Denetim oluştur
  // Return JSON response
}
```

### Seçenek 2: Node-cron (Self-hosted)
```javascript
// src/lib/cron.ts
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  await createScheduledAudits();
});
```

---

## 🎯 İmplementasyon Adımları

### Phase 2.1: Database (1-2 saat)
- [x] Schema oluşturma (question-bank.ts)
- [ ] Drizzle push
- [ ] Seed data (örnek soru havuzları)

### Phase 2.2: Backend (3-4 saat)
- [ ] question-bank-actions.ts
- [ ] question-actions.ts
- [ ] audit-template-actions.ts
- [ ] audit-plan-actions.ts
- [ ] audit-question-actions.ts

### Phase 2.3: Frontend - Soru Havuzu (2-3 saat)
- [ ] Havuz listesi + CRUD
- [ ] Soru listesi + CRUD
- [ ] Drag-drop sıralama

### Phase 2.4: Frontend - Şablonlar (2-3 saat)
- [ ] Şablon listesi + CRUD
- [ ] Soru havuzu seçim UI

### Phase 2.5: Frontend - Planlama (2-3 saat)
- [ ] Plan listesi
- [ ] Planlı plan oluşturma
- [ ] Plansız denetim başlatma

### Phase 2.6: Frontend - Cevaplama (2-3 saat)
- [ ] Soru cevaplama UI
- [ ] Uygunsuzluk → Finding otomatik

### Phase 2.7: Cron Job (1-2 saat)
- [ ] API endpoint
- [ ] Vercel cron config
- [ ] Test

---

## 🔒 Yetkilendirme

### Roller:
- **Admin/Denetçi**: Soru havuzu, şablon, plan oluşturabilir
- **Denetçi**: Denetim yapabilir, soruları cevaplayabilir
- **Süreç Sahibi**: Sadece kendine atanan denetimleri görebilir

---

## 📊 Toplam Tahmini Süre: 15-20 saat

**Şimdi başlayalım mı? İlk adımı (Database push + seed) yapayım mı?**
