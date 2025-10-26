# 🧪 TEST REHBERİ - BAŞLANGIÇ

**Hoş geldin! Bu rehber sana uygulamayı baştan sona test etmen için hazırlandı.**

---

## 📚 DOSYALAR

Bu klasörde 4 test dokümanı var:

### 1. **E2E-TEST-SCENARIO.md** (ANA SENARYO)
- 📖 **Ne:** Detaylı, adım adım test senaryosu
- ⏱️ **Süre:** ~1 saat
- 🎯 **Hedef:** Tam süreç testi (Audit → Finding → DOF → Action)
- 📝 **Kullanım:** Her adımı oku ve uygula

### 2. **QUICK-TEST-CHECKLIST.md** (HIZLI TEST)
- ✅ **Ne:** Checkbox listesi
- ⏱️ **Süre:** ~30 dakika
- 🎯 **Hedef:** Temel fonksiyonları hızlıca test et
- 📝 **Kullanım:** İşaretle ve geç

### 3. **TEST-DATA-SAMPLE.md** (ÖRNEKveriler)
- 📋 **Ne:** Hazır test verileri
- ⏱️ **Süre:** Anında
- 🎯 **Hedef:** Copy-paste ile hızlı test
- 📝 **Kullanım:** Formları doldururken kopyala-yapıştır

### 4. **TEST-GUIDE-README.md** (BU DOSYA)
- 📌 **Ne:** Test rehberi özeti
- 📝 **Kullanım:** Buradan başla!

---

## 🚀 NEREDEN BAŞLAMALI?

### Senaryo 1: DETAYLI TEST (ÖNERİLEN)
```
1. E2E-TEST-SCENARIO.md'yi aç
2. TEST-DATA-SAMPLE.md'yi yan tarafta aç
3. Adım adım ilerle
4. Her adımda örnek verilerden kopyala-yapıştır
5. Tamamlanan adımları işaretle
6. Sorun bulursan "Hatalar" bölümüne not al
```

### Senaryo 2: HIZLI TEST
```
1. QUICK-TEST-CHECKLIST.md'yi aç
2. Her modülü sırayla test et
3. Checkbox'ları işaretle
4. Özet çıkar
```

---

## 🎯 TEST ADIMLARI ÖZET

### ADIM 1: Hazırlık (5 dk)
- [ ] Database çalışıyor mu kontrol et
- [ ] `pnpm dev` ile uygulamayı başlat
- [ ] Admin olarak giriş yap
- [ ] Test dosyalarını aç

### ADIM 2: Denetim Oluştur (10 dk)
- [ ] Yeni denetim oluştur
- [ ] Soruları cevapla
- [ ] 1 uygunsuzluk işaretle
- [ ] Denetimi tamamla

### ADIM 3: Bulgu Kontrol (5 dk)
- [ ] Otomatik bulgu oluştu mu?
- [ ] Bulgu detaylarını ekle
- [ ] Risk değerlendir

### ADIM 4: DÖF Süreci (30 dk)
- [ ] DÖF aç
- [ ] 7 adımı tamamla:
  - Step 1: 5N1K
  - Step 2: Geçici önlemler
  - Step 3: Kök neden (5 Why)
  - Step 4: Faaliyetler
  - Step 5: Uygulama
  - Step 6: Etkinlik
  - Step 7: Onay

### ADIM 5: Aksiyon Takip (10 dk)
- [ ] Aksiyon listesini kontrol et
- [ ] Aksiyonu tamamla
- [ ] Yönetici onayı al

### ADIM 6: Workflow Test (5 dk)
- [ ] Workflow oluştur
- [ ] Publish yap
- [ ] Archive yap
- [ ] Restore yap ✅

---

## 💡 İPUÇLARI

### Test Sırasında
1. **Ekran görüntüsü al** → Her önemli adımda
2. **Hataları not et** → Senaryo dosyasındaki "Hatalar" bölümüne
3. **Toast'ları kontrol et** → Her işlemde başarı mesajı gelmeli
4. **Status değişimlerini izle** → Draft → Active → Completed

### Sorun Bulursan
```
Bug formatı:
- Modül: [Audit/Finding/DOF/Action/Workflow]
- Sayfa: [URL]
- Adım: [Ne yaptın?]
- Beklenen: [Ne olmalıydı?]
- Gerçekleşen: [Ne oldu?]
- Ekran görüntüsü: [Link]
```

### Performans Kontrol
- ⚡ Sayfa yüklenme: < 2 saniye
- ⚡ Form submit: < 1 saniye
- ⚡ Toast notification: Anında
- ⚡ Refresh: < 1 saniye

---

## ✅ BAŞARI KRİTERLERİ

Test **BAŞARILI** sayılır eğer:

- [ ] Denetim baştan sona tamamlanabildi
- [ ] Bulgu otomatik oluştu
- [ ] DÖF 7 adım sorunsuz tamamlandı
- [ ] Kök neden doğru tespit edildi
- [ ] Aksiyonlar atandı ve tamamlandı
- [ ] Workflow'lar çalışıyor
- [ ] Toast notifications görünüyor
- [ ] Hiçbir kritik bug yok

---

## 📊 SONUÇ RAPORU

Test sonunda doldur:

```
TEST RAPORU
-----------
Tarih: _______________
Test Eden: _______________
Süre: _______________

SONUÇLAR:
- Audit Modülü: [ ] ✅ [ ] ❌
- Finding Modülü: [ ] ✅ [ ] ❌
- DOF Modülü: [ ] ✅ [ ] ❌
- Action Modülü: [ ] ✅ [ ] ❌
- Workflow Modülü: [ ] ✅ [ ] ❌

Toplam Test: ___ / 21
Başarı Oranı: ___%

KRİTİK HATALAR:
1. _______________
2. _______________

KÜÇÜK SORUNLAR:
1. _______________
2. _______________

ÖNERİLER:
1. _______________
2. _______________

GENEL NOTLAR:
________________
________________
________________
```

---

## 🎬 HEMEN BAŞLA!

### Seçeneğin:

**A) Detaylı Test İstiyorum (1 saat)**
→ `E2E-TEST-SCENARIO.md` dosyasını aç

**B) Hızlı Test İstiyorum (30 dk)**
→ `QUICK-TEST-CHECKLIST.md` dosyasını aç

**C) Sadece Örnek Verilere Bakacağım**
→ `TEST-DATA-SAMPLE.md` dosyasını aç

---

## 🆘 YARDIM

### Sorun mu yaşıyorsun?

1. **Database bağlantı hatası**
   → `.env.local` dosyasını kontrol et
   → PostgreSQL servisini başlat

2. **Seed data yok**
   → `pnpm seed:master` çalıştır

3. **Giriş yapamıyorum**
   → Admin kullanıcı: admin@example.com
   → Şifre: Seed scriptinde tanımlı

4. **Sayfa açılmıyor**
   → `pnpm dev` çalışıyor mu kontrol et
   → Terminal'de hata var mı bak

---

## 📞 İLETİŞİM

Sorun tespit edersen:
1. Ekran görüntüsü al
2. Hata mesajını kopyala
3. Adımları detaylandır
4. Rapor et

---

**🚀 İyi Testler!**

**Hedefimiz:** Sıfır hata, %100 başarı! 💪
