# 🎯 Denetim Sistemi - Genel Bakış

## 📋 İçindekiler
- [Sistem Özeti](#sistem-özeti)
- [Ana Modüller](#ana-modüller)
- [Genel Akış Şeması](#genel-akış-şeması)
- [Roller ve Yetkiler](#roller-ve-yetkiler)

---

## Sistem Özeti

Bu sistem, kurumsal denetim süreçlerini yönetmek için tasarlanmış kapsamlı bir platformdur. ISO 9001, ISO 27001 gibi standartlara uygun denetimler yapılabilir, bulgular takip edilir ve CAPA (Corrective and Preventive Action) süreçleri yönetilir.

### Temel Özellikler
- ✅ Planlı ve plansız denetimler
- ✅ Periyodik tekrarlama desteği
- ✅ Soru bankası ve şablonlar
- ✅ Bulgu yönetimi
- ✅ DÖF (Düzeltici ve Önleyici Faaliyet) / CAPA sistemi
- ✅ Aksiyon takibi ve onay süreçleri
- ✅ Otomatik bildirimler
- ✅ Raporlama ve analitik

---

## Ana Modüller

### 1. 📅 Denetim Planlama (Audit Planning)
**Amaç:** Denetimlerin önceden planlanması ve zamanında başlatılması

**Özellikler:**
- Planlı denetimler (scheduled)
- Plansız denetimler (adhoc)
- Periyodik tekrarlama (günlük, haftalık, aylık, 3 aylık, yıllık)
- Denetçi ataması
- Şablon bazlı plan oluşturma

**Statüler:**
- `Pending` - Bekliyor
- `Created` - Denetim oluşturuldu
- `Cancelled` - İptal edildi

---

### 2. 🔍 Denetim (Audit)
**Amaç:** Denetim sürecinin yürütülmesi ve bulguların kaydedilmesi

**Özellikler:**
- Soru-cevap sistemi
- Fotoğraf ve belge ekleme
- Bulgu oluşturma
- Puanlama sistemi
- Durum takibi

**Statüler:**
- `Draft` - Taslak (henüz başlamadı)
- `Active` - Aktif (bulgular bulunuyor)
- `InProgress` - İşlemde (bulgular çözülüyor)
- `PendingClosure` - Kapanış onayı bekliyor
- `Closed` - Kapalı
- `Archived` - Arşivlendi

---

### 3. 🔔 Bulgu (Finding)
**Amaç:** Denetim sırasında tespit edilen uygunsuzlukların yönetimi

**Özellikler:**
- Risk tipi belirleme (Kritik, Yüksek, Orta, Düşük)
- Süreç sorumlusuna atama
- Basit aksiyon veya DÖF açma
- Onay mekanizması
- Timeline takibi

**Statüler:**
- `Open` - Açık (süreç sorumlusuna atandı)
- `InProgress` - İşlemde (aksiyon/DÖF açılıyor)
- `PendingClosure` - Onay bekleniyor
- `Closed` - Kapalı (onaylandı)

---

### 4. 📋 DÖF / CAPA (Corrective & Preventive Action)
**Amaç:** Kompleks bulguların kök neden analizi ve sistematik çözümü

**7 Adımlı CAPA Süreci (ISO 9001 Uyumlu):**
1. **Problem Tanımı (5N1K)** - Ne? Nerede? Ne zaman? Kim? Nasıl? Niçin?
2. **Geçici Önlemler** - Hızlı aksiyonlar
3. **Kök Neden Analizi** - 5 Why, Fishbone, Freeform
4. **Faaliyet Belirleme** - Düzeltici/Önleyici action'lar oluştur
5. **Uygulama** - Action'ları tamamla
6. **Etkinlik Kontrolü** - Sonuç değerlendirmesi
7. **Yönetici Onayı** - Approve/Reject

**Özellikler:**
- 7 adımlı wizard interface
- Kök neden analizi (3 method: 5 Why, Fishbone, Freeform)
- Alt action yönetimi (Action modülü kullanır)
- Etkinlik kontrolü
- Progress bar (visual tracking)

**Statü (Step-Based):**
- `Step1_Problem` - Adım 1: Problem Tanımı
- `Step2_TempMeasures` - Adım 2: Geçici Önlemler
- `Step3_RootCause` - Adım 3: Kök Neden Analizi
- `Step4_Activities` - Adım 4: Faaliyet Belirleme
- `Step5_Implementation` - Adım 5: Uygulama
- `Step6_EffectivenessCheck` - Adım 6: Etkinlik Kontrolü
- `PendingManagerApproval` - Yönetici onayı bekliyor
- `Completed` - Tamamlandı
- `Rejected` - Reddedildi

**Alt Action Durumu (Computed):**
DÖF'ün genel durumu alt action'lara göre hesaplanır:
- Tüm action'lar Completed → DÖF Step6'ya geçebilir
- Action'lar devam ediyor → Step5'te kalır

---

### 5. ⚡ Aksiyon/DÖF Açılır
**Amaç:** Hem basit aksiyonlar hem de DÖF alt aksiyonlarının yönetimi

**Özellikler:**
- Sorumlu atama
- Yönetici onayı
- İlerleme notları
- Tamamlama kanıtları
- Red ve döngü mekanizması
- **DRY:** DÖF action'ları da bu modülü kullanır

**Tipler:**
- `Simple` - Basit aksiyon (direkt bulguya bağlı)
- `Corrective` - Düzeltici aksiyon (DÖF altında)
- `Preventive` - Önleyici aksiyon (DÖF altında)

**Statüler:**
- `Assigned` - Sorumluya atandı
- `PendingManagerApproval` - Onay bekliyor
- `Completed` - Tamamlandı
- `Cancelled` - İptal edildi

**Bağlantı:**
- `findingId` → Basit aksiyon için
- `dofId` → DÖF aksiyonu için

---

## Genel Akış Şeması

```
┌─────────────────────────────────────────────────────────┐
│                    1. PLANLAMA                           │
│  Admin plan oluşturur                                    │
│  └─ Scheduled: Tarih belirlenir                          │
│  └─ Adhoc: Hemen başlatılır                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  2. DENETİM BAŞLAR                       │
│  Status: Draft → Active                                  │
│  ├─ Denetçi sorular ekler/cevaplar                       │
│  ├─ Fotoğraf ve belgeler eklenir                         │
│  └─ Bulgular kaydedilir                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                3. BULGU OLUŞTURULUR                      │
│  Status: Open                                            │
│  ├─ Risk tipi belirlenir                                 │
│  ├─ Süreç sorumlusuna atanır                             │
│  └─ Audit: Active → InProgress                           │
└─────────────────────────────────────────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
┌─────────────────────┐   ┌─────────────────────────────┐
│   BASIT AKSIYON     │   │   DÖF (7 Adımlı CAPA)      │
│                     │   │                             │
│  Finding: Open →    │   │  Finding: Open →            │
│  InProgress         │   │  InProgress                 │
│                     │   │                             │
│  Action oluşturulur │   │  DÖF Oluşturulur:          │
│  └─ Type: Simple    │   │  ├─ Step1: Problem (5N1K)  │
│                     │   │  ├─ Step2: Geçici Önlem    │
│                     │   │  ├─ Step3: Kök Neden       │
│                     │   │  ├─ Step4: Actions Oluştur │
│                     │   │  │   ├─ Corrective 1       │
│                     │   │  │   ├─ Corrective 2       │
│                     │   │  │   └─ Preventive         │
│                     │   │  ├─ Step5: Uygulama        │
│                     │   │  ├─ Step6: Etkinlik        │
│                     │   │  └─ Step7: Yönetici Onay   │
└─────────────────────┘   └─────────────────────────────┘
            ↓                       ↓
┌─────────────────────────────────────────────────────────┐
│               4. AKSİYON TAMAMLANIR                      │
│  Action: Assigned → PendingApproval → Completed         │
│  ├─ Sorumlu çalışır                                      │
│  ├─ Kanıt ekler                                          │
│  ├─ Yönetici onaylar/reddeder                            │
│  └─ Red durumunda: Assigned'a döner (döngü)             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│            5. BULGU ONAYA GÖNDERİLİR                     │
│  Finding: InProgress → PendingClosure                    │
│  ├─ Tüm aksiyonlar tamamlanmış                           │
│  └─ Denetçi değerlendirmesi bekleniyor                   │
└─────────────────────────────────────────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
    ┌─────────────┐         ┌─────────────┐
    │   ONAYLA    │         │   REDDET    │
    └─────────────┘         └─────────────┘
            ↓                       ↓
    Finding: Closed         Finding: InProgress
         ✅                    (Döngü 🔄)
            ↓
┌─────────────────────────────────────────────────────────┐
│          6. TÜM BULGULAR TAMAMLANDI                      │
│  Audit: InProgress → PendingClosure                      │
│  ├─ Tüm bulgular Closed durumunda                        │
│  └─ Son denetçi kontrolü                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
            Denetçi Kapatır
                        ↓
┌─────────────────────────────────────────────────────────┐
│              7. DENETİM KAPANDI                          │
│  Audit: Closed ✅                                        │
│  └─ Raporlar oluşturulabilir                             │
│  └─ İsteğe bağlı: Archived                               │
└─────────────────────────────────────────────────────────┘
```

---

## Roller ve Yetkiler

### 👔 Admin / Yönetici
**Yetkiler:**
- ✅ Denetim planı oluşturma
- ✅ Denetçi atama
- ✅ Şablon yönetimi
- ✅ Soru bankası yönetimi
- ✅ Kullanıcı yönetimi
- ✅ Sistem ayarları

### 🔍 Denetçi (Auditor)
**Yetkiler:**
- ✅ Denetim başlatma
- ✅ Soru ekleme/cevaplama
- ✅ Bulgu oluşturma
- ✅ Bulgu onaylama/reddetme
- ✅ Denetim kapatma
- ✅ Rapor oluşturma

### 👤 Süreç Sorumlusu (Process Owner)
**Yetkiler:**
- ✅ Bulgu görüntüleme (kendine atananlar)
- ✅ Aksiyon oluşturma
- ✅ DÖF oluşturma
- ✅ Kök neden analizi
- ✅ Aksiyon atama
- ⚠️ Bulgu kapatamaz (sadece denetçi)

### ⚙️ Aksiyon Sorumlusu (Action Owner)
**Yetkiler:**
- ✅ Aksiyon görüntüleme (kendine atananlar)
- ✅ Aksiyon tamamlama
- ✅ Kanıt ekleme
- ✅ İlerleme notları
- ⚠️ Aksiyonu tamamladı olarak işaretler, onaylayamaz

### 👨‍💼 Aksiyon Yöneticisi (Action Manager)
**Yetkiler:**
- ✅ Aksiyon onaylama
- ✅ Aksiyon reddetme (döngü)
- ✅ Aksiyon iptal etme
- ✅ İlerleme takibi

---

## Temel İş Kuralları

### Denetim Kapatma Kuralları
```
Denetim kapatılabilir ⇔ Tüm bulgular Closed durumunda
```

### Bulgu Kapatma Kuralları
```
Bulgu kapatılabilir ⇔ (Basit Aksiyonlar Completed) ∧ (Tüm DÖF Aksiyonları Completed)
```

### DÖF Statü Yönetimi
```
DÖF Status = Step-based (7 adım)

Step 1-3: Problem tanımı ve kök neden analizi
Step 4: Action'lar oluşturulur (Corrective/Preventive)
Step 5: Action'lar tamamlanır
  └─ Tüm action'lar Completed → Step 6'ya geç
Step 6: Etkinlik kontrolü
Step 7: Yönetici onayı → Completed

Alt Action Kontrolü:
- Tüm action'lar Completed → DÖF Step 6'ya geçebilir
- Action'lar devam ediyor → DÖF Step 5'te kalır
```

### Onay Döngüsü Kuralları
```
Action: PendingApproval
    ├─ ONAYLA → Status: Completed (Final)
    └─ REDDET → Status: Assigned (Döngü, sınırsız iterasyon)
    
Finding: PendingClosure
    ├─ ONAYLA → Status: Closed (Final)
    └─ REDDET → Status: InProgress (Yeni aksiyon gerekli)
```

---

## Bildirim Sistemi

### Otomatik Bildirimler
- 🔔 Denetim tarihi yaklaştığında (3 gün öncesi)
- 🔔 Yeni bulgu atandığında (Süreç sorumlusu)
- 🔔 Yeni aksiyon atandığında (Aksiyon sorumlusu)
- 🔔 Aksiyon onay bekliyor (Yönetici)
- 🔔 Aksiyon reddedildi (Aksiyon sorumlusu)
- 🔔 Bulgu onay bekliyor (Denetçi)
- 🔔 Denetim kapanma tarihi yaklaştı (Denetçi)
- 🔔 Geç kalan aksiyonlar (Tüm ilgililer)

---

## Raporlar

### Mevcut Raporlar
1. **Denetim Özet Raporu**
   - Genel bilgiler
   - Bulgu sayıları (risk tipine göre)
   - Tamamlanma oranı
   - Grafik ve görseller

2. **Bulgu Detay Raporu**
   - Bulgu listesi
   - Aksiyon durumları
   - Sorumlu kişiler
   - Timeline

3. **Aksiyon Takip Raporu**
   - Tüm aksiyonlar
   - Durum dağılımı
   - Gecikmeler
   - Performans metrikleri

4. **Periyodik Özet**
   - Aylık/çeyrek/yıllık özet
   - Trend analizleri
   - Karşılaştırmalar

---

## Teknoloji Stack

### Frontend
- **Framework:** Next.js 15
- **UI:** Shadcn/ui + Tailwind CSS v4
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table + Dice UI
- **Charts:** Recharts

### Backend
- **API:** Next.js Server Actions + API Routes
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js

### Deployment
- **Platform:** Vercel (önerilen)
- **Database:** Supabase / Railway / Neon
- **Storage:** Cloudinary / AWS S3 (fotoğraflar için)

---

## Sonraki Adımlar

1. ✅ Database schema oluşturma (AUDIT-SYSTEM-DATABASE.md)
2. ✅ Status workflow'ları detaylandırma (AUDIT-SYSTEM-WORKFLOWS.md)
3. ✅ Backend API tasarımı (AUDIT-SYSTEM-API.md)
4. 🔄 Frontend UI/UX tasarımı
5. 🔄 Migration stratejisi
6. 🔄 Test planı

---

**Versiyon:** 1.0  
**Son Güncelleme:** 23 Ekim 2025  
**Durum:** Planlama Aşaması
