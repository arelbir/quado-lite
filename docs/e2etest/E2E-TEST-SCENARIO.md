# 🧪 END-TO-END TEST SENARYOSU

**Tarih:** 2025-01-26  
**Test Hedefi:** Denetim → Bulgu → DÖF → Aksiyon (Baştan Sona Tam Süreç)  
**Test Durumu:** ⏳ Bekliyor

---

## 📋 **TEST KAPSAMI**

Bu senaryo aşağıdaki modüllerin entegre çalışmasını test eder:
1. ✅ Audit (Denetim) - ISO 9001 İç Denetimi
2. ✅ Finding (Bulgu) - Uygunsuzluk kaydı
3. ✅ DOF (CAPA) - 8 adımlı kök neden analizi
4. ✅ Action (Aksiyon) - Düzeltici faaliyet
5. ✅ Workflow - Onay süreçleri

---

## 🎯 **TEST SENARYOSU: ISO 9001 İÇ DENETİMİ**

### **Senaryo Özeti:**
Kalite Yönetim Sisteminin iç denetimi sırasında "Doküman Kontrol" sürecinde bir uygunsuzluk tespit edildi. Kök neden analizi yapılarak düzeltici ve önleyici faaliyetler belirlendi.

---

## 📝 **ADIM 1: DENETİM OLUŞTURMA**

### **1.1 Denetim Planlama**
```
Sayfa: /denetim/audits/new
Süre: 3 dakika
```

**Denetim Bilgileri:**
- **Denetim Başlığı:** ISO 9001 İç Denetimi - 2025 Q1
- **Denetim Tipi:** İç Denetim
- **Risk Seviyesi:** Orta
- **Denetim Şablonu:** ISO 9001:2015 İç Denetim Şablonu
- **Departman:** Kalite Yönetimi
- **Denetçi:** Ayşe Yılmaz (QUALITY_MANAGER)
- **Planlanan Tarih:** 26 Ocak 2025
- **Açıklama:** Q1 dönem iç denetimi - Doküman kontrol ve eğitim kayıtları

### **1.2 Denetim Soruları Cevaplama**
```
Sayfa: /denetim/audits/[id]
Süre: 10 dakika
```

**Örnek Sorular ve Cevaplar:**

**Soru 1:** Doküman kontrol prosedürü güncel mi?
- ✅ Evet (Uygun)
- Kanıt: DK-PRO-001 Rev.3 (01.01.2025)

**Soru 2:** Revize dokümanlar yetkili onayından geçiyor mu?
- ❌ Hayır (Uygunsuzluk!)
- Bulgu: 3 adet doküman onaysız revize edilmiş
- Açıklama: Rev.4, Rev.5, Rev.6 onay kayıtları eksik

**Soru 3:** Eski doküman versiyonları arşivleniyor mu?
- ⚠️ Kısmen (Gözlem)
- Açıklama: Manuel arşivleme yapılıyor, sistem eksik

**Skor Girişi:**
- Toplam Soru: 15
- Uygun: 12 (80 puan)
- Uygunsuzluk: 2 (10 puan)
- Gözlem: 1 (5 puan)
- **Toplam Skor:** 63/100

### **1.3 Denetim Tamamlama**
```
Action: "Denetimi Tamamla" butonu
Toast: "Denetim tamamlandı ve bulgular oluşturuldu"
```

---

## 🔍 **ADIM 2: BULGU OLUŞTURMA**

### **2.1 Otomatik Bulgu Oluşumu**
```
Sayfa: /denetim/findings
Süre: 1 dakika
```

Sistem otomatik olarak uygunsuzluk için bulgu oluşturur:

**Bulgu Detayları:**
- **Bulgu No:** BLG-2025-001
- **Başlık:** Doküman Onay Sürecinde Uygunsuzluk
- **Kategori:** Majör Uygunsuzluk
- **Risk Tipi:** Orta
- **Departman:** Kalite Yönetimi
- **Açıklama:** 3 adet doküman yetkili onayı olmadan revize edilmiş
- **Kanıt:** DK-TL-001 Rev.4, DK-TL-002 Rev.5, DK-FR-003 Rev.6
- **İlgili Madde:** ISO 9001:2015 - Madde 7.5.3 (Dokümante Edilmiş Bilginin Kontrolü)

### **2.2 Bulguya Detay Ekleme**
```
Sayfa: /denetim/findings/[id]
Action: Bulgu detaylarını zenginleştir
```

**Ek Bilgiler:**
- **Tespit Tarihi:** 26.01.2025
- **Tespit Eden:** Ayşe Yılmaz (Denetçi)
- **Sorumlu Birim:** Doküman Kontrol Ekibi
- **Etkilenen Süreç:** Doküman Yönetimi
- **Potansiyel Etki:** Onaysız dokümanlarla çalışma riski

---

## 📊 **ADIM 3: DÖF (CAPA) AÇMA - 8 ADIMLI SÜREÇ**

### **3.1 DÖF Başlatma**
```
Sayfa: /denetim/findings/[id]
Action: "DÖF Aç" butonu
Toast: "DÖF oluşturuldu"
Yönlendirme: /denetim/dofs/[id]
```

**DÖF Başlangıç Bilgileri:**
- **DÖF No:** DOF-2025-001
- **Bulgu:** BLG-2025-001
- **Durum:** Step 1 - Problem Tanımı
- **Sorumlu:** Mehmet Demir (PROCESS_OWNER)

---

### **STEP 1: PROBLEM TANIMI (5N1K)**
```
Süre: 5 dakika
Sayfa: /denetim/dofs/[id]
```

**5N1K Analizi:**

**Ne (What)?**
```
Doküman revizyon sürecinde yetkili onay adımı atlanmış, 
3 adet doküman onaysız güncellenmiş.
```

**Nerede (Where)?**
```
Kalite Yönetimi Departmanı
Doküman Kontrol Sistemi (SharePoint)
```

**Ne Zaman (When)?**
```
Aralık 2024 - Ocak 2025 arası
Son 2 ay içinde tespit edildi
```

**Kim (Who)?**
```
Doküman Kontrol Koordinatörü (Zeynep Kaya)
İlgili doküman sahipleri (3 kişi)
```

**Nasıl (How)?**
```
Manuel süreç takibinde aksama
Otomatik onay workflow'u kullanılmıyor
E-posta ile onay alınmış ancak sistemde kayıt yok
```

**Niçin (Why)?**
```
Doküman yönetim sistemi manuel
Onay workflow'u tanımlı değil
Prosedür güncel ama uygulanmıyor
```

**Action:** "Kaydet ve Sonraki Adım"

---

### **STEP 2: GEÇİCİ ÖNLEMLER**
```
Süre: 3 dakika
```

**Geçici Önlem 1:**
```
Başlık: Revize Dokümanların Acil Onayı
Açıklama: 3 adet onaysız doküman acilen Kalite Müdürü tarafından onaylanacak
Sorumlu: Kalite Müdürü
Termin: 27.01.2025 (1 gün)
Durum: Atandı
```

**Geçici Önlem 2:**
```
Başlık: Doküman Revizyon Durdurma
Açıklama: Süreç düzelene kadar yeni doküman revizyonları durduruldu
Sorumlu: Doküman Kontrol Koordinatörü
Termin: Kalıcı çözüm bulunana kadar
Durum: Aktif
```

**Action:** "Kaydet ve Sonraki Adım"

---

### **STEP 3: KÖK NEDEN ANALİZİ**
```
Süre: 15 dakika
Method: 5 Why (5 Neden)
```

**5 Why Analizi:**

**1. Neden dokümanlar onaysız revize edildi?**
```
→ Çünkü sistem otomatik onay kontrolü yapmıyor
```

**2. Neden sistem otomatik onay kontrolü yapmıyor?**
```
→ Çünkü SharePoint'te onay workflow'u kurulmamış
```

**3. Neden workflow kurulmamış?**
```
→ Çünkü IT Departmanından talep edilmemiş
```

**4. Neden talep edilmemiş?**
```
→ Çünkü prosedürde manuel onay yeterli görülmüş
```

**5. Neden manuel onay yeterli görülmüş?**
```
→ Çünkü risk değerlendirmesi yapılmamış, 
manuel sürecin hatalı olabileceği öngörülmemiş
```

**🎯 KÖK NEDEN:**
```
Doküman yönetimi risk değerlendirmesi yapılmadan manuel olarak 
kurgulanmış. Sistemsel kontroller eklenmemiş.
```

**Action:** "Kök Nedeni Kaydet ve Devam"

---

### **STEP 4: FAALİYETLER BELİRLEME**
```
Süre: 10 dakika
```

**Düzeltici Faaliyet 1:**
```
Tip: Düzeltici
Başlık: SharePoint Onay Workflow Kurulumu
Açıklama: SharePoint'te otomatik doküman onay workflow'u kurulacak
Sorumlu: IT Departmanı (Ahmet Yıldız)
Destek: Kalite Yönetimi
Termin: 15.02.2025 (20 gün)
Bütçe: 15,000 TL
```

**Düzeltici Faaliyet 2:**
```
Tip: Düzeltici
Başlık: Doküman Kontrol Prosedürü Güncelleme
Açıklama: Prosedürde sistemsel kontroller mandatory yapılacak
Sorumlu: Kalite Müdürü
Termin: 05.02.2025 (10 gün)
```

**Önleyici Faaliyet 1:**
```
Tip: Önleyici
Başlık: Tüm Süreçlerde Risk Değerlendirmesi
Açıklama: Kalite süreçlerinin tamamında kontrol noktaları belirlenmesi
Sorumlu: Kalite Ekibi
Termin: 29.02.2025 (1 ay)
```

**Önleyici Faaliyet 2:**
```
Tip: Önleyici
Başlık: Doküman Yönetimi Eğitimi
Açıklama: İlgili personele workflow kullanımı eğitimi
Sorumlu: HR + Kalite
Termin: 20.02.2025 (25 gün)
Katılımcı: 12 kişi
```

**Action:** "Faaliyetleri Kaydet ve Devam"

---

### **STEP 5: UYGULAMA**
```
Süre: Faaliyetlere göre değişken (20 gün)
Tracking: /denetim/dofs/[id] - Step 5
```

**Faaliyet İzleme:**

| Faaliyet | Durum | İlerleme | Not |
|----------|-------|----------|-----|
| Workflow Kurulumu | Devam Ediyor | 60% | IT ekibi çalışıyor |
| Prosedür Güncelleme | Tamamlandı | 100% | Rev.4 yayınlandı |
| Risk Değerlendirme | Başladı | 30% | Template hazırlandı |
| Eğitim Planı | Planlandı | 20% | Tarih: 18.02.2025 |

**Progress Updates:**
```
10.02.2025: Workflow test ortamında hazır
12.02.2025: Prosedür onaylandı ve yayınlandı
15.02.2025: Workflow prod'a alındı, testler başarılı
18.02.2025: Eğitimler tamamlandı
```

**Action:** "Tüm Faaliyetler Tamamlandı → İleri"

---

### **STEP 6: ETKİNLİK KONTROLÜ**
```
Süre: 5 dakika
Kontrol Tarihi: 25.02.2025 (1 ay sonra)
```

**Kontrol Soruları:**

**1. Workflow çalışıyor mu?**
```
✅ Evet
Kanıt: Son 10 gün 8 doküman onaydan geçti, hepsi kayıtlı
Test: 3 test dokümanı denendi, sistem çalışıyor
```

**2. Onaysız doküman revizyonu yapılabildi mi?**
```
✅ Hayır
Kanıt: Sistem onaysız revizyonu engelliyor
Hata mesajı: "Yönetici onayı gereklidir"
```

**3. Eğitimler etkili mi?**
```
✅ Evet
Katılım: 12/12 kişi
Test Sonuçları: Ortalama %92 başarı
Feedback: Olumlu
```

**4. Benzer sorun tekrar etti mi?**
```
✅ Hayır
Son 1 ayda hiç uygunsuzluk kaydedilmedi
Tüm dokümanlar prosedüre uygun
```

**Etkinlik Skoru:** 98/100 ✅

**Sonuç:**
```
Düzeltici ve önleyici faaliyetler ETKİLİ bulunmuştur.
Kök neden giderilmiş, sistemsel kontrol sağlanmıştır.
```

**Action:** "Etkinlik Onaylandı → Yönetici Onayına Gönder"

---

### **STEP 7: YÖNETİCİ ONAYI**
```
Süre: 2 dakika
Onaylayan: Kalite Müdürü (QUALITY_MANAGER)
```

**Onay Detayları:**
```
Karar: ✅ ONAYLA
Yorum: "Çalışmalar başarıyla tamamlanmış. 
        Sistem entegrasyonu çok iyi olmuş.
        DOF kapatılabilir."
Onay Tarihi: 25.02.2025
```

**Action:** "DÖF'ü Onayla ve Kapat"

**Toast:** ✅ "DÖF başarıyla tamamlandı ve kapatıldı!"

**Final Status:** CLOSED ✅

---

## ⚡ **ADIM 4: AKSİYON TAKIBI (Paralel)**

### **4.1 Aksiyon Oluşturma**
```
Kaynak: DOF Faaliyetlerinden otomatik
Sayfa: /denetim/actions
```

**Aksiyon 1: Workflow Kurulumu**
```
ID: ACT-2025-001
Başlık: SharePoint Onay Workflow Kurulumu
Tip: Düzeltici
Öncelik: Yüksek
Atanan: Ahmet Yıldız (IT)
Termin: 15.02.2025
DOF: DOF-2025-001
Durum: Assigned → Tamamlandı
```

**CAPA Workflow:**
```
1. Atandı (Assigned)
2. Ahmet çalıştı → "Tamamladım" butonu
3. Durum: PendingManagerApproval
4. Kalite Müdürü → "Onayla"
5. Durum: Completed ✅
```

**Aksiyon 2: Eğitim**
```
ID: ACT-2025-002
Başlık: Doküman Yönetimi Eğitimi
Atanan: HR Uzmanı
Durum: Completed ✅
Notlar: 12 kişi katıldı, %92 başarı oranı
```

---

## 📊 **SONUÇ VE RAPORLAMA**

### **Özet İstatistikler:**

| Metrik | Değer |
|--------|-------|
| Denetim Süresi | 1 gün |
| Bulgu Sayısı | 1 Majör |
| DÖF Sayısı | 1 |
| Aksiyon Sayısı | 4 |
| Toplam Süre | 30 gün |
| Başarı Oranı | %98 |
| Durum | ✅ Kapatıldı |

### **Timeline:**

```
26.01.2025 → Denetim Tamamlandı
26.01.2025 → Bulgu Oluşturuldu
26.01.2025 → DÖF Açıldı
27.01.2025 → Geçici Önlemler Alındı
29.01.2025 → Kök Neden Bulundu
30.01.2025 → Faaliyetler Belirlendi
01.02-20.02 → Uygulama Aşaması
25.02.2025 → Etkinlik Kontrolü
25.02.2025 → Yönetici Onayı
25.02.2025 → ✅ KAPANDI
```

---

## ✅ **TEST KONTROL LİSTESİ**

### **Modül Testleri:**

- [ ] **Audit Modülü**
  - [ ] Denetim oluşturma
  - [ ] Soru cevaplama
  - [ ] Skor hesaplama
  - [ ] Denetim tamamlama

- [ ] **Finding Modülü**
  - [ ] Otomatik bulgu oluşumu
  - [ ] Bulgu detay ekleme
  - [ ] Risk değerlendirme
  - [ ] Bulguyu kapatma

- [ ] **DOF Modülü (CAPA)**
  - [ ] 8 adımlı süreç
  - [ ] 5N1K analizi
  - [ ] 5 Why kök neden
  - [ ] Faaliyet yönetimi
  - [ ] Etkinlik kontrolü
  - [ ] Yönetici onayı

- [ ] **Action Modülü**
  - [ ] Aksiyon oluşturma
  - [ ] Atama yapma
  - [ ] Tamamlama
  - [ ] Onay süreci
  - [ ] Reject loop

### **Entegrasyon Testleri:**

- [ ] Audit → Finding entegrasyonu
- [ ] Finding → DOF entegrasyonu
- [ ] DOF → Action entegrasyonu
- [ ] Workflow süreçleri
- [ ] Bildirim sistemi
- [ ] Raporlama

### **UI/UX Testleri:**

- [ ] Toast notifications
- [ ] Dialog'lar
- [ ] Form validations
- [ ] Progress bar'lar
- [ ] Status badge'ler
- [ ] Responsive design

---

## 🎯 **TEST BAŞARILI SAYILMA KRİTERLERİ**

1. ✅ Denetim başarıyla oluşturuldu ve tamamlandı
2. ✅ Bulgu otomatik oluştu ve detayları eklendi
3. ✅ DÖF 8 adım başarıyla tamamlandı
4. ✅ Kök neden doğru tespit edildi
5. ✅ Faaliyetler planlandı ve uygulandı
6. ✅ Aksiyonlar atandı ve tamamlandı
7. ✅ Etkinlik kontrolü başarılı
8. ✅ Yönetici onayı alındı
9. ✅ Tüm süreçler kapatıldı
10. ✅ Hiçbir hata/bug tespit edilmedi

---

## 📸 **EKRAN GÖRÜNTÜLERİ ALINACAK NOKTALAR**

1. Denetim oluşturma formu
2. Denetim soru cevaplama ekranı
3. Bulgu detay sayfası
4. DÖF 7 adımlı wizard
5. 5 Why analiz ekranı
6. Faaliyet takip tablosu
7. Etkinlik kontrol formu
8. Aksiyon onay ekranı
9. Timeline görünümü
10. Final dashboard

---

## 🐛 **HATALAR İÇİN NOT ALANLARI**

### **Tespit Edilen Hatalar:**

```
Bug #1:
Modül: 
Açıklama:
Adım:
Beklenen:
Gerçekleşen:
Ekran Görüntüsü:
```

---

## 🎉 **TEST TAMAMLANDI!**

**Test Eden:** _____________  
**Test Tarihi:** _____________  
**Test Süresi:** _____________  
**Sonuç:** [ ] Başarılı [ ] Başarısız  
**Notlar:**

```


```

**NEXT STEPS:**
1. Testi manual olarak çalıştır
2. Her adımda checkbox'ları işaretle
3. Sorun bulursan "Hatalar" bölümüne kaydet
4. Ekran görüntüleri al
5. Final rapor hazırla

---

**🚀 BAŞARILAR!**
