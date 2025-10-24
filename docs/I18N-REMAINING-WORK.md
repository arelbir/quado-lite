# 🌍 i18n Kalan İşler Listesi

## ✅ TAMAMLANAN
- ✅ Navigation menu (sidebar) - %100 i18n
- ✅ Finding detail page (`findings/[id]/page.tsx`) - %100 i18n
- ✅ Translation keys (TR + EN):
  - `audit.json` - common keys eklendi
  - `finding.json` - actions, dofs, common keys eklendi  
  - `dof.json` - dofId, capaProcess eklendi

## ⏳ KALAN HARD-CODED TÜRKÇE SAYFALAR

### 🔴 Yüksek Öncelik (Sık kullanılan sayfalar)

#### 1. `audits/[id]/page.tsx`
**Sorunlar:**
- "Bulgular ({count})" - Tab başlığı
- "Toplam Bulgu" - Stats card
- "Son Bulgular" - Card başlığı
- "Henüz bulgu bulunmuyor" - Empty state

**Çözüm:**
```tsx
const t = await getTranslations('audit');
// "Bulgular" → t('common.lastFindings')
// "Toplam Bulgu" → t('common.totalFindings')  
```

#### 2. `closures/page.tsx`
**Sorunlar:**
- "Onay Bekleyen Bulgular" - Card başlığı
- "{count} bulgu denetçi onayı bekliyor" - Description

**Çözüm:**
```tsx
const t = await getTranslations('finding');
// "Onay Bekleyen Bulgular" → t('sections.closureTitle')
// "{count} bulgu..." → t('common.pendingApproval', { count })
```

#### 3. `dofs/[id]/page.tsx`
**Sorunlar:**
- "DÖF #{id}" - Başlık formatı
- "7 Adımlı CAPA Süreci" - Subtitle

**Çözüm:**
```tsx
const t = await getTranslations('dof');
// "DÖF #" → t('dofId')
// "7 Adımlı CAPA Süreci" → t('capaProcess')
```

### 🟡 Orta Öncelik (Template/QuestionBank sayfaları)

#### 4. `templates/[id]/page.tsx`
**Sorunlar:**
- "Toplam Soru" - Stats card

**Çözüm:**
```tsx
const t = await getTranslations('audit');
// "Toplam Soru" → t('common.totalQuestions')
```

#### 5. `question-banks/[id]/page.tsx`  
**Sorunlar:**
- "Toplam Soru" - Stats card

**Çözüm:**
```tsx
const t = await getTranslations('audit');
// "Toplam Soru" → t('common.totalQuestions')
```

#### 6. `my-audits/page.tsx`
**Sorunlar:**
- "Toplam" - Stats başlığı

**Çözüm:**
```tsx
const t = await getTranslations('common');
// "Toplam" → t('total')
```

## 📋 ÖNÜMÜZDE

### Hızlı Düzeltme Stratejisi:
1. Her dosyaya `getTranslations` import et
2. Hard-coded metinleri yukarıdaki çözümlerle değiştir
3. Toplu sed ile mi yoksa tek tek mi yapalım?

### Tahmini Süre:
- **Manuel (dosya dosya)**: ~30dk
- **Toplu script ile**: ~5dk

## 🎯 SONRAKİ ADIMLAR

Hangi yaklaşımı tercih ediyorsun?

**A) Tek tek dosya düzelt** - Kontrollü, güvenli
**B) Toplu script** - Hızlı ama riskli  
**C) Sadece critical dosyalar** - audits/[id], closures, dofs/[id]

---

**Durum:** Findings detail sayfası ✅ örnek olarak tamamlandı
**Kalan:** 6 dosya, ~25 hard-coded string
