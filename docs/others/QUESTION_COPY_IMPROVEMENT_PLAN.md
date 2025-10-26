# Soru Kopyalama İyileştirmesi - Planlama

## 🎯 Hedef
Mevcut soru bankasını da hedef olarak göster → Soru türetme/klonlama kolaylığı

---

## 📋 MEVCUT DURUM

### CopyQuestionDialog (src/components/questions/copy-question-dialog.tsx)

```typescript
// ŞU AN:
useEffect(() => {
  if (open) {
    getActiveQuestionBanks().then((data) => {
      // Mevcut havuzu filtrele - GÖSTERİLMİYOR
      setBanks(data.filter((b) => b.id !== currentBankId));
    });
  }
}, [open, currentBankId]);

// Sonuç: Sadece DİĞER havuzlar görünür
```

**Sorun:**
- Aynı havuzda soru türetemiyorum
- Benzeri soru oluşturmak için kopyala → düzenle yapamıyorum

---

## 🎨 YENİ TASARIM

### Hedef Havuz Listesi:

```
┌─ Hedef Soru Havuzu ─────────────────┐
│ ┌──────────────────────────────┐    │
│ │ ISO 9001 Kalite Yönetimi     │    │ ← Mevcut havuz
│ │ (Kalite) [Mevcut Havuz]      │    │   (Badge ile işaretli)
│ ├──────────────────────────────┤    │
│ │ ISO 45001 İSG                │    │
│ │ (İSG)                        │    │
│ ├──────────────────────────────┤    │
│ │ ISO 14001 Çevre              │    │
│ │ (Çevre)                      │    │
│ └──────────────────────────────┘    │
└──────────────────────────────────────┘

[İptal] [Kopyala]
```

---

## 💡 KULLANIM SENARYOLARı

### Senaryo 1: Soru Türetme (Aynı Havuz)
```
Durum: "Dokümantasyon güncel mi?" sorusu var
İhtiyaç: "Dokümantasyon periyodik kontrol ediliyor mu?" sorusu lazım

Akış:
1. Mevcut soruya hover → "Kopyala"
2. Hedef: ISO 9001 (mevcut havuz) seç
3. Kopyala → Soru havuzda türetildi
4. Düzenle → Metni değiştir
5. Kaydet

Sonuç: Aynı havuzda 2 benzer soru var ✅
```

### Senaryo 2: Başka Havuza Kopyalama (Eski davranış)
```
Durum: ISO 9001'de güzel bir soru var
İhtiyaç: ISO 45001'de de benzer soru gerekli

Akış:
1. Soruya hover → "Kopyala"
2. Hedef: ISO 45001 seç
3. Kopyala → Başka havuza kopyalandı
4. İsteğe bağlı düzenle

Sonuç: İki farklı havuzda aynı/benzer soru ✅
```

---

## 🔧 TEKNIK DEĞİŞİKLİKLER

### 1. Mevcut Havuzu Filtreleme Kaldır

**Dosya:** `src/components/questions/copy-question-dialog.tsx`

```typescript
// ÖNCE:
setBanks(data.filter((b) => b.id !== currentBankId));

// SONRA:
setBanks(data);
// Artık mevcut havuz da listede
```

### 2. Mevcut Havuza Badge Ekle

```typescript
<SelectContent>
  {banks.map((bank) => (
    <SelectItem key={bank.id} value={bank.id}>
      <div className="flex items-center gap-2">
        <span>{bank.name} ({bank.category})</span>
        {bank.id === currentBankId && (
          <Badge variant="secondary" className="text-xs">
            Mevcut Havuz
          </Badge>
        )}
      </div>
    </SelectItem>
  ))}
</SelectContent>
```

### 3. Success Message Güncelle

```typescript
if (result.success) {
  if (targetBankId === currentBankId) {
    toast.success("Soru başarıyla türetildi!");
  } else {
    toast.success("Soru başarıyla kopyalandı!");
  }
  // ...
}
```

---

## 📝 İYİLEŞTİRME PLANI

### Step 1: Filtreyi Kaldır (1 dk)
- [x] `filter((b) => b.id !== currentBankId)` satırını kaldır
- [x] Tüm havuzları göster

### Step 2: Badge Ekle (2 dk)
- [x] SelectItem'a conditional badge ekle
- [x] "Mevcut Havuz" etiketi

### Step 3: UX İyileştirmesi (1 dk)
- [x] Toast message'ı contextual yap
- [x] Türetme vs Kopyalama mesajları

**Toplam Süre:** ~4 dakika

---

## 🎯 SONUÇ

### Öncesi:
```
[ISO 9001'den kopyala]
  ↓
[Hedef seç]
  - ISO 45001 ✅
  - ISO 14001 ✅
  - ISO 9001 ❌ (görünmüyor)
```

### Sonrası:
```
[ISO 9001'den kopyala]
  ↓
[Hedef seç]
  - ISO 9001 [Mevcut Havuz] ✅ ← TÜRET!
  - ISO 45001 ✅
  - ISO 14001 ✅
```

---

## 💡 EK İYİLEŞTİRMELER (Opsiyonel)

### A) Kopyalanan Soruya "(Kopya)" Eki
```typescript
// Backend'de:
const [newQuestion] = await db
  .insert(questions)
  .values({
    // ...
    questionText: targetBankId === originalQuestion.bankId 
      ? `${originalQuestion.questionText} (Kopya)`
      : originalQuestion.questionText,
    orderIndex: "999", // En sona ekle
  })
```

**Avantaj:** Kullanıcı hangi sorunun türetilmiş olduğunu anlar

### B) "Soru Türet" Butonu (Ayrı Button)
```tsx
// question-list-item.tsx'de
<Button variant="ghost" size="sm">
  <Edit />
</Button>
<CopyQuestionDialog /> // Başka havuza
<Button variant="ghost" size="sm" onClick={duplicateInSameBank}>
  <Copy /> Türet
</Button>
```

**Avantaj:** Daha açık UX, iki farklı action

---

## 🚀 ÖNERİM

**Minimalist Yaklaşım:** Step 1-3 (4 dakika)
- Filtreyi kaldır
- Badge ekle
- Message'ı güncelle

**Daha Gelişmiş:** + "(Kopya)" eki
- Türetilmiş soruların takibi kolay

**En İleri:** Ayrı "Türet" butonu
- UX daha açık ama fazladan buton

---

## Hangi yaklaşımı tercih edersin?

**A)** Minimalist (4 dk)  
**B)** + Kopya eki (6 dk)  
**C)** + Ayrı türet butonu (10 dk)  
**"devam"** → Ben minimalist ile başlayayım
