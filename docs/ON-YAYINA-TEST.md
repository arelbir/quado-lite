# 🧪 Ön Yayın Test Scripti

**Yayına almadan önce çalıştırın**

**Tarih:** ___________  
**Test Eden:** ___________

---

## 🚀 Hızlı Test (5 Dakika)

### 1. Sağlık Kontrolü

```powershell
# Sağlık endpoint'ini test et
curl http://localhost:3000/api/health

# Beklenen yanıt:
# {
#   "status": "healthy",
#   "services": {
#     "database": { "status": "healthy" },
#     "redis": { "status": "healthy" }
#   }
# }
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 2. Build Testi

```powershell
# Temiz build
Remove-Item -Recurse -Force .next
pnpm build

# Hatasız tamamlanmalı
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ  
**Build Süresi:** ________ saniye

---

### 3. Kimlik Doğrulama Testi

1. http://localhost:3000 adresini aç
2. Giriş bilgileriyle giriş yap:
   - E-posta: `admin@example.com`
   - Şifre: `Admin123!`
3. `/denetim/audits` sayfasına yönlenmeli

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 4. Veritabanı Bağlantı Testi

```powershell
# Drizzle Studio'yu aç
pnpm db:studio

# Tabloların var olduğunu doğrula:
# - User
# - Roles
# - Permissions
# - Audits
# - Findings
# - Actions
# - DOFs
# - WorkflowDefinitions
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 5. Ortam Değişkenleri Testi

```powershell
# Gerekli değişkenlerin ayarlandığını kontrol et
$env:DATABASE_URL          # Ayarlanmış olmalı
$env:NEXTAUTH_SECRET       # Ayarlanmış olmalı (32+ karakter)
$env:NEXTAUTH_URL          # Domain ile eşleşmeli
$env:RESEND_API_KEY        # re_ ile başlamalı
$env:UPLOADTHING_SECRET    # sk_ ile başlamalı
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

## 🔍 Detaylı Test (15 Dakika)

### 6. Denetim Oluştur

1. `/denetim/audits` adresine git
2. "Yeni Denetim Oluştur"a tıkla
3. Şablon seç
4. Başlık yaz: "Test Denetimi"
5. "Oluştur"a tıkla

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ  
**Denetim ID:** ___________

---

### 7. Soruları Cevapla

1. Denetim detayını aç
2. En az 3 soruyu cevapla
3. Puanın güncellendiğini doğrula

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 8. Bulgu Oluştur

1. Denetim detayından "Bulgu Ekle"ye tıkla
2. Doldur:
   - Açıklama: "Test bulgusu"
   - Önem Derecesi: Yüksek
   - Risk Seviyesi: Orta
3. "Oluştur"a tıkla

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ  
**Bulgu ID:** ___________

---

### 9. Bulgu Ata

1. Bulgu detayını aç
2. "Sorumlu Ata"ya tıkla
3. Bir kullanıcı seç
4. "Ata"ya tıkla
5. Durumun "Atandı"ya değiştiğini doğrula

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 10. Aksiyon Oluştur

1. Bulgu detayından "Aksiyon Oluştur"a tıkla
2. Doldur:
   - Detaylar: "Test aksiyonu"
   - Atanan: Kullanıcı seç
   - Yönetici: Yönetici seç
   - Termin tarihi: Bugünden 3 gün sonra
3. "Oluştur"a tıkla

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ  
**Aksiyon ID:** ___________

---

### 11. Aksiyonu Tamamla

1. Aksiyon detayını aç
2. "Tamamla"ya tıkla
3. Tamamlama notları yaz: "Test tamamlama"
4. "Kaydet"e tıkla
5. Durumun "Yönetici Onayı Bekliyor"a değiştiğini doğrula

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 12. Yönetici Reddetme (DÖNGÜ TESTİ!)

1. Yönetici olarak giriş yap
2. Aksiyon detayını aç
3. "Reddet"e tıkla
4. Red nedeni yaz: "Test reddedilmesi"
5. "Reddet"e tıkla
6. **KRİTİK:** Durumun "Atandı"ya geri döndüğünü doğrula
7. Red nedeninin zaman çizelgesinde görünür olduğunu doğrula

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ  
**Döngü Çalışıyor:** [ ] EVET / [ ] HAYIR

---

### 13. Yönetici Onaylama

1. Aksiyonu tekrar tamamla
2. Yönetici "Onayla"ya tıklasın
3. Durumun "Tamamlandı"ya değiştiğini doğrula

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 14. Zaman Çizelgesi Kontrolü

1. Aksiyon detayını aç
2. Zaman çizelgesinin gösterdiğini doğrula:
   - Oluşturuldu olayı
   - İlk tamamlama
   - Reddedilme
   - İkinci tamamlama
   - Onaylama

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 15. Yetki Kontrolü

1. Admin'den çıkış yap
2. `/admin/users` adresine erişmeyi dene
3. Reddedilmeli veya yönlendirilmeli

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 16. Dosya Yükleme Testi

1. Dosya yükleme olan herhangi bir forma git
2. Küçük bir dosya yükle (< 1MB)
3. Dosyanın listede göründüğünü doğrula

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 17. E-posta Testi (yapılandırılmışsa)

1. Aksiyon oluştur ve kullanıcıya ata
2. Kullanıcının e-postasını kontrol et
3. Bildirimin alındığını doğrula

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ / [ ] ATLANDI

---

## 🔐 Güvenlik Kontrolleri

### 18. SQL Injection Testi

```powershell
# Kötü amaçlı girdi dene
# E-posta: admin@example.com' OR '1'='1
# Şifre: herhangi

# Başarısız olmalı
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 19. XSS Testi

1. Başlık ile denetim oluşturmayı dene:
   ```
   <script>alert('XSS')</script>
   ```
2. Kaçırılmalı/temizlenmeli

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 20. HTTPS Yönlendirme Testi (Sadece Production)

```powershell
curl -I http://alan-adiniz.com

# https://'e yönlendirmeli
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ / [ ] ATLANDI

---

## ⚡ Performans Kontrolleri

### 21. Sayfa Yükleme Testi

1. DevTools Network sekmesini aç
2. Ana sayfayı hard refresh yap
3. "Load" süresini kontrol et

**Sonuç:** [ ] < 2s (BAŞARILI) / [ ] > 2s (BAŞARISIZ)  
**Yükleme Süresi:** ________ saniye

---

### 22. Veritabanı Sorgu Testi

1. Aksiyon listesi sayfasını aç
2. Sorgu sürelerini DevTools Console'da kontrol et
3. < 100ms olmalı

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ  
**Sorgu Süresi:** ________ ms

---

### 23. Bundle Boyutu Kontrolü

```powershell
# .next klasör boyutunu kontrol et
Get-ChildItem .next -Recurse | Measure-Object -Property Length -Sum

# < 100MB olmalı
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ  
**Boyut:** ________ MB

---

## 🔄 CRON İşi Testi

### 24. Zamanlanmış Denetimler CRON

```powershell
# Manuel tetikle
curl -X POST http://localhost:3000/api/cron/create-scheduled-audits `
  -H "Authorization: Bearer $env:CRON_SECRET"

# Yanıtı kontrol et
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

### 25. Termin Kontrolü CRON

```powershell
# Manuel tetikle
curl -X POST http://localhost:3000/api/cron/workflow-deadline-check `
  -H "Authorization: Bearer $env:CRON_SECRET"

# Yanıtı kontrol et
```

**Sonuç:** [ ] BAŞARILI / [ ] BAŞARISIZ

---

## 📊 Test Özeti

**Toplam Test:** 25  
**Başarılı:** _____ / 25  
**Başarısız:** _____ / 25  
**Atlanan:** _____ / 25

**Başarı Oranı:** _____% 

**Genel Durum:** [ ] PRODUCTION İÇİN HAZIR / [ ] DÜZELTİLMESİ GEREKEN SORUNLAR VAR

---

## ❌ Başarısız Testler (Varsa)

| Test # | Test Adı | Sorun | Önem | Gerekli İşlem |
|--------|----------|-------|------|---------------|
| | | | Kritik/Yüksek/Orta/Düşük | |
| | | | | |
| | | | | |

---

## 📝 Notlar

```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

---

## ✅ Onay

**Test Eden:** ___________  
**Tarih:** ___________  
**Saat:** ___________

**Production İçin Onaylandı:** [ ] EVET / [ ] HAYIR

**İmza:** ___________

---

## 🚀 Sonraki Adımlar

Tüm testler başarılıysa:

1. [ ] YAYINA-ALMA-OZET.md'yi incele
2. [ ] PRODUCTION-KONTROL-LISTESI.md'yi tamamla
3. [ ] Production'a yayınla
4. [ ] Production'da smoke testleri çalıştır
5. [ ] 24 saat izle

Testler başarısızsa:

1. [ ] Sorunları düzelt
2. [ ] Başarısız testleri tekrar çalıştır
3. [ ] Onay al
4. [ ] Yayına devam et

---

**Test Scripti Versiyonu:** 1.0  
**Son Güncelleme:** 2025-01-07
