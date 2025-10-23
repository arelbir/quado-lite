// Comprehensive Seed: Kurumsal Denetim Sistemi
// IT Denetimleri + Üretim + Kalite + Çevre
import { db } from "@/drizzle/db";
import { audits, findings, actions, dofs, dofActivities, actionProgress } from "@/drizzle/schema";

export async function seedComprehensiveAuditData() {
  console.log("🌱 Seeding comprehensive audit system data...");

  try {
    // Kullanıcıları bul
    const users = await db.query.user.findMany({
      limit: 13,
    });

    if (users.length < 5) {
      console.error("❌ Not enough users. Run seed:users first");
      return;
    }

    const [admin, mehmet, ali, ayse, fatma, selin, can, deniz, ece, burak, zeynep, elif] = users;

    if (!admin || !mehmet || !can) {
      console.error("❌ Required users not found");
      return;
    }

    // ===========================================
    // 1. ISO 9001 İÇ DENETİMİ (ÜRET İM)
    // ===========================================
    console.log("📋 Creating ISO 9001 audit...");
    const [audit1] = await db
      .insert(audits)
      .values({
        title: "ISO 9001 İç Denetimi - Üretim Bölümü",
        description: "2024 yılı Q4 ISO 9001:2015 kalite yönetim sistemi iç denetimi. Üretim süreçleri, kalibrasyon ve dokümantasyon kontrolü.",
        auditDate: new Date("2024-10-15"),
        createdById: admin!.id,
      })
      .returning();

    if (!audit1) throw new Error("Failed to create ISO 9001 audit");

    // Bulgu 1: Kalibrasyon eksikliği
    const [finding1] = await db
      .insert(findings)
      .values({
        auditId: audit1.id,
        details: "Üretim hattındaki ölçüm cihazlarının kalibrasyon kayıtları eksik. 3 adet dijital kumpas ve 2 adet mikrometre için son 6 ayın kalibrasyon sertifikaları bulunamadı. ISO 9001 madde 7.1.5.1 uygunsuzluğu.",
        status: "InProgress",
        riskType: "Yüksek",
        assignedToId: mehmet?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding1) {
      // Aksiyon: Progress notes örneği
      const [action1] = await db
        .insert(actions)
        .values({
          findingId: finding1.id,
          details: "Tüm ölçüm cihazlarının kalibrasyon durumunu tespit et ve eksik kalibrasyonları tamamla",
          status: "Assigned",
          assignedToId: mehmet?.id,
          managerId: ayse?.id,
          createdById: admin.id,
        })
        .returning();

      if (action1) {
        // Progress notes ekle
        await db.insert(actionProgress).values([
          {
            actionId: action1.id,
            note: "Tüm ölçüm cihazlarının envanteri çıkarıldı. Toplam 12 cihaz tespit edildi.",
            createdById: mehmet?.id,
            createdAt: new Date("2024-10-16T10:00:00"),
          },
          {
            actionId: action1.id,
            note: "Akredite kalibrasyon firması ile iletişime geçildi. Fiyat teklifi alındı.",
            createdById: mehmet?.id,
            createdAt: new Date("2024-10-17T14:30:00"),
          },
          {
            actionId: action1.id,
            note: "5 cihaz kalibrasyona gönderildi. Geri kalan 7 cihaz için randevu alındı.",
            createdById: mehmet?.id,
            createdAt: new Date("2024-10-18T09:15:00"),
          },
        ]);
      }
    }

    // Bulgu 2: Eğitim kayıtları
    const [finding2] = await db
      .insert(findings)
      .values({
        auditId: audit1.id,
        details: "İş güvenliği eğitim kayıtları güncel değil. Üretim departmanında çalışan 8 personelin İSG eğitim süresi 6 ay önce dolmuş durumda.",
        status: "Assigned",
        riskType: "Orta",
        assignedToId: ali?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding2) {
      await db.insert(actions).values({
        findingId: finding2.id,
        details: "İSG eğitimlerini yenile ve kayıt sistemini güncelle",
        status: "Assigned",
        assignedToId: ali?.id,
        managerId: ayse?.id,
        createdById: admin.id,
      });
    }

    // ===========================================
    // 2. ISO 27001 BİLGİ GÜVENLİĞİ DENETİMİ
    // ===========================================
    console.log("🔐 Creating ISO 27001 audit...");
    const [audit2] = await db
      .insert(audits)
      .values({
        title: "ISO 27001 Bilgi Güvenliği Denetimi",
        description: "Bilgi güvenliği yönetim sistemi denetimi. Erişim kontrolü, log yönetimi, parola politikaları ve güvenlik yamaları kontrolü.",
        auditDate: new Date("2024-10-22"),
        createdById: admin.id,
      })
      .returning();

    if (!audit2) throw new Error("Failed to create ISO 27001 audit");

    // Bulgu 3: Parola Politikası
    const [finding3] = await db
      .insert(findings)
      .values({
        auditId: audit2.id,
        details: "Kurumsal parola politikası uygulanmıyor. Test edilen 15 kullanıcının 8'inde zayıf parolalar (123456, password, 12345678 gibi) tespit edildi. Parola karmaşıklığı ve süre politikaları Active Directory'de aktif değil. ISO 27001 A.9.4.3 kontrolü sağlanmıyor.",
        status: "Assigned",
        riskType: "Kritik",
        assignedToId: can?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding3) {
      // DÖF oluştur - Kök neden analizi
      const [dof1] = await db
        .insert(dofs)
        .values({
          findingId: finding3.id,
          problemTitle: "Zayıf Parola Politikası ve Kullanıcı Farkındalığı Eksikliği",
          status: "Step3_RootCause",
          assignedToId: can?.id,
          managerId: ayse?.id,
          createdById: admin.id,
          
          // Step 1: Problem Detayları (5N1K)
          problemDetails: `Ne: Kurumsal sistemlerde zayıf parolalar kullanılıyor
Nerede: Active Directory, VPN erişimleri, kurumsal uygulamalar
Ne zaman: ISO 27001 denetiminde tespit edildi (22.10.2024)
Kim: IT Departmanı, Tüm kullanıcılar
Nasıl: AD parola politikaları pasif, kullanıcı eğitimi yapılmamış
Niçin: Kullanıcı şikayetleri nedeniyle politika devre dışı bırakılmış`,
          
          // Step 2: Geçici Önlemler
          tempMeasures: `1. Kritik sistemlerde (VPN, Admin) zorlu parola zorunluluğu aktif edildi
2. Tüm kullanıcılara parola değiştirme bildirimi gönderildi
3. Zayıf parolalar tespit edilen 8 kullanıcının parolaları manuel değiştirildi`,
          
          // Step 3: Kök Neden Analizi (5 Why)
          rootCauseAnalysis: `5 Why Analizi:

1. Zayıf parolalar neden kullanılıyor? 
   → Parola politikası aktif değil

2. Parola politikası neden aktif değil? 
   → Kullanıcılar zorlu parola istemedi

3. Kullanıcılar neden zorlu parola istemiyor? 
   → Karmaşık parolaları unutuyorlar

4. Parolaları neden unutuyorlar? 
   → Parola yöneticisi kullanımı öğretilmemiş

5. Neden öğretilmemiş? 
   → Bilgi güvenliği farkındalık eğitimi verilmemiş

KÖK NEDEN: Sistematik bilgi güvenliği eğitim programı eksikliği ve parola yönetimi araçlarının tanıtılmaması`,
        })
        .returning();

      if (dof1) {
        // DÖF'e bağlı Corrective/Preventive Actions
        await db.insert(actions).values([
          {
            dofId: dof1.id,
            type: "Corrective",
            details: "AD Parola Politikası Konfigürasyonu: Minimum 12 karakter, büyük/küçük harf, rakam ve özel karakter zorunluluğu aktif edilecek",
            status: "Assigned",
            assignedToId: can?.id,
            managerId: ayse?.id,
            createdById: admin.id,
          },
          {
            dofId: dof1.id,
            type: "Preventive",
            details: "Kurumsal Parola Yöneticisi tedariki ve tüm personele eğitim verilmesi",
            status: "Assigned",
            assignedToId: can?.id,
            managerId: ayse?.id,
            createdById: admin.id,
          },
        ]);

        // DÖF Activities
        await db.insert(dofActivities).values([
          {
            dofId: dof1.id,
            description: "AD Parola Politikası Konfigürasyonu: Minimum 12 karakter, büyük/küçük harf, rakam ve özel karakter zorunluluğu",
            type: "Düzeltici",
            responsibleId: can?.id,
            dueDate: new Date("2024-11-01"),
            isCompleted: false,
          },
          {
            dofId: dof1.id,
            description: "Kurumsal Parola Yöneticisi Tedariki: Bitwarden/1Password gibi kurumsal parola yöneticisi satın alınması ve tüm personele dağıtılması",
            type: "Önleyici",
            responsibleId: can?.id,
            dueDate: new Date("2024-11-15"),
            isCompleted: false,
          },
          {
            dofId: dof1.id,
            description: "Bilgi Güvenliği Farkındalık Eğitimi: Tüm personel için parola güvenliği eğitimi (online + yüz yüze sessions)",
            type: "Önleyici",
            responsibleId: burak?.id,
            dueDate: new Date("2024-12-01"),
            isCompleted: false,
          },
        ]);
      }
    }

    // Bulgu 4: Güvenlik Yamaları
    const [finding4] = await db
      .insert(findings)
      .values({
        auditId: audit2.id,
        details: "Sunucu ve istemci bilgisayarlarda kritik güvenlik yamaları eksik. Windows Server'larda son 3 ayın critical güvenlik yamaları yüklenmemiş. WSUS yapılandırması hatalı.",
        status: "New",
        riskType: "Kritik",
        assignedToId: ece?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding4) {
      await db.insert(actions).values({
        findingId: finding4.id,
        details: "WSUS yapılandırmasını düzelt ve tüm kritik yamaları uygula",
        status: "Assigned",
        assignedToId: ece?.id,
        managerId: can?.id,
        createdById: admin.id,
      });
    }

    // Bulgu 5: Log Yönetimi
    const [finding5] = await db
      .insert(findings)
      .values({
        auditId: audit2.id,
        details: "Erişim ve güvenlik logları düzenli olarak incelenmiyor. SIEM/Log toplama sistemi yok. Kritik sistemlerde (DC, File Server, Database) log retention policy tanımlı değil.",
        status: "Assigned",
        riskType: "Yüksek",
        assignedToId: burak?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding5) {
      await db.insert(actions).values({
        findingId: finding5.id,
        details: "Log toplama sistemi (ELK/Splunk) kurulumu ve log retention policy oluşturma",
        status: "Assigned",
        assignedToId: burak?.id,
        managerId: can?.id,
        createdById: admin.id,
      });
    }

    // ===========================================
    // 3. KVKK/GDPR UYUMLULUK DENETİMİ
    // ===========================================
    console.log("⚖️ Creating KVKK/GDPR audit...");
    const [audit3] = await db
      .insert(audits)
      .values({
        title: "KVKK Uyumluluk Denetimi",
        description: "Kişisel Verilerin Korunması Kanunu uyumluluk denetimi. Veri envanteri, aydınlatma metinleri, veri işleme süreçleri ve teknik tedbirler kontrolü.",
        auditDate: new Date("2024-10-25"),
        createdById: admin.id,
      })
      .returning();

    if (!audit3) throw new Error("Failed to create KVKK audit");

    // Bulgu 6: Veri Envanteri
    const [finding6] = await db
      .insert(findings)
      .values({
        auditId: audit3.id,
        details: "Kişisel veri envanteri (VERBİS) eksik ve güncel değil. Hangi sistemlerde hangi kişisel verilerin tutulduğu dokümante edilmemiş. Müşteri, çalışan ve tedarikçi verileri için detaylı envanter yok.",
        status: "Assigned",
        riskType: "Kritik",
        assignedToId: can?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding6) {
      await db.insert(actions).values({
        findingId: finding6.id,
        details: "Kişisel veri envanteri oluştur ve VERBİS'e bildirimi yap",
        status: "Assigned",
        assignedToId: can?.id,
        managerId: ayse?.id,
        createdById: admin.id,
      });
    }

    // Bulgu 7: Aydınlatma Metinleri
    const [finding7] = await db
      .insert(findings)
      .values({
        auditId: audit3.id,
        details: "Web sitesinde ve müşteri formlarında KVKK aydınlatma metinleri güncel değil. Açık rıza metinleri eksik. Çerez politikası yok.",
        status: "New",
        riskType: "Yüksek",
        createdById: admin.id,
      })
      .returning();

    // Bulgu 8: Veri Silme Prosedürü
    const [finding8] = await db
      .insert(findings)
      .values({
        auditId: audit3.id,
        details: "Kişisel veri silme/anonimleştirme prosedürü tanımlı değil. Hukuki saklama süreleri sonrası verilerin silinmesi için otomatik mekanizma yok.",
        status: "Assigned",
        riskType: "Yüksek",
        assignedToId: deniz?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding8) {
      await db.insert(actions).values({
        findingId: finding8.id,
        details: "Otomatik veri silme prosedürü ve script geliştir",
        status: "Assigned",
        assignedToId: deniz?.id,
        managerId: can?.id,
        createdById: admin.id,
      });
    }

    // ===========================================
    // 4. YAZILIM GELİŞTİRME SÜREÇLERİ DENETİMİ
    // ===========================================
    console.log("💻 Creating Software Development audit...");
    const [audit4] = await db
      .insert(audits)
      .values({
        title: "Yazılım Geliştirme Süreçleri Denetimi",
        description: "Yazılım geliştirme yaşam döngüsü (SDLC) denetimi. Code review, test coverage, CI/CD, version control ve güvenli kodlama pratikleri kontrolü.",
        auditDate: new Date("2024-10-28"),
        createdById: admin.id,
      })
      .returning();

    if (!audit4) throw new Error("Failed to create Software audit");

    // Bulgu 9: Code Review
    const [finding9] = await db
      .insert(findings)
      .values({
        auditId: audit4.id,
        details: "Kod inceleme (code review) süreci uygulanmıyor. Git commit history incelendiğinde, pull request'lerin review edilmeden merge edildiği tespit edildi. Code review checklist yok.",
        status: "Assigned",
        riskType: "Orta",
        assignedToId: deniz?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding9) {
      await db.insert(actions).values({
        findingId: finding9.id,
        details: "Code review süreci tanımla ve GitHub/GitLab'da branch protection kuralları aktifleştir",
        status: "Assigned",
        assignedToId: deniz?.id,
        managerId: can?.id,
        createdById: admin.id,
      });
    }

    // Bulgu 10: Test Coverage
    const [finding10] = await db
      .insert(findings)
      .values({
        auditId: audit4.id,
        details: "Unit test coverage kritik projelerde %30'un altında. Otomatik test yapısı yok. CI/CD pipeline'ında test stage'i eksik.",
        status: "New",
        riskType: "Orta",
        createdById: admin.id,
      })
      .returning();

    // Bulgu 11: Git Branch Stratejisi
    const [finding11] = await db
      .insert(findings)
      .values({
        auditId: audit4.id,
        details: "Git branch stratejisi (Git Flow/Trunk Based) tanımlı değil. Herkes doğrudan main branch'e push yapabiliyor. Release ve hotfix süreçleri dokümante edilmemiş.",
        status: "Assigned",
        riskType: "Düşük",
        assignedToId: deniz?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding11) {
      await db.insert(actions).values({
        findingId: finding11.id,
        details: "Git Flow stratejisi dokümante et ve branch protection rules uygula",
        status: "Assigned",
        assignedToId: deniz?.id,
        managerId: can?.id,
        createdById: admin.id,
      });
    }

    // ===========================================
    // 5. ISO 14001 ÇEVRE DENETİMİ
    // ===========================================
    console.log("🌍 Creating ISO 14001 audit...");
    const [audit5] = await db
      .insert(audits)
      .values({
        title: "ISO 14001 Çevre Yönetimi Denetimi",
        description: "Çevre yönetim sistemi denetimi. Atık yönetimi, enerji verimliliği, emisyon kontrolü ve çevresel riskler değerlendirmesi.",
        auditDate: new Date("2024-10-30"),
        createdById: admin.id,
      })
      .returning();

    if (!audit5) throw new Error("Failed to create ISO 14001 audit");

    // Bulgu 12: Tehlikeli Atık Yönetimi
    const [finding12] = await db
      .insert(findings)
      .values({
        auditId: audit5.id,
        details: "Tehlikeli atık geçici depolama alanında etiketleme eksikliği. 3 adet bidon içeriği belirtilmemiş, MSDS bilgileri eksik. Atık transfer formları düzenli tutulmuyor.",
        status: "InProgress",
        riskType: "Kritik",
        assignedToId: mehmet?.id,
        createdById: admin.id,
      })
      .returning();

    if (finding12) {
      await db.insert(actions).values({
        findingId: finding12.id,
        details: "Tüm tehlikeli atıkları etiketle ve MSDS dosyalarını düzenle",
        status: "Assigned",
        assignedToId: mehmet?.id,
        managerId: ayse?.id,
        createdById: admin.id,
      });
    }

    // ===========================================
    // 6. İSG (İŞ SAĞLIĞI VE GÜVENLİĞİ) DENETİMİ
    // ===========================================
    console.log("🦺 Creating İSG audit...");
    const [audit6] = await db
      .insert(audits)
      .values({
        title: "İş Sağlığı ve Güvenliği Denetimi",
        description: "İSG mevzuat uygunluk denetimi. Kişisel koruyucu donanım, risk değerlendirmesi, eğitimler ve acil durum planları kontrolü.",
        auditDate: new Date("2024-11-05"),
        createdById: admin.id,
      })
      .returning();

    if (!audit6) throw new Error("Failed to create İSG audit");

    // Bulgu 13: Risk Değerlendirmesi
    const [finding13] = await db
      .insert(findings)
      .values({
        auditId: audit6.id,
        details: "Risk değerlendirmesi 2 yıldır güncellenmemiş. Yeni ekipman ve süreçler için risk analizi yapılmamış. Yüksek riskli 12 alan için kontrol önlemleri eksik.",
        status: "New",
        riskType: "Yüksek",
        createdById: admin.id,
      })
      .returning();

    console.log("✅ Comprehensive audit seed completed!");
    console.log(`   Created 6 audits:`);
    console.log(`   - ISO 9001 (Üretim)`);
    console.log(`   - ISO 27001 (Bilgi Güvenliği) ⭐`);
    console.log(`   - KVKK/GDPR (Veri Koruma) ⭐`);
    console.log(`   - Software Development (IT) ⭐`);
    console.log(`   - ISO 14001 (Çevre)`);
    console.log(`   - İSG (İş Sağlığı)`);
    console.log(`   Created 13 findings`);
    console.log(`   Created 13+ actions (Simple, Corrective, Preventive)`);
    console.log(`   Created 1 DOF with root cause analysis + 2 DOF actions`);
    console.log(`   Created 3 action progress notes`);
    
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Export for use in index.ts
// No direct execution code needed
