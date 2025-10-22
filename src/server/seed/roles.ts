// Seed Data: Kurumsal Denetim Sistemi Rolleri
// NOT: Role tablosu user'a bağlı olduğu için direkt seed edilemiyor
// Roller userRole enum'ında tanımlı: admin, superAdmin, user
// Bu dosya şu an için devre dışı

export async function seedRoles() {
  console.log("🌱 Seeding roles...");
  console.log("⚠️  Role seed disabled - roles are managed via userRole enum in user table");
  
  // Roller artık user tablosunda userRole field'ı ile yönetiliyor
  // Enum değerleri: admin, superAdmin, user
  
  return { success: true };
}

// Script olarak çalıştırılırsa (ESM uyumlu)
seedRoles()
  .then(() => {
    console.log("✅ Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
