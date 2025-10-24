import { db } from "@/drizzle/db";
import { questionBanks, questions, auditTemplates } from "@/drizzle/schema";

export async function seedQuestionBanks(adminId?: string) {
  console.log("  📋 Creating question banks...");
  // AdminId available for future use

  try {
    const [kaliteBank, isgBank, cevreBank] = await db
      .insert(questionBanks)
      .values([
        {
          name: "ISO 9001 Kalite Yönetimi",
          description: "Kalite yönetim sistemi denetim soruları",
          category: "Kalite",
          isActive: true,
        },
        {
          name: "ISO 45001 İSG",
          description: "İş sağlığı ve güvenliği denetim soruları",
          category: "İSG",
          isActive: true,
        },
        {
          name: "ISO 14001 Çevre Yönetimi",
          description: "Çevre yönetim sistemi denetim soruları",
          category: "Çevre",
          isActive: true,
        },
      ])
      .returning();

    console.log(`   ✅ Created ${3} question banks`);

    // 2. Kalite Soruları
    await db.insert(questions).values([
      {
        bankId: kaliteBank!.id,
        questionText: "Kalite politikası belgelenmiş ve güncel mi?",
        questionType: "YesNo",
        helpText: "ISO 9001 Madde 5.2",
        isMandatory: true,
        orderIndex: "1",
      },
      {
        bankId: kaliteBank!.id,
        questionText: "Kalite hedefleri ölçülebilir mi?",
        questionType: "YesNo",
        helpText: "ISO 9001 Madde 6.2",
        isMandatory: true,
        orderIndex: "2",
      },
      {
        bankId: kaliteBank!.id,
        questionText: "Dokümantasyon kontrolü ne kadar etkili?",
        questionType: "Scale",
        helpText: "1 (Yetersiz) - 5 (Mükemmel) arası değerlendirin",
        isMandatory: true,
        orderIndex: "3",
      },
      {
        bankId: kaliteBank!.id,
        questionText: "Risk ve fırsatlar değerlendirildi mi?",
        questionType: "YesNo",
        helpText: "ISO 9001 Madde 6.1",
        isMandatory: true,
        orderIndex: "4",
      },
      {
        bankId: kaliteBank!.id,
        questionText: "İç denetim kayıtları tam ve güncel mi?",
        questionType: "YesNo",
        helpText: "ISO 9001 Madde 9.2",
        isMandatory: true,
        orderIndex: "5",
      },
    ]);

    // 3. İSG Soruları
    await db.insert(questions).values([
      {
        bankId: isgBank!.id,
        questionText: "İSG politikası çalışanlara duyurulmuş mu?",
        questionType: "YesNo",
        helpText: "ISO 45001 Madde 5.2",
        isMandatory: true,
        orderIndex: "1",
      },
      {
        bankId: isgBank!.id,
        questionText: "Risk değerlendirmesi güncel mi?",
        questionType: "YesNo",
        helpText: "İş sağlığı ve güvenliği risk değerlendirmesi",
        isMandatory: true,
        orderIndex: "2",
      },
      {
        bankId: isgBank!.id,
        questionText: "İlk yardım malzemeleri yeterli mi?",
        questionType: "YesNo",
        isMandatory: true,
        orderIndex: "3",
      },
      {
        bankId: isgBank!.id,
        questionText: "Acil durum tatbikatları ne sıklıkla yapılıyor?",
        questionType: "Checklist",
        checklistOptions: JSON.stringify([
          "Yılda 2 kez",
          "Yılda 1 kez",
          "İki yılda 1 kez",
          "Hiç yapılmıyor",
        ]),
        isMandatory: true,
        orderIndex: "4",
      },
      {
        bankId: isgBank!.id,
        questionText: "Kişisel koruyucu donanım kontrolü yapılıyor mu?",
        questionType: "YesNo",
        isMandatory: true,
        orderIndex: "5",
      },
    ]);

    // 4. Çevre Soruları
    await db.insert(questions).values([
      {
        bankId: cevreBank!.id,
        questionText: "Atık yönetim planı mevcut mu?",
        questionType: "YesNo",
        helpText: "ISO 14001 Madde 8.1",
        isMandatory: true,
        orderIndex: "1",
      },
      {
        bankId: cevreBank!.id,
        questionText: "Tehlikeli atıklar ayrı depolanıyor mu?",
        questionType: "YesNo",
        isMandatory: true,
        orderIndex: "2",
      },
      {
        bankId: cevreBank!.id,
        questionText: "Çevre hedefleri ne kadar gerçekçi?",
        questionType: "Scale",
        helpText: "1 (Gerçekçi değil) - 5 (Çok gerçekçi)",
        isMandatory: true,
        orderIndex: "3",
      },
      {
        bankId: cevreBank!.id,
        questionText: "Çevre izinleri ve ruhsatlar geçerli mi?",
        questionType: "YesNo",
        isMandatory: true,
        orderIndex: "4",
      },
      {
        bankId: cevreBank!.id,
        questionText: "Atık bertaraf yöntemi nedir?",
        questionType: "SingleChoice",
        checklistOptions: JSON.stringify([
          "Geri dönüşüm",
          "Yakma",
          "Düzenli depolama",
          "Kompost",
          "Tehlikeli atık tesisi",
        ]),
        helpText: "Tek seçenek işaretleyiniz",
        isMandatory: true,
        orderIndex: "5",
      },
    ]);

    console.log("   ✅ Created 15 questions (5 Kalite + 5 İSG + 5 Çevre)");

    // 5. Denetim Şablonları
    console.log("📑 Creating audit templates...");
    await db.insert(auditTemplates).values([
      {
        name: "Hızlı İSG Denetimi",
        description: "Kısa süreli iş sağlığı ve güvenliği denetimi",
        category: "İSG",
        questionBankIds: JSON.stringify([isgBank!.id]),
        estimatedDurationMinutes: "60",
      },
      {
        name: "Kapsamlı Kalite Denetimi",
        description: "ISO 9001 tam denetim şablonu",
        category: "Kalite",
        questionBankIds: JSON.stringify([kaliteBank!.id]),
        estimatedDurationMinutes: "120",
      },
      {
        name: "Entegre Sistem Denetimi",
        description: "Kalite + İSG + Çevre kombine denetim",
        category: "Kalite",
        questionBankIds: JSON.stringify([
          kaliteBank!.id,
          isgBank!.id,
          cevreBank!.id,
        ]),
        estimatedDurationMinutes: "180",
      },
    ]);

    console.log("   ✅ Created 3 audit templates");

    console.log("✅ Question bank seed completed!");
    console.log("   - 3 Question Banks");
    console.log("   - 15 Questions (YesNo, Scale, SingleChoice, Checklist)");
    console.log("   - 3 Audit Templates");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}
