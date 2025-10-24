/**
 * SAMPLE DATA SEED - Schema Uyumlu
 * Modüler ve anlamlı bölümlendirilmiş sample data
 * 
 * İçerik:
 * - 5 Audit (çeşitli statülerde)
 * - 8 Finding (farklı risk seviyeleri)
 * - 12 Action (Simple, Corrective, Preventive)
 * - 3 DOF (8-adım CAPA süreci)
 */

import { db } from "@/drizzle/db";
import { audits, findings, actions, dofs } from "@/drizzle/schema";

// Helper: Get random date within last N days
const getRandomDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

export async function seedSampleData(adminId?: string) {
  console.log("\n📊 SEEDING: Sample Data...");
  // AdminId available for future use

  // Get references (type-safe)
  const users = await db.query.user.findMany({ limit: 15 });
  
  if (users.length < 8) {
    console.log("  ⚠️  Not enough users (need at least 8), skipping sample data");
    return;
  }

  // Non-null assertion - already checked users.length >= 5
  const auditor = users[0]!;
  const manager1 = users[1]!;
  const manager2 = users[2]!;
  const staff1 = users[3]!;
  const staff2 = users[4]!;
  const staff3 = users[5]!;
  const staff4 = users[6]!;
  const staff5 = users[7]!;

  try {
    // ============================================
    // 1. AUDITS (5 audits)
    // ============================================
    console.log("  📋 Creating audits...");
    
    const auditsList = await db.insert(audits).values([
      {
        title: "ISO 9001:2015 Kalite Yönetim Sistemi Denetimi",
        description: "Yıllık rutin kalite denetimi - Tüm kalite süreçleri",
        auditDate: getRandomDate(60), // Son 60 gün içinde
        status: "Closed" as const,
        auditorId: auditor.id,
        createdById: auditor.id,
      },
      {
        title: "ISO 27001 Bilgi Güvenliği Denetimi",
        description: "IT sistemleri ve veri güvenliği kontrolü",
        auditDate: getRandomDate(30), // Son 30 gün içinde
        status: "Active" as const,
        auditorId: auditor.id,
        createdById: auditor.id,
      },
      {
        title: "Üretim Süreç Denetimi",
        description: "Üretim hattı ve kalite kontrol noktaları",
        auditDate: getRandomDate(90), // Son 90 gün içinde
        status: "Closed" as const,
        auditorId: auditor.id,
        createdById: auditor.id,
      },
      {
        title: "İSG Risk Değerlendirmesi",
        description: "İş sağlığı ve güvenliği risk analizi",
        auditDate: getRandomDate(120), // Son 120 gün içinde
        status: "Closed" as const,
        auditorId: auditor.id,
        createdById: auditor.id,
      },
      {
        title: "Tedarik Zinciri Denetimi",
        description: "Tedarikçi performans değerlendirmesi",
        auditDate: getRandomDate(45), // Son 45 gün içinde
        status: "Active" as const,
        auditorId: auditor.id,
        createdById: auditor.id,
      },
    ]).returning();

    console.log(`    ✅ Created ${auditsList.length} audits`);

    // ============================================
    // 2. FINDINGS (8 findings)
    // ============================================
    console.log("  🔍 Creating findings...");
    
    const findingsList = await db.insert(findings).values([
      {
        auditId: auditsList[0]!.id,
        details: "Kalibrasyon kayıtları eksik - Ölçüm cihazlarının kalibrasyon sertifikaları bulunamadı",
        riskType: "Orta",
        status: "Completed",
        assignedToId: manager1.id,
        createdById: auditor.id,
      },
      {
        auditId: auditsList[0]!.id,
        details: "Doküman revizyon tarihleri güncel değil - 5 adet prosedür revizyonu gecikmiş",
        riskType: "Düşük",
        status: "InProgress" as const,
        assignedToId: manager1.id,
        createdById: auditor.id,
      },
      {
        auditId: auditsList[1]!.id,
        details: "Yedekleme prosedürü uygulanmıyor - Son 2 aydır yedekleme logları kaydedilmemiş",
        riskType: "Yüksek",
        status: "InProgress" as const,
        assignedToId: manager2.id,
        createdById: auditor.id,
      },
      {
        auditId: auditsList[1]!.id,
        details: "Erişim logları saklanmıyor - Kullanıcı erişim logları 7 günden fazla tutulmuyor",
        riskType: "Yüksek",
        status: "Assigned" as const,
        assignedToId: manager2.id,
        createdById: auditor.id,
      },
      {
        auditId: auditsList[2]!.id,
        details: "Üretim hattında 5S uygulaması eksik - İş istasyonları düzensiz",
        riskType: "Orta",
        status: "Completed" as const,
        assignedToId: staff1.id,
        createdById: auditor.id,
      },
      {
        auditId: auditsList[2]!.id,
        details: "Ölçüm aletleri kalibre edilmemiş - 3 adet mikrometre kalibrasyonu geçmiş",
        riskType: "Yüksek",
        status: "InProgress" as const,
        assignedToId: staff1.id,
        createdById: auditor.id,
      },
      {
        auditId: auditsList[3]!.id,
        details: "Kişisel koruyucu ekipman kullanımı düşük - Atölye çalışanlarının %40'ı KKE kullanmıyor",
        riskType: "Kritik",
        status: "InProgress" as const,
        assignedToId: staff2.id,
        createdById: auditor.id,
      },
      {
        auditId: auditsList[4]!.id,
        details: "Tedarikçi değerlendirme formu eksik - 4 tedarikçinin yıllık değerlendirmesi yapılmamış",
        riskType: "Orta",
        status: "Assigned" as const,
        assignedToId: staff3.id,
        createdById: auditor.id,
      },
    ]).returning();

    console.log(`    ✅ Created ${findingsList.length} findings`);

    // ============================================
    // 3. ACTIONS (12 actions - 3 types)
    // ============================================
    console.log("  ⚡ Creating actions...");
    
    const actionsList = await db.insert(actions).values([
      // Simple Actions (Basit aksiyonlar - direkt bulguya bağlı)
      {
        findingId: findingsList[0]!.id,
        type: "Simple",
        details: "Tüm ölçüm cihazlarının kalibrasyon sertifikaları toplanacak ve arşivlenecek",
        status: "Completed",
        assignedToId: staff1.id,
        managerId: manager1.id,
        createdById: auditor.id,
        completionNotes: "15 adet cihazın sertifikası tamamlandı ve QMS sistemine yüklendi",
        completedAt: getRandomDate(50),
      },
      {
        findingId: findingsList[1]!.id,
        type: "Simple",
        details: "Gecikmiş prosedürlerin revizyonları güncellenecek",
        status: "PendingManagerApproval",
        assignedToId: staff2.id,
        managerId: manager1.id,
        createdById: auditor.id,
        completionNotes: "5 prosedür güncellenip onaya sunuldu",
      },
      {
        findingId: findingsList[3]!.id,
        type: "Simple",
        details: "Erişim log saklama süresini 90 güne çıkar",
        status: "Assigned",
        assignedToId: staff3.id,
        managerId: manager2.id,
        createdById: auditor.id,
      },
      {
        findingId: findingsList[4]!.id,
        type: "Simple",
        details: "5S eğitimi planla ve uygula",
        status: "Completed",
        assignedToId: staff4.id,
        managerId: manager1.id,
        createdById: auditor.id,
        completionNotes: "Tüm üretim ekibine 5S eğitimi verildi, kontrol listeleri oluşturuldu",
        completedAt: getRandomDate(45),
      },
      {
        findingId: findingsList[7]!.id,
        type: "Simple",
        details: "Tedarikçi değerlendirme formlarını tamamla",
        status: "Assigned",
        assignedToId: staff5.id,
        managerId: manager2.id,
        createdById: auditor.id,
      },

      // Corrective Actions (Düzeltici - DÖF'e bağlı olacak)
      {
        type: "Corrective",
        details: "Yedekleme prosedürünü yeniden aktive et ve test et",
        status: "PendingManagerApproval",
        assignedToId: staff2.id,
        managerId: manager2.id,
        createdById: auditor.id,
        completionNotes: "Otomatik yedekleme sistemi kuruldu ve 7 gün test edildi",
      },
      {
        type: "Corrective",
        details: "Kalibrasyonu geçmiş mikrometreleri servise gönder",
        status: "Completed",
        assignedToId: staff1.id,
        managerId: manager1.id,
        createdById: auditor.id,
        completionNotes: "3 mikrometre kalibre edildi, yeni sertifikalar alındı",
        completedAt: getRandomDate(55),
      },
      {
        type: "Corrective",
        details: "Tüm çalışanlara KKE dağıt ve kullanım zorunluluğu hatırlat",
        status: "Completed",
        assignedToId: staff2.id,
        managerId: manager1.id,
        createdById: auditor.id,
        completionNotes: "50 adet tam set KKE tedarik edildi ve dağıtıldı",
        completedAt: getRandomDate(100),
      },

      // Preventive Actions (Önleyici - DÖF'e bağlı olacak)
      {
        type: "Preventive",
        details: "Aylık kalibrasyon takip sistemi kur",
        status: "Assigned",
        assignedToId: staff1.id,
        managerId: manager1.id,
        createdById: auditor.id,
      },
      {
        type: "Preventive",
        details: "Otomatik yedekleme izleme dashboard'u oluştur",
        status: "Assigned",
        assignedToId: staff3.id,
        managerId: manager2.id,
        createdById: auditor.id,
      },
      {
        type: "Preventive",
        details: "Aylık KKE kontrol turu planı oluştur",
        status: "PendingManagerApproval",
        assignedToId: staff4.id,
        managerId: manager1.id,
        createdById: auditor.id,
        completionNotes: "Kontrol turu planı ve checklist hazırlandı",
      },
      {
        type: "Preventive",
        details: "Tedarikçi değerlendirme otomasyonu kur",
        status: "Assigned",
        assignedToId: staff5.id,
        managerId: manager2.id,
        createdById: auditor.id,
      },
    ]).returning();

    console.log(`    ✅ Created ${actionsList.length} actions`);

    // ============================================
    // 4. DOFs (3 DOFs - 8-adım CAPA)
    // ============================================
    console.log("  📝 Creating DOFs...");
    
    const dofsList = await db.insert(dofs).values([
      {
        findingId: findingsList[2]!.id,
        problemTitle: "Yedekleme Prosedürü Uygulanmıyor",
        problemDetails: "Ne: Yedekleme yapılmıyor, Nerede: Sunucu odası, Ne zaman: Son 2 ay, Kim: IT ekibi, Nasıl: Manuel süreç unutuluyor, Niçin: Otomasyon eksik",
        tempMeasures: "Günlük manuel yedekleme kontrolü başlatıldı",
        rootCauseAnalysis: "Kök neden: Otomatik yedekleme sistemi devre dışı kalmış ve alarm sistemi yok",
        status: "PendingManagerApproval",
        assignedToId: staff2.id,
        managerId: manager2.id,
        createdById: auditor.id,
      },
      {
        findingId: findingsList[5]!.id,
        problemTitle: "Ölçüm Aletleri Kalibre Edilmemiş",
        problemDetails: "Ne: Kalibrasyon süresi geçmiş, Nerede: Üretim hattı, Ne zaman: Son 3 ay, Kim: Kalite kontrol, Nasıl: Takip sistemi yok, Niçin: Planlama eksikliği",
        tempMeasures: "Kalibrasyonu geçmiş aletler kullanım dışı bırakıldı",
        rootCauseAnalysis: "Kök neden: Kalibrasyon takip sistemi manuel ve hataya açık",
        effectivenessCheck: "Aylık kalibrasyon takip sistemi kuruldu, 3 ay boyunca hiç gecikme olmadı",
        effectivenessCheckDate: getRandomDate(30),
        status: "Completed",
        assignedToId: staff1.id,
        managerId: manager1.id,
        createdById: auditor.id,
        completedAt: getRandomDate(25),
      },
      {
        findingId: findingsList[6]!.id,
        problemTitle: "KKE Kullanımı Düşük",
        problemDetails: "Ne: KKE kullanımı %40, Nerede: Tüm atölyeler, Ne zaman: Sürekli, Kim: Üretim çalışanları, Nasıl: Yeterli ekipman yok, Niçin: Bütçe ve farkındalık eksik",
        tempMeasures: "Acil KKE tedariki yapıldı, günlük kontroller başlatıldı",
        rootCauseAnalysis: "Kök neden: KKE stok yönetimi yok, çalışan bilinçlendirmesi eksik",
        status: "Step5_Implementation",
        assignedToId: staff2.id,
        managerId: manager1.id,
        createdById: auditor.id,
      },
    ]).returning();

    console.log(`    ✅ Created ${dofsList.length} DOFs`);

    // Summary
    console.log("\n  📊 SAMPLE DATA SUMMARY:");
    console.log(`    - Audits: ${auditsList.length}`);
    console.log(`    - Findings: ${findingsList.length}`);
    console.log(`    - Actions: ${actionsList.length} (Simple: 5, Corrective: 3, Preventive: 4)`);
    console.log(`    - DOFs: ${dofsList.length}`);

  } catch (error) {
    console.error("  ❌ Error creating sample data:", error);
    throw error;
  }
}
