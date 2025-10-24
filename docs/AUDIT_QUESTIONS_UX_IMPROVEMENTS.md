# Audit Questions UX İyileştirme Planı

## 🎯 Mevcut Sorunlar

1. **Her soruyu tek tek kaydetmek zorunda** ❌
   - Her soru için "Kaydet" butonuna tıklamak gerekiyor
   - 20 soruluk bir denetimde 20 kez kaydet tıklanıyor

2. **Mobile UX Kötü** ❌
   - Her soru büyük card
   - Çok fazla scroll gerekiyor
   - Sorular arası geçiş zor

3. **Progress Tracking Eksik** ❌
   - Hangi soruda olduğunuz belli değil
   - Cevaplamadığınız soruları bulmak zor

---

## 💡 ÖNERİLEN İYİLEŞTİRMELER

### Yaklaşım 1: TOPLU KAYDETME (EN İYİ) ⭐⭐⭐⭐⭐

**Özellikler:**
- Tüm soruları tek formda göster
- Cevaplar local state'de tutulsun
- Tek "Tümünü Kaydet" butonu (sticky bottom bar)
- Auto-save (opsiyonel, her 30 saniyede bir)

**Avantajlar:**
- ✅ Tek tıkla tüm cevapları kaydet
- ✅ Form doldurma hissi (Google Forms gibi)
- ✅ Hızlı akış
- ✅ Mobile friendly

**Örnek UI:**
```
┌─────────────────────────────────┐
│ [← Geri]  ISO 9001 Denetimi    │
│ Progress: 7/10 cevaplandı       │
│ [███████░░░] %70                │
└─────────────────────────────────┘

┌─ Kalite Yönetimi (5 soru) ─────┐
│                                  │
│ 1. Kalite politikası güncel mi? │
│ (•) Evet  ( ) Hayır             │
│ [ ] Uygunsuz işaretle           │
│ [Notlar...]                     │
│ ───────────────────────────────  │
│ 2. Dokümantasyon tam mı?        │
│ (•) Evet  ( ) Hayır             │
│ ...                              │
└──────────────────────────────────┘

[Sticky Bottom Bar]
┌──────────────────────────────────┐
│ 💾 Otomatik kaydedildi (2 dk önce)│
│ [İptal] [Taslak Kaydet] [Kaydet]│
└──────────────────────────────────┘
```

---

### Yaklaşım 2: STEPPER/WIZARD ⭐⭐⭐⭐

**Özellikler:**
- Tek seferde 1 soru göster
- İleri/Geri butonları
- Progress indicator
- Keyboard navigation (Enter = next)

**Avantajlar:**
- ✅ Focus tek soru
- ✅ Mobile mükemmel
- ✅ Wizard flow
- ✅ Keyboard friendly

**Örnek UI:**
```
┌─────────────────────────────────┐
│ Soru 7 / 10                     │
│ [████████░░] %70                │
└─────────────────────────────────┘

┌─ Kalite Politikası ────────────┐
│                                  │
│ Kalite politikası güncel mi?    │
│ 💡 ISO 9001 Madde 5.2           │
│                                  │
│ (•) Evet  ( ) Hayır             │
│                                  │
│ [ ] Uygunsuz işaretle           │
│                                  │
│ Notlar (opsiyonel):             │
│ [________________________]      │
│                                  │
│ [← Önceki] [Sonraki →]         │
│            [Kaydet & Devam]     │
└──────────────────────────────────┘
```

---

### Yaklaşım 3: ACCORDION + AUTO-SAVE ⭐⭐⭐

**Özellikler:**
- Sorular accordion'da (collapse/expand)
- Her cevap değiştiğinde auto-save
- Cevaplanan sorular otomatik collapse
- Cevaplananlar yeşil tick

**Avantajlar:**
- ✅ Hiç kaydet butonu yok
- ✅ Compact görünüm
- ✅ Cevaplananlar minimize

**Örnek UI:**
```
┌─ Kalite Yönetimi ──────────────┐
│                                  │
│ ✅ 1. Kalite politikası... [▼]  │
│                                  │
│ ⭕ 2. Dokümantasyon tam mı? [▶] │
│    (•) Evet  ( ) Hayır          │
│    [ ] Uygunsuz                 │
│    [Notlar...]                  │
│    💾 Otomatik kaydediliyor...  │
│                                  │
│ ⭕ 3. Süreçler tanımlı mı? [▶]  │
└──────────────────────────────────┘
```

---

## 📱 MOBILE İYİLEŞTİRMELERİ

### 1. Compact View
```css
/* Desktop */
.question-card {
  padding: 1.5rem;
  gap: 1rem;
}

/* Mobile */
@media (max-width: 768px) {
  .question-card {
    padding: 0.75rem;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
}
```

### 2. Bottom Sheet (Mobile)
- Soru detayları bottom sheet'te aç
- Full screen modal
- Swipe to next question

### 3. FAB (Floating Action Button)
```
[Sticky FAB - Mobile Only]
┌─────────────────┐
│                 │
│    [💾 Kaydet] │ ← Sağ altta sabit
│                 │
└─────────────────┘
```

---

## 🎨 DETAYLI İMPLEMENTASYON (Yaklaşım 1)

### Component Yapısı:

```tsx
// audit-questions-form.tsx (YENİ)
"use client";

interface FormState {
  [questionId: string]: {
    answer: string;
    notes: string;
    isNonCompliant: boolean;
  };
}

export function AuditQuestionsForm({ questions, auditId }) {
  const [formState, setFormState] = useState<FormState>({});
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date>();

  // Auto-save her 30 saniyede
  useEffect(() => {
    const timer = setInterval(() => {
      if (hasUnsavedChanges()) {
        handleAutoSave();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [formState]);

  const handleSubmit = () => {
    startTransition(async () => {
      // Tüm cevapları toplu kaydet
      await saveAllAnswers(formState);
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <ProgressCard {...} />

      {/* Questions */}
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          value={formState[q.id]}
          onChange={(value) => updateQuestion(q.id, value)}
        />
      ))}

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {lastSaved && `💾 ${formatDistanceToNow(lastSaved)} önce kaydedildi`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Taslak Kaydet</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Tümünü Kaydet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Özellikler:

1. **Toplu Kaydetme**
   - Tek butona tıkla
   - Tüm cevaplar batch olarak kaydet
   - Loading state

2. **Auto-Save** (Opsiyonel)
   - 30 saniyede bir otomatik kayıt
   - "Son kaydedilme" göstergesi
   - Kaydedilmemiş değişiklik uyarısı

3. **Progress Tracking**
   - Kaç soru cevaplandı
   - Percentage bar
   - Uygunsuzluk sayısı

4. **Validation**
   - Zorunlu sorular kontrolü
   - Kaydet'e bastığında eksik soruları highlight

5. **Keyboard Navigation**
   - Tab: Sonraki input
   - Ctrl+Enter: Kaydet

---

## 🚀 HIZLI KAZANIMLAR (Quick Wins)

Bu değişiklikleri hemen yapabilirsiniz:

### 1. Sticky "Tümünü Kaydet" Butonu (30 dk)
```tsx
// Mevcut page.tsx'e ekle
<div className="sticky bottom-4 z-50 flex justify-end px-6">
  <Button size="lg" className="shadow-lg">
    💾 Tümünü Kaydet ({answeredCount}/{totalCount})
  </Button>
</div>
```

### 2. Cevaplanan Soruları Minimize Et (15 dk)
```tsx
{auditQuestion.answeredAt && (
  <Collapsible defaultOpen={false}>
    {/* Question content */}
  </Collapsible>
)}
```

### 3. Keyboard Shortcuts (10 dk)
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSaveAll();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

### 4. Mobile: Compact Padding (5 dk)
```tsx
<div className="p-4 md:p-6 rounded-lg border">
  {/* Question */}
</div>
```

---

## 📊 KARŞILAŞTIRMA

| Özellik | Mevcut | Yaklaşım 1 | Yaklaşım 2 | Yaklaşım 3 |
|---------|--------|------------|------------|------------|
| Kaydetme | Her soru | 1 kez | Her soru | Auto |
| Mobile UX | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Hız | Yavaş | Hızlı | Orta | Hızlı |
| Focus | Düşük | Orta | Yüksek | Orta |
| Implement | - | 2 saat | 3 saat | 3 saat |

---

## 🎯 TAVSİYEM

**Yaklaşım 1 (Toplu Kaydetme) + Bazı Özellikler:**

1. ✅ Tüm soruları tek formda göster
2. ✅ Sticky "Tümünü Kaydet" butonu
3. ✅ Auto-save (her 30 saniye)
4. ✅ Progress bar üstte
5. ✅ Cevaplanan sorular minimize
6. ✅ Keyboard shortcuts
7. ✅ Mobile: Compact view

**Süre:** ~2-3 saat implementasyon

**Sonuç:**
- 20 soruluk denetim: 20 tıklamadan → 1 tıklama
- Mobile'da %50 daha az scroll
- Auto-save ile veri kaybı yok

---

## Hangi yaklaşımı tercih edersin?

**"1"** → Toplu Kaydetme (Hızlı, kolay)
**"2"** → Stepper/Wizard (Mobile-first, focus)
**"3"** → Accordion + Auto-save (Hands-free)
**"1+3"** → Hybrid (En iyi UX ama daha uzun)
