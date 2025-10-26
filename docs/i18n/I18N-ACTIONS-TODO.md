# 🌍 ACTIONS MODÜLÜ i18N KALAN İŞLER

## 📋 KALAN DOSYALAR (4 dosya)

### 1. **actions/[id]/page.tsx** (Server Component)
**Hard-coded metinler:**
- "İlerleme", "Red Nedeni", "Tamamlama Notları"
- "Bağlı Bulgu", "Tarihler", "Detayları görüntüle"
- "Sorumlu", "Yönetici", "Oluşturan"
- Status labels: "Atandı", "Onay Bekliyor", "Tamamlandı", etc.

**Çözüm:**
```tsx
import { getTranslations } from 'next-intl/server';
const t = await getTranslations({ locale, namespace: 'action' });
const tCommon = await getTranslations({ locale, namespace: 'common' });
```

---

### 2. **components/actions/action-timeline.tsx** (Client Component)
**Hard-coded metinler:**
- "Aksiyon Oluşturuldu", "Sorumluya Atandı"
- "Reddedildi & Geri Atandı", "İptal Edildi"
- "tarafından", "Red Nedeni", "İptal Nedeni"

**Çözüm:**
```tsx
import { useTranslations } from 'next-intl';
const t = useTranslations('action');
```

---

### 3. **components/actions/action-detail-actions.tsx** (Client Component)
**Kontrol gerekli** - Button labels, dialog messages

---

### 4. **components/actions/action-progress-form.tsx** (Client Component)
**Kontrol gerekli** - Form labels, placeholders

---

## ✅ HAZIR OLAN

### **action.json** (94 satır - FULL)
```json
{
  "title": "Aksiyonlar",
  "fields": { ... },
  "status": {
    "assigned": "Atandı",
    "pendingApproval": "Onay Bekliyor",
    "completed": "Tamamlandı",
    "rejected": "Reddedildi",
    "cancelled": "İptal Edildi"
  },
  "sections": {
    "details": "Aksiyon Detayları",
    "progress": "İlerleme Notları",
    "timeline": "Zaman Çizelgesi",
    "relatedFinding": "Bağlı Bulgu",
    "dates": "Tarihler",
    "assignments": "Atamalar"
  },
  "messages": { ... }
}
```

---

## 🎯 UYGULAMA SIRASI

1. **action-timeline.tsx** (En görünür, timeline her yerde)
2. **actions/[id]/page.tsx** (Detail page)
3. **action-detail-actions.tsx** (Action buttons)
4. **action-progress-form.tsx** (Progress form)

---

## 📊 TAHMİNİ SÜRE

- **action-timeline.tsx:** 10 dk
- **actions/[id]/page.tsx:** 15 dk
- **Diğerleri:** 10 dk
- **TOPLAM:** ~35 dakika

---

## 🚀 SON DURUM

**Tamamlanan Modüller:**
- ✅ Audits (3 dosya)
- ✅ My-Tasks (1 dosya)
- ✅ Plans (4 dosya)
- ✅ Templates (5 dosya)
- ✅ Question-Banks (4 dosya)
- ⏳ **Actions** (0/4 dosya)

**TOPLAM:** 17/21 dosya (%81 tamamlandı)
