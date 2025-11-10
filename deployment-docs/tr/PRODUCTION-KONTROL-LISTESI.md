# ✅ Production Yayın Kontrol Listesi

**Denetim Uygulaması - Yayın Öncesi Doğrulama**

**Tarih:** ___________  
**Yayınlayan:** ___________  
**Hedef Tarih:** ___________

---

## 🔴 KRİTİK (Yayından Önce Tamamlanmalı)

### 1. Ortam & Secret'lar

- [ ] **Tüm Ortam Değişkenleri Yapılandırıldı**
  - [ ] `DATABASE_URL` production veritabanı ile
  - [ ] `NEXTAUTH_SECRET` üretildi (openssl rand -base64 32)
  - [ ] `NEXTAUTH_URL` production domain'e ayarlandı
  - [ ] `NEXT_PUBLIC_APP_URL` production domain'e ayarlandı
  - [ ] `RESEND_API_KEY` e-postalar için yapılandırıldı
  - [ ] `EMAIL_FROM` production e-postası ayarlandı
  - [ ] `UPLOADTHING_SECRET` ve `UPLOADTHING_APP_ID` yapılandırıldı
  - [ ] `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` yapılandırıldı
  - [ ] `SUPER_ADMIN_EMAIL` ve `SUPER_ADMIN_PASSWORD` güvence altında
  - [ ] `CRON_SECRET` üretildi

- [ ] **Secret'ların Güvenliği**
  - [ ] Varsayılan şifreler değiştirildi
  - [ ] Güçlü şifreler kullanıldı (12+ karakter, karışık)
  - [ ] `.env` dosyası Git'e commit edilmedi
  - [ ] `.env.example` sadece placeholder'larla güncellendi
  - [ ] Secret'lar yayın platformunda saklandı (Vercel/Railway)

### 2. Veritabanı Kurulumu

- [ ] **Production Veritabanı Hazır**
  - [ ] PostgreSQL 15+ instance oluşturuldu
  - [ ] SSL/TLS etkinleştirildi
  - [ ] Connection pooling yapılandırıldı (max 20 bağlantı)
  - [ ] Veritabanı uygulamadan erişilebilir

- [ ] **Migration'lar Çalıştırıldı**
  ```powershell
  pnpm db:migrate
  ```
  - [ ] Tüm migration'lar başarıyla uygulandı
  - [ ] Veritabanı şeması Drizzle Studio'da doğrulandı

- [ ] **İlk Veriler Yüklendi**
  ```powershell
  pnpm seed:master
  ```
  - [ ] Admin kullanıcı oluşturuldu
  - [ ] Roller ve yetkiler oluşturuldu
  - [ ] Menüler dolduruldu
  - [ ] Varsayılan iş akışları oluşturuldu

- [ ] **Yedekleme Stratejisi**
  - [ ] Otomatik günlük yedeklemeler yapılandırıldı
  - [ ] Yedekleme saklama politikası (7+ gün)
  - [ ] Geri yükleme süreci test edildi
  - [ ] Yedekleme izleme etkinleştirildi

### 3. Redis Kurulumu

- [ ] **Redis Instance Hazır**
  - [ ] Redis 7+ instance oluşturuldu
  - [ ] Şifre kimlik doğrulaması etkinleştirildi
  - [ ] Persistence etkinleştirildi (AOF veya RDB)
  - [ ] Uygulamadan bağlantı test edildi

- [ ] **BullMQ Yapılandırması**
  - [ ] HR sync kuyruğu yapılandırıldı
  - [ ] Worker process çalışıyor
  - [ ] Kuyruk izleme erişilebilir

### 4. SSL/HTTPS Yapılandırması

- [ ] **SSL Sertifikası Kuruldu**
  - [ ] Geçerli SSL sertifikası (Let's Encrypt veya ticari)
  - [ ] Sertifika otomatik yenileme yapılandırıldı
  - [ ] HTTPS zorlandı (HTTP, HTTPS'e yönlendiriliyor)
  - [ ] Sertifika zinciri doğrulandı

- [ ] **Güvenlik Başlıkları**
  - [ ] HSTS başlığı etkinleştirildi
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection etkinleştirildi

### 5. Build & Yayın

- [ ] **Build Testi Geçti**
  ```powershell
  pnpm build
  ```
  - [ ] TypeScript hataları yok
  - [ ] Build uyarıları yok
  - [ ] Bundle boyutu kabul edilebilir (< 500KB ilk yükleme)
  - [ ] Tüm sayfalar doğru render ediliyor

- [ ] **Yayın Platformu Yapılandırıldı**
  - [ ] Platform seçildi (Vercel/Railway/Docker)
  - [ ] Domain yapılandırıldı
  - [ ] DNS kayıtları güncellendi (A/CNAME)
  - [ ] Ortam değişkenleri platformda ayarlandı
  - [ ] Push'ta otomatik yayın yapılandırıldı (isteğe bağlı)

### 6. CRON İşleri

- [ ] **CRON İşleri Yapılandırıldı**
  - [ ] `create-scheduled-audits` - Her gün gece yarısı
  - [ ] `workflow-deadline-check` - Her saat
  - [ ] CRON kimlik doğrulaması yapılandırıldı
  - [ ] CRON endpoint'leri manuel test edildi

- [ ] **CRON Doğrulaması**
  ```powershell
  # CRON endpoint'lerini test et
  curl -X POST https://alan-adiniz.com/api/cron/create-scheduled-audits `
    -H "Authorization: Bearer $CRON_SECRET"
  ```

### 7. Admin Hesabı

- [ ] **Süper Admin Oluşturuldu**
  - [ ] Giriş bilgileri güvence altında
  - [ ] E-posta doğru yapılandırıldı
  - [ ] Şifre güvenlik politikasını karşılıyor
  - [ ] 2FA etkinleştirildi (varsa)
  - [ ] Yedek admin hesabı oluşturuldu

### 8. Kritik Yol Testi

- [ ] **Kimlik Doğrulama Akışı**
  - [ ] Kullanıcı giriş yapabiliyor
  - [ ] Kullanıcı çıkış yapabiliyor
  - [ ] Şifre sıfırlama çalışıyor
  - [ ] Oturum kalıcılığı çalışıyor

- [ ] **Denetim İş Akışı**
  - [ ] Şablondan denetim oluşturma
  - [ ] Soruları cevaplama
  - [ ] Denetimi tamamlama
  - [ ] Bulgu oluşturma
  - [ ] Denetim tamamlama doğrulaması

- [ ] **Aksiyon İş Akışı**
  - [ ] Bulgudan aksiyon oluşturma
  - [ ] Aksiyonu tamamlama
  - [ ] Yönetici onay/red
  - [ ] Red döngüsü çalışıyor
  - [ ] Zaman çizelgesi doğru

- [ ] **DÖF İş Akışı**
  - [ ] DÖF oluşturma
  - [ ] 8 adımı tamamlama
  - [ ] Yönetici onay/reddi
  - [ ] Faaliyet takibi
  - [ ] Etkinlik kontrolü

- [ ] **Bulgu İş Akışı**
  - [ ] Bulgu oluşturma
  - [ ] Süreç sahibine atama
  - [ ] Kapanış için gönderme
  - [ ] Denetçi onayı
  - [ ] Kapanış doğrulaması (bekleyen aksiyon kontrolü)

- [ ] **Yetkiler**
  - [ ] Admin bypass çalışıyor
  - [ ] Rol bazlı yetkiler çalışıyor
  - [ ] İş akışı yetkileri çalışıyor
  - [ ] Sahiplik yetkileri çalışıyor
  - [ ] Yetkisiz erişim engelleniyor

- [ ] **Dosya Yükleme**
  - [ ] Dosyalar başarıyla yükleniyor
  - [ ] Dosya boyutu limitleri çalışıyor
  - [ ] Dosya türleri doğrulanıyor
  - [ ] Dosyalar yüklemeden sonra erişilebilir

- [ ] **E-posta Bildirimleri**
  - [ ] Görev atamasında e-posta gönderiliyor
  - [ ] Onay/red'de e-posta gönderiliyor
  - [ ] Termin yaklaşırken e-posta gönderiliyor
  - [ ] E-posta şablonları doğru render ediliyor

---

## 🟡 ÖNEMLİ (Yayından Önce Önerilir)

### 9. Performans Optimizasyonu

- [ ] **Next.js Optimizasyonları**
  - [ ] Image optimization etkinleştirildi
  - [ ] Compression etkinleştirildi
  - [ ] SWC minification etkinleştirildi
  - [ ] Statik sayfalar önbelleğe alındı

- [ ] **Veritabanı Optimizasyonu**
  - [ ] Sık sorgulanan kolonlarda index'ler oluşturuldu
  - [ ] Connection pooling yapılandırıldı
  - [ ] Sorgu performansı test edildi

- [ ] **CDN Yapılandırması** (İsteğe Bağlı)
  - [ ] Statik varlıklar CDN'de
  - [ ] Önbellek başlıkları yapılandırıldı

### 10. İzleme & Loglama

- [ ] **Uygulama İzleme**
  - [ ] Hata takibi (Sentry/LogRocket)
  - [ ] Performans izleme
  - [ ] Uptime izleme (UptimeRobot)
  - [ ] Log toplama

- [ ] **Uyarılar Yapılandırıldı**
  - [ ] Hata oranı uyarısı
  - [ ] Downtime uyarısı
  - [ ] Veritabanı bağlantı uyarısı
  - [ ] Disk alanı uyarısı

### 11. Dokümantasyon

- [ ] **Kullanıcı Dokümantasyonu**
  - [ ] Kullanıcı kılavuzu oluşturuldu
  - [ ] Video eğitimleri (isteğe bağlı)
  - [ ] SSS dökümanı
  - [ ] Admin kılavuzu

- [ ] **Teknik Dokümantasyon**
  - [ ] README güncellendi
  - [ ] Yayın kılavuzu incelendi
  - [ ] API dokümantasyonu
  - [ ] Veritabanı şeması dokümante edildi

### 12. Kullanıcı Yönetimi

- [ ] **İlk Kullanıcılar Oluşturuldu**
  - [ ] Departman yöneticileri
  - [ ] Denetçiler
  - [ ] Süreç sahipleri
  - [ ] Test hesapları kaldırıldı

- [ ] **Roller Yapılandırıldı**
  - [ ] Varsayılan roller doğrulandı
  - [ ] Özel roller oluşturuldu (gerekirse)
  - [ ] Yetkiler doğru atandı

### 13. İş Akışları

- [ ] **Varsayılan İş Akışları Oluşturuldu**
  - [ ] Aksiyon Hızlı Akış
  - [ ] Aksiyon Karmaşık Akış
  - [ ] DÖF Standart CAPA Akışı
  - [ ] Denetim Normal Akış
  - [ ] Denetim Kritik Akış

- [ ] **İş Akışı Testi**
  - [ ] Her iş akışı uçtan uca test edildi
  - [ ] Otomatik atama çalışıyor
  - [ ] Terminler doğru hesaplanıyor
  - [ ] Geçişler çalışıyor

### 14. Organizasyon Yapısı

- [ ] **Organizasyon Verileri**
  - [ ] Şirketler oluşturuldu
  - [ ] Şubeler oluşturuldu
  - [ ] Departmanlar oluşturuldu
  - [ ] Pozisyonlar tanımlandı

- [ ] **Veri Doğrulama**
  - [ ] Hiyerarşi doğru
  - [ ] Yetim kayıt yok
  - [ ] Aktif/pasif durum doğru

---

## 🟢 İYİ OLUR (Yayın Sonrası)

### 15. Gelişmiş Özellikler

- [ ] **Raporlama**
  - [ ] PDF rapor oluşturma
  - [ ] Excel export
  - [ ] Özel rapor oluşturucu

- [ ] **Analitik**
  - [ ] Dashboard grafikleri
  - [ ] KPI takibi
  - [ ] Trend analizi

- [ ] **Entegrasyonlar**
  - [ ] LDAP/AD entegrasyonu
  - [ ] Harici API entegrasyonu
  - [ ] Webhook desteği

### 16. Mobil Optimizasyon

- [ ] **Responsive Tasarım**
  - [ ] Mobil layout test edildi
  - [ ] Tablet layout test edildi
  - [ ] Dokunma hareketleri çalışıyor

### 17. Eğitim & Destek

- [ ] **Kullanıcı Eğitimi**
  - [ ] Eğitim oturumları planlandı
  - [ ] Eğitim materyalleri hazırlandı
  - [ ] Destek ekibi hazır

- [ ] **Destek Kanalları**
  - [ ] Yardım masası e-postası
  - [ ] Destek ticket sistemi
  - [ ] Bilgi tabanı

---

## 🔧 Teknik Doğrulama

### Sistem Gereksinimleri

- [ ] **Sunucu Kaynakları**
  - [ ] CPU: 2+ çekirdek
  - [ ] RAM: 4GB+ mevcut
  - [ ] Disk: 50GB+ mevcut
  - [ ] Ağ: 100Mbps+ bant genişliği

- [ ] **Tarayıcı Desteği**
  - [ ] Chrome 90+ test edildi
  - [ ] Firefox 90+ test edildi
  - [ ] Safari 14+ test edildi
  - [ ] Edge 90+ test edildi

### Yük Testi (İsteğe Bağlı)

- [ ] **Performans Kriterleri**
  - [ ] 100 eşzamanlı kullanıcı destekleniyor
  - [ ] Yanıt süresi < 500ms (p95)
  - [ ] Veritabanı sorguları < 100ms
  - [ ] Sayfa yükleme süresi < 2 saniye

### Güvenlik Testi

- [ ] **Güvenlik Taraması**
  - [ ] OWASP Top 10 kontrol edildi
  - [ ] SQL injection test edildi
  - [ ] XSS vulnerability test edildi
  - [ ] CSRF koruması doğrulandı

- [ ] **Penetrasyon Testi** (İsteğe Bağlı)
  - [ ] Üçüncü taraf güvenlik denetimi
  - [ ] Güvenlik açığı taraması

---

## 📊 Yayın Günü Kontrol Listesi

### Yayın Öncesi (Sabah)

- [ ] **Son Doğrulama**
  - [ ] Veritabanı yedeği oluşturuldu
  - [ ] Tüm servisler çalışıyor
  - [ ] İzleme aktif
  - [ ] Destek ekibi hazır

- [ ] **İletişim**
  - [ ] Kullanıcılar yayın zamanından haberdar edildi
  - [ ] Bakım penceresi duyuruldu (gerekirse)
  - [ ] Destek iletişim bilgileri paylaşıldı

### Yayın (Canlıya Alınırken)

- [ ] **Yayın**
  - [ ] Production yayını tetiklendi
  - [ ] Yayın başarılı
  - [ ] Sağlık kontrolü geçti
  - [ ] Loglarda hata yok

- [ ] **Smoke Testing**
  - [ ] Ana sayfa yükleniyor
  - [ ] Giriş çalışıyor
  - [ ] Denetim oluşturma çalışıyor
  - [ ] Bulgu oluşturma çalışıyor
  - [ ] Aksiyon oluşturma çalışıyor

### Yayın Sonrası (İlk Saat)

- [ ] **İzleme**
  - [ ] Hata oranı normal
  - [ ] Yanıt süreleri kabul edilebilir
  - [ ] Veritabanı hataları yok
  - [ ] Redis hataları yok

- [ ] **Kullanıcı Geri Bildirimi**
  - [ ] Kullanıcılar sisteme erişebiliyor
  - [ ] Kritik sorun rapor edilmedi
  - [ ] Destek talepleri izleniyor

### Yayın Sonrası (İlk 24 Saat)

- [ ] **Sistem Sağlığı**
  - [ ] Uptime %100
  - [ ] Kritik hata yok
  - [ ] Performans kabul edilebilir
  - [ ] CRON işleri çalışıyor

- [ ] **Kullanıcı Benimseme**
  - [ ] Kullanıcılar giriş yapıyor
  - [ ] Denetimler oluşturuluyor
  - [ ] İş akışları çalışıyor
  - [ ] Engelleyici yok

### Yayın Sonrası (İlk Hafta)

- [ ] **Kararlılık**
  - [ ] Sistem kararlı
  - [ ] Yedeklemeler çalışıyor
  - [ ] İzleme verileri toplandı
  - [ ] Performans metrikleri incelendi

- [ ] **Geri Bildirim Toplama**
  - [ ] Kullanıcı geri bildirimi toplandı
  - [ ] Hata raporları önceliklendirildi
  - [ ] Özellik istekleri kaydedildi
  - [ ] İyileştirmeler planlandı

---

## 🆘 Geri Alma Planı

### Kritik Sorun Oluşursa

1. **Yeni Kullanıcıları Durdur**
   - Bakım modu duyurusı yap
   - Yeni kayıtları devre dışı bırak

2. **Etkiyi Değerlendir**
   - Hata loglarını kontrol et
   - Etkilenen kullanıcıları belirle
   - Önem derecesini tespit et

3. **Geri Al (gerekirse)**
   ```powershell
   # Vercel
   vercel rollback
   
   # Docker
   docker-compose down
   docker-compose up -d --scale app=0
   ```

4. **Veritabanını Geri Yükle (gerekirse)**
   ```powershell
   psql $DATABASE_URL < backup.sql
   ```

5. **İletişim Kur**
   - Kullanıcıları sorundan haberdar et
   - Tahmini düzeltme süresi ver
   - Durum sayfasını güncelle

---

## 📞 Acil İletişim

**Teknik Lider:** ___________  
**DevOps:** ___________  
**Veritabanı Yöneticisi:** ___________  
**Destek Lideri:** ___________

**Hosting Sağlayıcı Desteği:**  
- Vercel: support@vercel.com
- Railway: help@railway.app
- Veritabanı Sağlayıcı: ___________

---

## ✅ Onay

### Yayın Öncesi Onay

**Teknik Lider:** ___________  Tarih: ___________  
**Proje Yöneticisi:** ___________  Tarih: ___________  
**QA Lideri:** ___________  Tarih: ___________  
**Güvenlik Sorumlusu:** ___________  Tarih: ___________

### Yayın Sonrası Doğrulama

**Sistem Durumu:** ✅ Çalışıyor / ⚠️ Sorunlar Var / ❌ Çalışmıyor  
**Kullanıcı Geri Bildirimi:** ✅ Olumlu / ⚠️ Karışık / ❌ Olumsuz  
**Performans:** ✅ Mükemmel / ⚠️ Kabul Edilebilir / ❌ Zayıf

**Notlar:**
```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

---

**🎉 PRODUCTION İÇİN HAZIR!**

**Yayın Tarihi:** ___________  
**Production URL:** ___________  
**Durum:** ✅ Canlı

---

**Son Güncelleme:** ___________  
**Kontrol Listesi Versiyonu:** 1.0
