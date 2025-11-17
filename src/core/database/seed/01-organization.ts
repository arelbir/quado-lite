/**
 * ORGANIZATION SEED
 * Companies, Branches, Departments, Positions
 * 150-person company structure
 */

import { db } from "@/core/database/client";
import { companies, branches, departments, positions } from "@/core/database/schema/organization";

export async function seedOrganization(adminId: string) {
  console.log("\n📦 SEEDING: Organization...");

  // 1. COMPANY
  const [company] = await db.insert(companies).values({
    name: "ABC Teknoloji A.Ş.",
    code: "ABC",
    legalName: "ABC Teknoloji Anonim Şirketi",
    taxNumber: "1234567890",
    country: "Türkiye",
    city: "Ankara",
    address: "Ankara Teknokent",
    phone: "+90 312 123 4567",
    email: "info@abcteknoloji.com.tr",
    website: "https://www.abcteknoloji.com.tr",
    isActive: true,
    createdById: adminId,
  }).returning().onConflictDoNothing();

  if (!company) {
    const existing = await db.query.companies.findFirst();
    console.log("  ⏭️  Company exists");
    return { companyId: existing!.id };
  }

  console.log("  ✅ Company created");

  // 2. BRANCHES (5 şube - 150 kişiye yetecek)
  const branchData = await db.insert(branches).values([
    {
      companyId: company.id,
      name: "Ankara Merkez",
      code: "ANK-HQ",
      type: "Headquarters",
      country: "Türkiye",
      city: "Ankara",
      address: "Teknokent Cyberpark",
      phone: "+90 312 123 4567",
      isActive: true,
      createdById: adminId,
    },
    {
      companyId: company.id,
      name: "İstanbul Şube",
      code: "IST",
      type: "Branch",
      country: "Türkiye",
      city: "İstanbul",
      address: "Maslak Teknopark",
      phone: "+90 212 234 5678",
      isActive: true,
      createdById: adminId,
    },
    {
      companyId: company.id,
      name: "İzmir Şube",
      code: "IZM",
      type: "Branch",
      country: "Türkiye",
      city: "İzmir",
      address: "Alsancak",
      phone: "+90 232 345 6789",
      isActive: true,
      createdById: adminId,
    },
    {
      companyId: company.id,
      name: "Bursa Fabrika",
      code: "BRS",
      type: "Factory",
      country: "Türkiye",
      city: "Bursa",
      address: "OSB Organize Sanayi",
      phone: "+90 224 456 7890",
      isActive: true,
      createdById: adminId,
    },
    {
      companyId: company.id,
      name: "Antalya Satış Ofisi",
      code: "ANT",
      type: "Sales Office",
      country: "Türkiye",
      city: "Antalya",
      address: "Konyaaltı",
      phone: "+90 242 567 8901",
      isActive: true,
      createdById: adminId,
    },
  ]).returning().onConflictDoNothing();

  console.log(`  ✅ Created ${branchData.length} branches`);

  // Branch IDs for department assignment
  const ankaraBranch = branchData[0];
  const istanbulBranch = branchData[1];
  const izmirBranch = branchData[2];
  const bursaBranch = branchData[3];
  const antalyaBranch = branchData[4];

  // 3. DEPARTMENTS (12 departman - branch'lere dağıtılmış)
  const deptData = await db.insert(departments).values([
    // Ankara HQ - Executive & Corporate functions
    { 
      branchId: ankaraBranch?.id,
      name: "Genel Müdürlük", 
      code: "CEO", 
      description: "Üst yönetim",
      costCenter: "CC-100",
      isActive: true,
      createdById: adminId,
    },
    { 
      branchId: ankaraBranch?.id,
      name: "Kalite Yönetimi", 
      code: "QUALITY", 
      description: "Kalite güvence ve denetim",
      costCenter: "CC-200",
      isActive: true,
      createdById: adminId,
    },
    { 
      branchId: ankaraBranch?.id,
      name: "İnsan Kaynakları", 
      code: "HR", 
      description: "İK ve bordro",
      costCenter: "CC-300",
      isActive: true,
      createdById: adminId,
    },
    { 
      branchId: ankaraBranch?.id,
      name: "Finans ve Muhasebe", 
      code: "FINANCE", 
      description: "Finans ve bütçe",
      costCenter: "CC-400",
      isActive: true,
      createdById: adminId,
    },
    { 
      branchId: ankaraBranch?.id,
      name: "Hukuk", 
      code: "LEGAL", 
      description: "Hukuk işleri",
      costCenter: "CC-500",
      isActive: true,
      createdById: adminId,
    },
    
    // İstanbul - Technology & Innovation
    { 
      branchId: istanbulBranch?.id,
      name: "Bilgi Teknolojileri", 
      code: "IT", 
      description: "IT altyapı ve yazılım",
      costCenter: "CC-600",
      isActive: true,
      createdById: adminId,
    },
    { 
      branchId: istanbulBranch?.id,
      name: "AR-GE", 
      code: "RND", 
      description: "Araştırma geliştirme",
      costCenter: "CC-700",
      isActive: true,
      createdById: adminId,
    },
    
    // İzmir - Sales & Admin
    { 
      branchId: izmirBranch?.id,
      name: "Satış ve Pazarlama", 
      code: "SALES", 
      description: "Satış ve müşteri ilişkileri",
      costCenter: "CC-800",
      isActive: true,
      createdById: adminId,
    },
    { 
      branchId: izmirBranch?.id,
      name: "İdari İşler", 
      code: "ADMIN", 
      description: "İdari destek",
      costCenter: "CC-900",
      isActive: true,
      createdById: adminId,
    },
    
    // Bursa Factory - Production
    { 
      branchId: bursaBranch?.id,
      name: "Üretim", 
      code: "PRODUCTION", 
      description: "Üretim operasyonları",
      costCenter: "CC-1000",
      isActive: true,
      createdById: adminId,
    },
    { 
      branchId: bursaBranch?.id,
      name: "Bakım Onarım", 
      code: "MAINTENANCE", 
      description: "Teknik bakım",
      costCenter: "CC-1100",
      isActive: true,
      createdById: adminId,
    },
    
    // Antalya Sales Office - Supply Chain
    { 
      branchId: antalyaBranch?.id,
      name: "Tedarik Zinciri", 
      code: "SUPPLY", 
      description: "Satın alma ve lojistik",
      costCenter: "CC-1200",
      isActive: true,
      createdById: adminId,
    },
  ]).returning().onConflictDoNothing();

  console.log(`  ✅ Created ${deptData.length} departments`);

  // 4. POSITIONS (15 pozisyon - hiyerarşik)
  const posData = await db.insert(positions).values([
    // C-Level
    { 
      name: "Genel Müdür", 
      code: "CEO", 
      description: "Şirket genel müdürü - En üst yönetim",
      level: "10", 
      category: "Executive",
      salaryGrade: "E-10",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Genel Müdür Yardımcısı", 
      code: "VP", 
      description: "Genel müdür yardımcısı - Üst yönetim",
      level: "9", 
      category: "Executive",
      salaryGrade: "E-9",
      isActive: true,
      createdById: adminId,
    },
    
    // Management
    { 
      name: "Müdür", 
      code: "DIRECTOR", 
      description: "Bölüm/birim müdürü",
      level: "8", 
      category: "Management",
      salaryGrade: "M-8",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Departman Müdürü", 
      code: "MANAGER", 
      description: "Departman yöneticisi",
      level: "7", 
      category: "Management",
      salaryGrade: "M-7",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Şef", 
      code: "SUPERVISOR", 
      description: "Ekip şefi/süpervizör",
      level: "6", 
      category: "Management",
      salaryGrade: "M-6",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Ekip Lideri", 
      code: "TEAM_LEAD", 
      description: "Takım lideri",
      level: "5", 
      category: "Management",
      salaryGrade: "M-5",
      isActive: true,
      createdById: adminId,
    },
    
    // Professional
    { 
      name: "Kıdemli Uzman", 
      code: "SR_SPECIALIST", 
      description: "Kıdemli uzman/danışman",
      level: "6", 
      category: "Professional",
      salaryGrade: "P-6",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Uzman", 
      code: "SPECIALIST", 
      description: "Uzman/specialist",
      level: "5", 
      category: "Professional",
      salaryGrade: "P-5",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Uzman Yardımcısı", 
      code: "JR_SPECIALIST", 
      description: "Genç uzman/junior specialist",
      level: "4", 
      category: "Professional",
      salaryGrade: "P-4",
      isActive: true,
      createdById: adminId,
    },
    
    // Technical
    { 
      name: "Kıdemli Mühendis", 
      code: "SR_ENGINEER", 
      description: "Kıdemli mühendis",
      level: "6", 
      category: "Technical",
      salaryGrade: "T-6",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Mühendis", 
      code: "ENGINEER", 
      description: "Mühendis",
      level: "5", 
      category: "Technical",
      salaryGrade: "T-5",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Teknisyen", 
      code: "TECHNICIAN", 
      description: "Teknisyen/teknik eleman",
      level: "4", 
      category: "Technical",
      salaryGrade: "T-4",
      isActive: true,
      createdById: adminId,
    },
    
    // Operational
    { 
      name: "Vardiya Şefi", 
      code: "SHIFT_LEAD", 
      description: "Vardiya yöneticisi",
      level: "4", 
      category: "Operational",
      salaryGrade: "O-4",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "Operatör", 
      code: "OPERATOR", 
      description: "Üretim operatörü",
      level: "3", 
      category: "Operational",
      salaryGrade: "O-3",
      isActive: true,
      createdById: adminId,
    },
    { 
      name: "İdari Personel", 
      code: "STAFF", 
      description: "İdari destek personeli",
      level: "3", 
      category: "Administrative",
      salaryGrade: "A-3",
      isActive: true,
      createdById: adminId,
    },
  ]).returning().onConflictDoNothing();

  console.log(`  ✅ Created ${posData.length} positions`);

  return { companyId: company.id };
}
