// Seed Data: Kurumsal Denetim Sistemi Test Verileri
import { db } from "@/drizzle/db";
import { audits, findings, actions, dofs, dofActivities, user } from "@/drizzle/schema";

export async function seedAuditData() {
  console.log("🌱 Seeding audit system data...");

  try {
    // Önce kullanıcıları bulalım (admin ve test user'lar)
    const users = await db.query.user.findMany({
      limit: 3,
    });

    if (users.length < 2) {
      console.error("❌ Not enough users. Please run seed:admin first");
      return;
    }

    const [admin, user1, user2] = users;
    
    if (!admin || !user1) {
      console.error("❌ Required users not found");
      return;
    }

    // 1. Denetim Oluştur
    console.log("📋 Creating audits...");
    const [audit1] = await db
      .insert(audits)
      .values({
        title: "ISO 9001 İç Denetimi - Üretim Bölümü",
        description: "2024 yılı 1. dönem ISO 9001 kalite yönetim sistemi iç denetimi",
        auditDate: new Date("2024-10-15"),
        createdById: admin.id,
      })
      .returning();

    const [audit2] = await db
      .insert(audits)
      .values({
        title: "ISO 14001 Çevre Denetimi",
        description: "Çevre yönetim sistemi denetimi - Atık yönetimi",
        auditDate: new Date("2024-10-20"),
        createdById: admin.id,
      })
      .returning();

    if (!audit1 || !audit2) {
      console.error("❌ Failed to create audits");
      return;
    }

    console.log(`   ✅ Created ${2} audits`);

    // 2. Bulgular Oluştur
    console.log("🔍 Creating findings...");
    const [finding1] = await db
      .insert(findings)
      .values({
        auditId: audit1.id,
        details: "Üretim hattında kalibrasyon kayıtları eksik. Son 3 ayın kalibrasyon sertifikaları bulunamadı.",
        status: "Assigned",
        riskType: "Yüksek",
        assignedToId: user1.id,
        createdById: admin.id,
      })
      .returning();

    const [finding2] = await db
      .insert(findings)
      .values({
        auditId: audit1.id,
        details: "İş güvenliği eğitim kayıtları güncel değil. 5 personelin eğitim süresi dolmuş.",
        status: "InProgress",
        riskType: "Orta",
        assignedToId: user1.id,
        createdById: admin.id,
      })
      .returning();

    const [finding3] = await db
      .insert(findings)
      .values({
        auditId: audit2.id,
        details: "Tehlikeli atık geçici depolama alanında etiketleme eksikliği tespit edildi.",
        status: "New",
        riskType: "Kritik",
        createdById: admin.id,
      })
      .returning();

    if (!finding1 || !finding2 || !finding3) {
      console.error("❌ Failed to create findings");
      return;
    }

    console.log(`   ✅ Created ${3} findings`);

    // 3. Basit Aksiyonlar Oluştur
    console.log("⚡ Creating actions...");
    const [action1] = await db
      .insert(actions)
      .values({
        findingId: finding2.id,
        details: "İSG eğitim programı oluşturulacak ve eksik eğitimler 15 gün içinde tamamlanacak",
        status: "Assigned",
        assignedToId: user2?.id || user1.id,
        managerId: user1.id,
        createdById: user1.id,
      })
      .returning();

    const [action2] = await db
      .insert(actions)
      .values({
        findingId: finding2.id,
        details: "Eğitim takip formu güncellenecek ve dijital sisteme aktarılacak",
        status: "PendingManagerApproval",
        assignedToId: user2?.id || user1.id,
        managerId: user1.id,
        completedAt: new Date(),
        createdById: user1.id,
      })
      .returning();

    if (!action1 || !action2) {
      console.error("❌ Failed to create actions");
      return;
    }

    console.log(`   ✅ Created ${2} actions`);

    // 4. DÖF Oluştur
    console.log("📑 Creating DOF...");
    const [dof1] = await db
      .insert(dofs)
      .values({
        findingId: finding1.id,
        problemTitle: "Kalibrasyon Takip Sisteminde Eksiklik",
        problemDetails: `
5N1K Analizi:
- NE: Kalibrasyon sertifikaları kayıp
- NEREDE: Üretim bölümü kalibrasyon dolapları
- NE ZAMAN: Son 3 ay içinde
- KİM: Bakım teknisyenleri sorumlu
- NASIL: Manuel kayıt sistemi kullanılıyor
- NİÇİN: Dijital takip sistemi yok
        `.trim(),
        tempMeasures: "Tüm cihazlar yeniden kalibre edildi ve geçici excel takip başlatıldı",
        rootCauseAnalysis: "Kök neden: Manuel kayıt sisteminin güvenilir olmaması ve personel değişimlerinde bilgi kaybı",
        status: "Step4_Activities",
        assignedToId: user1.id,
        managerId: admin.id,
        createdById: user1.id,
      })
      .returning();

    if (!dof1) {
      console.error("❌ Failed to create DOF");
      return;
    }

    // 5. DÖF Faaliyetleri Oluştur
    console.log("📝 Creating DOF activities...");
    await db.insert(dofActivities).values([
      {
        dofId: dof1.id,
        description: "Dijital kalibrasyon takip yazılımı satın alınacak",
        type: "Önleyici",
        dueDate: new Date("2024-11-30"),
        responsibleId: admin.id,
        isCompleted: false,
      },
      {
        dofId: dof1.id,
        description: "Tüm personele yeni sistem eğitimi verilecek",
        type: "Önleyici",
        dueDate: new Date("2024-12-15"),
        responsibleId: user1.id,
        isCompleted: false,
      },
      {
        dofId: dof1.id,
        description: "Eksik kalibrasyon kayıtları tamamlanacak",
        type: "Düzeltici",
        dueDate: new Date("2024-11-15"),
        responsibleId: user2?.id || user1.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    ]);

    console.log(`   ✅ Created ${3} DOF activities`);

    console.log("\n✅ Audit system seed completed!");
    console.log("\n📊 Summary:");
    console.log(`   - ${2} Audits`);
    console.log(`   - ${3} Findings`);
    console.log(`   - ${2} Actions`);
    console.log(`   - ${1} DOF`);
    console.log(`   - ${3} DOF Activities`);

    return { success: true };
  } catch (error) {
    console.error("❌ Error seeding audit data:", error);
    throw error;
  }
}

// Script olarak çalıştırılırsa (ESM uyumlu)
seedAuditData()
  .then(() => {
    console.log("✅ Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
