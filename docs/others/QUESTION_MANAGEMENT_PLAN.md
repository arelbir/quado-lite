# Soru Yönetimi Yapısı - Planlama

## 🎯 Hedef
Mevcut soruları kolayca görüntüleyip düzenleyebilen, sezgisel bir yönetim arayüzü

---

## 📋 ÖZELLİKLER

### 1. Soru Düzenleme Sayfası
```
/denetim/question-banks/[bankId]/questions/[questionId]/edit
```

**Özellikler:**
- ✅ Mevcut soru bilgilerini dolu göster
- ✅ Tüm alanları düzenlenebilir yap
- ✅ Checklist seçeneklerini ekle/sil/düzenle
- ✅ Soru tipini değiştir
- ✅ Kaydet / İptal butonları
- ✅ Silme butonu (soft delete)

---

### 2. Gelişmiş Soru Listesi (Question Bank Detay)
```
/denetim/question-banks/[bankId]
```

**Mevcut:**
- ✅ Soruları listeler
- ✅ Düzenle butonu var

**Eklenecekler:**
- [ ] **Inline düzenleme** (hızlı edit)
- [ ] **Drag & Drop sıralama**
- [ ] **Toplu işlemler** (seçili soruları sil/kopyala)
- [ ] **Soru önizleme** (modal)
- [ ] **Filtreleme** (tip, zorunlu/opsiyonel)
- [ ] **Arama** (soru metni içinde)

---

### 3. Soru Kopyalama
**Use Case:**
Admin başka bir havuzdan soru kopyalamak isteyebilir

**Özellikler:**
- [ ] "Sorudan Kopyala" butonu
- [ ] Havuz seçici
- [ ] Soru listesi (multi-select)
- [ ] Toplu kopyalama

---

### 4. Soru Versiyonlama (İleri Seviye)
**Use Case:**
Soru metni değiştiğinde eski denetimlerdeki cevaplar kaybolmasın

**Özellikler:**
- [ ] Soru versiyonları
- [ ] Versiyon geçmişi
- [ ] Hangisi aktif?

---

## 🎨 UI/UX TASARIMI

### A) Soru Listesi (Geliştirilmiş)

```
┌─────────────────────────────────────────────────────────┐
│ ISO 9001 Kalite Yönetimi Havuzu                         │
│ 12 soru • Kalite • Aktif                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [🔍 Ara...] [Filter: Tümü ▼] [Yeni Soru +]             │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ☰ #1  [Evet/Hayır] [Zorunlu]                           │
│       Kalite politikası belgelenmiş ve güncel mi?       │
│       💡 ISO 9001 Madde 5.2                             │
│       [Düzenle] [Kopyala] [Sil]                         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ ☰ #2  [Ölçek 1-5]                                      │
│       Müşteri memnuniyeti ölçümü yapılıyor mu?          │
│       [Düzenle] [Kopyala] [Sil]                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### B) Soru Düzenleme Sayfası

```
┌─────────────────────────────────────────────────────────┐
│ [← Geri]  Soru Düzenle                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Soru Metni *                                            │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Kalite politikası belgelenmiş ve güncel mi?    │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Soru Tipi *                                             │
│ [Evet/Hayır ▼]                                          │
│                                                          │
│ Yardım Metni                                            │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ISO 9001 Madde 5.2'ye bakınız                   │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ☑ Zorunlu soru                                          │
│                                                          │
│ Sıra Numarası: [0]                                      │
│                                                          │
│ [❌ Soruyu Sil]  [İptal] [💾 Değişiklikleri Kaydet]    │
└─────────────────────────────────────────────────────────┘
```

### C) Drag & Drop Sıralama

```
┌─────────────────────────────────────────────────────────┐
│ [Sıralamayı Değiştir Modu]                              │
│                                                          │
│ ☰ Kalite politikası...          ↑↓                      │
│ ☰ Müşteri memnuniyeti...        ↑↓                      │
│ ☰ Süreç performansı...          ↑↓                      │
│ ☰ Doküman kontrolü...           ↑↓                      │
│                                                          │
│ [İptal] [Sıralamayı Kaydet]                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 BACKEND ACTIONS (Eklenecek)

### 1. updateQuestion (✅ Mevcut)
```typescript
await updateQuestion(questionId, {
  questionText: "Yeni metin",
  questionType: "Scale",
  helpText: "Yeni ipucu",
  checklistOptions: ["A", "B"],
  isMandatory: false,
  orderIndex: "5"
});
```

### 2. deleteQuestion (✅ Mevcut)
```typescript
await deleteQuestion(questionId); // Soft delete
```

### 3. updateQuestionOrder (✅ Mevcut)
```typescript
await updateQuestionOrder([
  { id: "q1", orderIndex: "0" },
  { id: "q2", orderIndex: "1" },
  { id: "q3", orderIndex: "2" }
]);
```

### 4. copyQuestion (YENİ)
```typescript
await copyQuestion({
  questionId: "source-id",
  targetBankId: "target-bank-id"
});
```

### 5. bulkDeleteQuestions (YENİ)
```typescript
await bulkDeleteQuestions(["q1", "q2", "q3"]);
```

### 6. getQuestionById (YENİ)
```typescript
const question = await getQuestionById(questionId);
```

---

## 📦 COMPONENTS (Oluşturulacak)

### 1. EditQuestionForm
**Konum:** `/denetim/question-banks/[bankId]/questions/[questionId]/edit`
**Props:** questionId, bankId
**Özellikler:**
- Form dolu gelir (existing data)
- Tüm alanlar düzenlenebilir
- Save/Cancel/Delete butonları

### 2. QuestionListItem (Reusable)
**Props:** question, onEdit, onDelete, onDragStart, onDragEnd
**Özellikler:**
- Compact görünüm
- Quick actions (düzenle, sil, kopyala)
- Drag handle (☰)

### 3. QuestionFilters
**Props:** onFilterChange
**Özellikler:**
- Tip filtresi (YesNo, Scale, Text, Checklist)
- Zorunluluk filtresi (Tümü, Zorunlu, Opsiyonel)
- Arama input

### 4. QuestionPreviewModal
**Props:** question, isOpen, onClose
**Özellikler:**
- Soruyu preview mode'da göster
- Cevap formatını göster
- "Düzenle" butonu

### 5. DragDropQuestionList (İleri Seviye)
**Props:** questions, onReorder
**Özellikler:**
- Drag & drop sıralama
- @dnd-kit/sortable kullanarak
- Smooth animations

### 6. BulkActionsToolbar
**Props:** selectedQuestions, onDelete, onCopy
**Özellikler:**
- Seçili soru sayısı
- Toplu silme
- Toplu kopyalama

---

## 🗂️ DOSYA YAPISI

```
src/app/(main)/denetim/question-banks/[id]/
├── page.tsx (✅ Mevcut - geliştirilecek)
│
├── questions/
│   ├── new/
│   │   ├── page.tsx (✅ Mevcut)
│   │   └── create-question-form.tsx (✅ Mevcut)
│   │
│   └── [questionId]/
│       └── edit/
│           ├── page.tsx (🆕 Yeni)
│           └── edit-question-form.tsx (🆕 Yeni)

src/components/questions/
├── question-list-item.tsx (🆕 Yeni)
├── question-filters.tsx (🆕 Yeni)
├── question-preview-modal.tsx (🆕 Yeni)
├── drag-drop-question-list.tsx (🆕 İleri seviye)
└── bulk-actions-toolbar.tsx (🆕 İleri seviye)

src/action/
└── question-actions.ts (✅ Mevcut - yeni functionlar eklenecek)
    ├── getQuestionById() (🆕)
    ├── copyQuestion() (🆕)
    └── bulkDeleteQuestions() (🆕)
```

---

## 📝 İMPLEMENTASYON PLANI

### PHASE A: Temel Düzenleme (2-3 saat)
**Priority: HIGH**

**Week 1 - Day 1:**
- [x] `getQuestionById()` action
- [x] Edit question page
- [x] Edit question form
- [x] Delete functionality

**Sonuç:** Admin soruları düzenleyebilir + silebilir

---

### PHASE B: Gelişmiş Listeleme (2-3 saat)
**Priority: MEDIUM**

**Week 1 - Day 2:**
- [ ] QuestionListItem component
- [ ] QuestionFilters component
- [ ] Arama fonksiyonu
- [ ] Filtreleme logic

**Sonuç:** Sorular arasında hızlıca gezinilebilir

---

### PHASE C: Soru Kopyalama (1-2 saat)
**Priority: MEDIUM**

**Week 1 - Day 3:**
- [ ] `copyQuestion()` action
- [ ] Copy button UI
- [ ] Source bank selector
- [ ] Success feedback

**Sonuç:** Sorular havuzlar arası kopyalanabilir

---

### PHASE D: Drag & Drop (3-4 saat)
**Priority: LOW (Nice to have)

**Week 2:**
- [ ] @dnd-kit/sortable kurulumu
- [ ] DragDropQuestionList component
- [ ] Drag handles
- [ ] Reorder animation
- [ ] Save order

**Sonuç:** Sıralama kolayca değiştirilebilir

---

### PHASE E: Toplu İşlemler (2 saat)
**Priority: LOW**

**Week 2:**
- [ ] Multi-select checkbox
- [ ] BulkActionsToolbar
- [ ] bulkDeleteQuestions() action
- [ ] Confirmation dialogs

**Sonuç:** Birden fazla soru toplu işlenebilir

---

## 🎯 ÖNCELİK SIRASI

### P0 (Kritik - Hemen Yapılmalı)
1. ✅ **Edit Question Page** - Düzenleme olmazsa olmaz
2. ✅ **Edit Question Form** - Form dolu gelsin
3. ✅ **Delete Button** - Silme fonksiyonu

### P1 (Yüksek - Bu Hafta)
4. **Question Filters** - Arama/filtreleme
5. **Question Copy** - Kopyalama özelliği

### P2 (Orta - Sonraki Hafta)
6. **Drag & Drop** - Sıralama kolaylığı
7. **Bulk Actions** - Toplu işlemler

### P3 (Düşük - Gelecek)
8. Preview modal
9. Versiyon sistemi
10. Advanced search

---

## 💡 KULLANIM SENARYOLARı

### Senaryo 1: Hızlı Düzenleme
```
Admin → Question Bank detay
     → Soru listesinde "Düzenle" butonuna tıkla
     → Form açılır (dolu)
     → Soru metnini değiştir
     → Kaydet
     → ✅ Liste sayfasına dön, değişiklik görünür
```

### Senaryo 2: Soru Kopyalama
```
Admin → ISO 9001 havuzunda güzel bir soru var
     → "Kopyala" butonuna tıkla
     → Hedef havuz seç: ISO 45001
     → Onayla
     → ✅ Soru ISO 45001'e kopyalandı
```

### Senaryo 3: Toplu Silme
```
Admin → 20 soru var, 5'ini silmek istiyor
     → Multi-select modu aç
     → 5 soruyu seç (checkbox)
     → "Seçilenleri Sil" butonuna tıkla
     → Onay dialogu: "5 soru silinecek. Emin misiniz?"
     → Onayla
     → ✅ 5 soru silindi (soft delete)
```

### Senaryo 4: Drag & Drop Sıralama
```
Admin → Soru sırası karışmış
     → "Sıralamayı Düzenle" moduna geç
     → Soruları sürükle-bırak ile yeniden sırala
     → "Kaydet" butonuna tıkla
     → ✅ Yeni sıralama kaydedildi
```

---

## 🚀 HEMEN BAŞLAYALIM MI?

**Önerim: PHASE A (Temel Düzenleme) ile başlayalım**

Bu 2-3 saatte tamamlanır ve en kritik ihtiyacı karşılar:
- ✅ Soruları düzenleyebilme
- ✅ Soruları silebilme
- ✅ Kullanıcı dostu form

Sonra PHASE B (Filtreleme) ve PHASE C (Kopyalama) yapabiliriz.

**Başlayalım mı?**
