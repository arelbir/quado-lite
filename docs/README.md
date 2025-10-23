# 📚 Denetim Sistemi Dokümantasyonu

## 🎯 Genel Bakış

Bu dizin, kurumsal denetim sisteminin kapsamlı teknik dokümantasyonunu içerir.

---

## 📄 Dosyalar

### 1. [AUDIT-SYSTEM-OVERVIEW.md](./AUDIT-SYSTEM-OVERVIEW.md)
**Genel bakış, sistem özeti, modüller**

İçerik:
- ✅ Sistem tanıtımı ve temel özellikler
- ✅ Ana modüller (Plans, Audits, Findings, DÖF, Actions)
- ✅ Genel akış şeması (baştan sona)
- ✅ Roller ve yetkiler
- ✅ İş kuralları
- ✅ Bildirim sistemi
- ✅ Raporlar
- ✅ Teknoloji stack

**Kime göre:** Product Manager, Yeni geliştiriciler, Stakeholder'lar

---

### 2. [AUDIT-SYSTEM-DATABASE.md](./AUDIT-SYSTEM-DATABASE.md)
**Database schema, tablolar, ilişkiler**

İçerik:
- ✅ Entity İlişki Diyagramı (ERD)
- ✅ Tüm tabloların detaylı açıklaması
- ✅ DÖF (7 adımlı CAPA) + Action entegrasyonu
- ✅ Drizzle ORM relations
- ✅ Index stratejileri
- ✅ Performans optimizasyonları
- ✅ Migration planı

**Kime göre:** Backend geliştiriciler, Database yöneticileri

---

### 2.5. [HYBRID-APPROACH.md](./HYBRID-APPROACH.md) 🆕
**DÖF + Action Modülü Entegrasyonu**

İçerik:
- ✅ Hibrit yaklaşım açıklaması
- ✅ DRY prensibi uygulaması
- ✅ 7 adımlı DÖF + Action entegrasyonu
- ✅ Migration stratejisi
- ✅ Karşılaştırma tablosu
- ✅ Backend logic örnekleri

**Kime göre:** Tüm geliştiriciler, Mimari kararlar

---

### 3. [AUDIT-SYSTEM-WORKFLOWS.md](./AUDIT-SYSTEM-WORKFLOWS.md)
**Status akışları, state machine'ler, business logic**

İçerik:
- ✅ Audit Plan workflow
- ✅ Audit workflow
- ✅ Finding workflow
- ✅ DÖF workflow (7 adımlı)
- ✅ Action workflow
- ✅ Status geçiş kuralları
- ✅ Otomatik geçişler
- ✅ Business logic kod örnekleri

**Kime göre:** Backend geliştiriciler, Frontend geliştiriciler, QA

---

### 4. [AUDIT-SYSTEM-API.md](./AUDIT-SYSTEM-API.md)
**API endpoints, server actions, business logic**

İçerik:
- ✅ REST API endpoints
- ✅ Server Actions listesi
- ✅ Business logic fonksiyonları
- ✅ Bildirim sistemi
- ✅ Kod örnekleri

**Kime göre:** Backend geliştiriciler, Frontend geliştiriciler, API tüketicileri

---

## 🚀 Hızlı Başlangıç

### Yeni Geliştiriciler İçin
1. [AUDIT-SYSTEM-OVERVIEW.md](./AUDIT-SYSTEM-OVERVIEW.md) - Sistemi tanı
2. [HYBRID-APPROACH.md](./HYBRID-APPROACH.md) - DÖF + Action entegrasyonunu anla
3. [AUDIT-SYSTEM-WORKFLOWS.md](./AUDIT-SYSTEM-WORKFLOWS.md) - Akışları öğren
4. [AUDIT-SYSTEM-DATABASE.md](./AUDIT-SYSTEM-DATABASE.md) - Veri modelini incele
5. [AUDIT-SYSTEM-API.md](./AUDIT-SYSTEM-API.md) - API'yi kullan

### Backend Geliştirme
- Database değişiklikleri → [DATABASE.md](./AUDIT-SYSTEM-DATABASE.md)
- DÖF + Action entegrasyonu → [HYBRID-APPROACH.md](./HYBRID-APPROACH.md)
- Status logic → [WORKFLOWS.md](./AUDIT-SYSTEM-WORKFLOWS.md)
- API implementasyonu → [API.md](./AUDIT-SYSTEM-API.md)

### Frontend Geliştirme
- Akış şemaları → [OVERVIEW.md](./AUDIT-SYSTEM-OVERVIEW.md)
- Status gösterimi → [WORKFLOWS.md](./AUDIT-SYSTEM-WORKFLOWS.md)
- API çağrıları → [API.md](./AUDIT-SYSTEM-API.md)

---

## 📊 Sistem Akışı (Özet)

```
1. PLAN OLUŞTUR
   ├─ Scheduled (tarih belirlenir)
   └─ Adhoc (hemen başlar)

2. DENETİM BAŞLAR
   ├─ Sorular eklenir/cevapanır
   └─ Bulgular kaydedilir

3. BULGULAR ATANIR
   └─ Süreç sorumlusuna

4. AKSİYON/DÖF AÇILIR
   ├─ Basit Aksiyon (direkt finding'e bağlı)
   └─ DÖF (7 adımlı CAPA süreci + alt aksiyonlar)

5. AKSİYONLAR TAMAMLANIR
   ├─ Sorumlu çalışır
   ├─ Yönetici onaylar/reddeder
   └─ Red ise döngü (tekrar çalışılır)

6. BULGU ONAYA GÖNDERİLİR
   ├─ Denetçi onaylar → Kapanır
   └─ Denetçi reddeder → Döngü

7. TÜM BULGULAR KAPANINCA
   └─ Denetim kapanır
```

---

## 🔑 Anahtar Kavramlar

### Status Enum'ları
- **Audit:** `Draft` → `Active` → `InProgress` → `PendingClosure` → `Closed` → `Archived`
- **Finding:** `Open` → `InProgress` → `PendingClosure` → `Closed`
- **Action:** `Assigned` ↔ `PendingManagerApproval` → `Completed` | `Cancelled`
- **DÖF:** `Step1` → `Step2` → ... → `Step6` → `PendingManagerApproval` → `Completed` (step-based)

### Döngü Mekanizmaları
- **Action Rejected:** `PendingApproval` → `Assigned` (sınırsız iterasyon)
- **Finding Rejected:** `PendingClosure` → `InProgress` (yeni aksiyon gerekli)

### Onay Hiyerarşisi
```
Action Owner → Action Manager → Process Owner → Auditor
```

---

## 🛠️ Geliştirme Notları

### DRY Prensipleri
- ✅ Action modülü hem basit aksiyonlar hem DÖF alt aksiyonları için kullanılır
- ✅ Tek onay mekanizması (kod tekrarı yok)
- ✅ DÖF 7 adımlı + Action entegrasyonu (hibrit yaklaşım)
- ✅ dofActivities tablosu kaldırıldı, actions tablosu kullanılıyor

### SOLID Prensipleri
- ✅ Single Responsibility: Her entity kendi sorumluluğu
- ✅ Open/Closed: Yeni action type'lar eklenebilir
- ✅ Dependency Inversion: Action modülü merkezi

### Best Practices
- ✅ Status geçişleri transaction içinde
- ✅ Bildirimler async (non-blocking)
- ✅ Soft delete (deletedAt field)
- ✅ Audit trail (timeline/history)
- ✅ Yetki kontrolü her endpoint'te

---

## 📞 İletişim

**Sorular veya öneriler için:**
- GitHub Issues
- Development Team Slack Channel
- Technical Lead

---

**Versiyon:** 1.0  
**Son Güncelleme:** 23 Ekim 2025  
**Durum:** Planlama Aşaması  
**Next Step:** Implementation başlangıcı
