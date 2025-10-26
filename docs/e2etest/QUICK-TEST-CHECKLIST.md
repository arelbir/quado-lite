# ✅ HIZLI TEST CHECKLIST

**Test Süresi:** ~30 dakika  
**Hedef:** Tüm modüllerin çalıştığını doğrula

---

## 🚀 BAŞLANGIÇ

### Ön Hazırlık
- [ ] Database çalışıyor (PostgreSQL)
- [ ] `pnpm dev` çalıştır
- [ ] http://localhost:3000 açık
- [ ] Admin kullanıcısı ile giriş yap
- [ ] Seed data yüklü

---

## 1️⃣ DENETİM (AUDIT) - 5 dakika

### Oluşturma
- [ ] `/denetim/audits` → Yeni Denetim
- [ ] Form doldur: Başlık, Tip, Departman, Denetçi, Tarih
- [ ] Template seç (ISO 9001)
- [ ] Kaydet → Toast görüldü mü?

### Soru Cevaplama
- [ ] Denetim detay sayfası açıldı
- [ ] En az 3 soru cevapla
- [ ] 1 uygunsuzluk işaretle
- [ ] Skor görünüyor mu?

### Tamamlama
- [ ] "Denetimi Tamamla" butonu çalışıyor
- [ ] Toast: "Denetim tamamlandı"
- [ ] Status: Completed

**✅ AUDIT MODÜLÜ OK**

---

## 2️⃣ BULGU (FINDING) - 3 dakika

### Kontrol
- [ ] `/denetim/findings` sayfası açık
- [ ] Otomatik bulgu oluştu mu?
- [ ] Bulgu detayları doğru mu?

### Detay Ekleme
- [ ] Bulgu kartına tıkla
- [ ] "Düzenle" → Detay ekle
- [ ] Risk seviyesi: Yüksek
- [ ] Kategori: Majör
- [ ] Kaydet

**✅ FINDING MODÜLÜ OK**

---

## 3️⃣ DÖF (CAPA) - 15 dakika

### Açma
- [ ] Bulgu detayında "DÖF Aç" butonu
- [ ] DÖF oluşturuldu
- [ ] `/denetim/dofs/[id]` sayfası açıldı
- [ ] Progress bar görünüyor (7 step)

### Step 1: Problem Tanımı
- [ ] 5N1K formu açık
- [ ] 6 alanı doldur (Ne, Nerede, vb.)
- [ ] "Kaydet ve Devam"

### Step 2: Geçici Önlemler
- [ ] "Önlem Ekle" butonu
- [ ] 1 geçici önlem ekle
- [ ] Sorumlu ata, termin belirle
- [ ] "Kaydet ve Devam"

### Step 3: Kök Neden
- [ ] "5 Why" tab'i seç
- [ ] 5 neden yaz
- [ ] Kök neden belirle
- [ ] "Kaydet ve Devam"

### Step 4: Faaliyetler
- [ ] "Faaliyet Ekle" butonu
- [ ] 1 Düzeltici faaliyet ekle
- [ ] 1 Önleyici faaliyet ekle
- [ ] Sorumlu, termin belirle
- [ ] "Kaydet ve Devam"

### Step 5: Uygulama
- [ ] Faaliyet listesi görünüyor
- [ ] İlerleme bar var mı?
- [ ] "Tüm Faaliyetler Tamamlandı" tıkla

### Step 6: Etkinlik
- [ ] Kontrol soruları formu açık
- [ ] 3-4 soru cevapla
- [ ] Etkinlik skoru hesaplandı
- [ ] "Onaylandı" → Devam

### Step 7: Onay
- [ ] Yönetici onay formu açık
- [ ] Yorum ekle
- [ ] "Onayla ve Kapat" butonu
- [ ] Status: CLOSED
- [ ] Toast: "DÖF başarıyla kapatıldı"

**✅ DOF MODÜLÜ OK**

---

## 4️⃣ AKSİYON (ACTION) - 5 dakika

### Kontrol
- [ ] `/denetim/actions` sayfası
- [ ] DÖF'den gelen aksiyonlar var mı?
- [ ] Status: Assigned

### Tamamlama
- [ ] Aksiyon kartına tıkla
- [ ] "Tamamla" butonu
- [ ] Completion notes ekle
- [ ] Kaydet
- [ ] Status: PendingManagerApproval

### Onay
- [ ] Yönetici olarak giriş
- [ ] "Onayla" butonu
- [ ] Toast: "Aksiyon onaylandı"
- [ ] Status: Completed

**✅ ACTION MODÜLÜ OK**

---

## 5️⃣ WORKFLOW - 2 dakika

### Designer
- [ ] `/admin/workflows/builder` açık
- [ ] Node ekle (Start, Task, End)
- [ ] Edge/bağlantı çiz
- [ ] Properties panel açılıyor mu?
- [ ] "Save" → Dialog açıldı
- [ ] Workflow kaydedildi

### Liste
- [ ] `/admin/workflows` sayfası
- [ ] Workflow listede görünüyor
- [ ] Status: DRAFT
- [ ] "Publish" butonu çalışıyor
- [ ] Status: ACTIVE
- [ ] "Archive" butonu çalışıyor
- [ ] Status: ARCHIVED
- [ ] "Restore" butonu çalışıyor ✅
- [ ] Status: DRAFT (geri döndü)

**✅ WORKFLOW MODÜLÜ OK**

---

## 6️⃣ DASHBOARD & RAPORLAR - 2 dakika

### Ana Dashboard
- [ ] `/dashboard` sayfası açık
- [ ] İstatistik kartları dolu
- [ ] Grafikler render oldu
- [ ] Son aktiviteler görünüyor

### Raporlar
- [ ] Audit raporu görüntüle
- [ ] Finding özet raporu
- [ ] DÖF istatistikleri
- [ ] PDF export çalışıyor (opsiyonel)

**✅ DASHBOARD OK**

---

## 🎯 SONUÇ

### Test Özeti
```
✅ Audit: ___ / 3 test geçti
✅ Finding: ___ / 2 test geçti
✅ DOF: ___ / 7 test geçti
✅ Action: ___ / 3 test geçti
✅ Workflow: ___ / 4 test geçti
✅ Dashboard: ___ / 2 test geçti

TOPLAM: ___ / 21 test
BAŞARI ORANI: ___%
```

### Tespit Edilen Sorunlar
```
1. _______________________________
2. _______________________________
3. _______________________________
```

### Notlar
```




```

---

## 🏆 TEST DURUMU

- [ ] ✅ TÜM TESTLER BAŞARILI
- [ ] ⚠️ KÜÇÜK SORUNLAR VAR
- [ ] ❌ KRİTİK HATALAR VAR

**Test Tarihi:** _______________  
**Test Eden:** _______________  
**Süre:** _______________

---

**🚀 Happy Testing!**
