# Audit Sorular Ekranı Birleştirme Planı

## 🎯 MEVCUT DURUM

### 2 Ayrı Ekran:

**1. `/audits/[id]` - Sorular Tab'ı**
```
[Özet] [Sorular] [Bulgular] [Detaylar]
        ^^^^^^^^
        - Sadece READ-ONLY liste
        - Cevapları gösterir
        - "Tümünü Cevapla" butonu → başka sayfaya gider
```

**2. `/audits/[id]/questions` - Tümünü Cevapla Ekranı**
```
Ayrı sayfa:
- Progress bar
- Form ile cevaplama
- Sticky bottom bar
- Auto-save
```

### ❌ Sorun:
- Kullanıcı tab'dan çıkıp başka sayfaya gidiyor
- Gereksiz navigasyon
- Context kaybı

---

## 💡 ÇÖZÜM: BİRLEŞTİRME

### Yaklaşım 1: TAB İÇİNDE FORM (ÖNERİLEN) ⭐⭐⭐⭐⭐

**Konsept:** Sorular tab'ına direkt form entegre et

**Yeni Yapı:**
```
[Özet] [Sorular (5/10)] [Bulgular] [Detaylar]
        ^^^^^^^^^^^^^^^^
        
┌─ Progress Bar ─────────────────┐
│ [███████░░░] %70               │
└─────────────────────────────────┘

┌─ Sorular (Cevaplama Modu) ─────┐
│                                 │
│ ✓ 1. Soru buraya...            │
│    (Cevap göster - minimize)   │
│                                 │
│ ○ 2. Soru buraya...            │
│    [Form - Expand]             │
│    (•) Evet  ( ) Hayır         │
│    [ ] Uygunsuz                │
│    [Notlar...]                 │
│                                 │
│ ○ 3. Soru buraya...            │
└─────────────────────────────────┘

[Sticky Bottom Bar]
┌─────────────────────────────────┐
│ 💾 2 dk önce kaydedildi         │
│ [Taslak] [Tümünü Kaydet]       │
└─────────────────────────────────┘
```

**Avantajlar:**
- ✅ Tek ekran - hepsi bir arada
- ✅ Tab context korunur
- ✅ Navigasyon yok
- ✅ Full form functionality (auto-save, collapsible, etc.)

---

### Yaklaşım 2: İKİ MOD TOGGLE ⭐⭐⭐⭐

**Konsept:** Sorular tab'ında "Görüntüle" vs "Cevapla" modu

**Yapı:**
```
Sorular Tab:
┌─────────────────────────────────┐
│ [Görüntüle] [Cevapla] ← Toggle │
└─────────────────────────────────┘

Görüntüle Modu:
- Read-only liste
- Sadece cevapları göster

Cevapla Modu:
- Full form
- Collapsible
- Auto-save
```

**Avantajlar:**
- ✅ İki kullanım senaryosu
- ✅ Temiz görünüm (görüntüle)

**Dezavantajlar:**
- ❌ Ekstra toggle (karmaşık)

---

### Yaklaşım 3: DIREKT INLINE EDIT ⭐⭐⭐

**Konsept:** Liste itemlarına direkt edit butonu

**Yapı:**
```
Sorular Tab:

✓ 1. Soru text... [Düzenle]
   Cevap: Evet

○ 2. Soru text... [Cevapla]
   (Tıklayınca expand olur)
```

**Avantajlar:**
- ✅ Çok basit
- ✅ Item-by-item düzenleme

**Dezavantajlar:**
- ❌ Toplu cevaplama zor
- ❌ Auto-save karmaşık

---

## 🎨 DETAYLI İMPLEMENTASYON (Yaklaşım 1)

### Değişiklikler:

**1. `/audits/[id]/questions` sayfasını KALDIR**
```bash
# Bu dosyaları sil veya route kaldır:
- audits/[id]/questions/page.tsx
- audits/[id]/questions/audit-questions-form.tsx (component olarak koru)
- audits/[id]/questions/question-card.tsx (component olarak koru)
```

**2. Sorular Tab'ına Form Entegre Et**

```tsx
// audits/[id]/page.tsx

{/* TAB 2: Sorular (YENİ - Form dahil) */}
<TabsContent value="questions" className="space-y-4">
  {/* Progress Bar */}
  <Card>
    <CardContent className="pt-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">İlerleme</span>
          <span className="text-sm text-muted-foreground">
            {answeredCount} / {questions.length} cevaplandı
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
    </CardContent>
  </Card>

  {/* Form Component (Mevcut AuditQuestionsForm) */}
  <AuditQuestionsForm 
    auditId={params.id} 
    questions={questions} 
  />
</TabsContent>
```

**3. Component'leri Taşı**

```bash
# ÖNCE:
src/app/(main)/denetim/audits/[id]/questions/
  - audit-questions-form.tsx
  - question-card.tsx

# SONRA (component klasörüne):
src/components/audit/
  - audit-questions-form.tsx
  - question-card.tsx
```

**4. Navigasyon Butonlarını Kaldır**

```tsx
// Header'daki "Soruları Cevapla" butonunu kaldır veya değiştir
// ÖNCE:
<Button asChild>
  <Link href={`/audits/${id}/questions`}>
    Soruları Cevapla
  </Link>
</Button>

// SONRA: (Tab'a yönlendir)
<Button onClick={() => setActiveTab("questions")}>
  <HelpCircle className="h-4 w-4 mr-2" />
  Soruları Cevapla
</Button>
```

---

## 📋 ADIM ADIM UYGULAMA

### Step 1: Component'leri Taşı (5 dk)
```bash
# Yeni klasör oluştur
mkdir -p src/components/audit

# Dosyaları taşı
mv src/app/(main)/denetim/audits/[id]/questions/audit-questions-form.tsx src/components/audit/
mv src/app/(main)/denetim/audits/[id]/questions/question-card.tsx src/components/audit/
```

### Step 2: Import'ları Güncelle (5 dk)
```tsx
// audit-questions-form.tsx
// ÖNCE:
import { QuestionCard } from "./question-card";

// SONRA:
import { QuestionCard } from "./question-card";
// (aynı klasörde olduğu için değişmeyebilir)
```

### Step 3: Sorular Tab'ını Güncelle (15 dk)
```tsx
// audits/[id]/page.tsx

import { AuditQuestionsForm } from "@/components/audit/audit-questions-form";

// Tab content'i değiştir
<TabsContent value="questions" className="space-y-4">
  <Card>
    <CardContent className="pt-6">
      <Progress value={completionPercentage} />
    </CardContent>
  </Card>
  
  <AuditQuestionsForm 
    auditId={params.id} 
    questions={questions} 
  />
</TabsContent>
```

### Step 4: Eski Sayfayı Kaldır (2 dk)
```bash
# Route'u sil
rm -rf src/app/(main)/denetim/audits/[id]/questions/page.tsx
```

### Step 5: Navigasyon Butonlarını Düzelt (5 dk)
```tsx
// Header'da tab'a yönlendirme
// veya client-side tab state yönetimi
```

### Step 6: Test (5 dk)
- [ ] Tab açılıyor mu?
- [ ] Form çalışıyor mu?
- [ ] Auto-save çalışıyor mu?
- [ ] Sticky bottom bar çalışıyor mu?

**Toplam Süre:** ~35-40 dakika

---

## 🔄 OPTIONAL: CLIENT-SIDE TAB STATE

Tab'ları URL'den kontrol etmek için:

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function AuditTabs({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const setTab = (tab: string) => {
    router.push(`?tab=${tab}`);
  };

  return (
    <Tabs value={activeTab} onValueChange={setTab}>
      {children}
    </Tabs>
  );
}

// Kullanım:
// /audits/[id]?tab=questions
```

Bu sayede:
- URL'de tab durumu korunur
- Geri butonu çalışır
- Direkt link paylaşılabilir

---

## 📊 KARŞILAŞTIRMA

| Özellik | Önce (2 Sayfa) | Sonra (Tab İçinde) |
|---------|----------------|---------------------|
| **Ekran Sayısı** | 2 | 1 |
| **Navigasyon** | Tab → Sayfa → Geri | Tab → Tab |
| **Context** | Kaybolur | Korunur |
| **Auto-save** | ✅ | ✅ |
| **Collapsible** | ✅ | ✅ |
| **Sticky Bar** | ✅ | ✅ |
| **Progress** | ✅ | ✅ |
| **UX Karmaşıklığı** | Yüksek | Düşük |

---

## 🎯 ÖNERİM

**Yaklaşım 1 (Tab İçinde Form)** → En basit ve kullanıcı dostu

**Faydalar:**
- 1 ekran daha az
- Daha basit navigasyon
- Context korunur
- Tüm functionality aynı

**Süre:** ~40 dakika

---

## Uygulayayım mı?

**"devam"** → Yaklaşım 1'i uygula (önerilen)  
**"toggle"** → Yaklaşım 2 (Görüntüle/Cevapla toggle)  
**"inline"** → Yaklaşım 3 (Inline edit)
