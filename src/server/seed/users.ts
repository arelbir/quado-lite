import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Gerçekçi Türk Kullanıcılar
 * 12 kullanıcı - Departman bazlı organizasyon
 */
const turkishUsers = [
  // Üretim Departmanı
  {
    name: 'Mehmet Kaya',
    email: 'mehmet.kaya@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Ali Arslan',
    email: 'ali.arslan@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Hasan Şahin',
    email: 'hasan.sahin@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  
  // Kalite Departmanı
  {
    name: 'Ayşe Demir',
    email: 'ayse.demir@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Fatma Öz',
    email: 'fatma.oz@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Selin Aksoy',
    email: 'selin.aksoy@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  
  // IT/Bilgi İşlem Departmanı
  {
    name: 'Can Yılmaz',
    email: 'can.yilmaz@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Deniz Öztürk',
    email: 'deniz.ozturk@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Ece Kılıç',
    email: 'ece.kilic@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Burak Acar',
    email: 'burak.acar@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  
  // Destek Departmanları
  {
    name: 'Zeynep Çelik',
    email: 'zeynep.celik@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
  {
    name: 'Elif Yıldız',
    email: 'elif.yildiz@example.com',
    password: 'Password123!',
    emailVerified: new Date(),
  },
];

const runCreateUsers = async () => {
  console.log('⏳ Creating 12 Turkish users...');

  const start = Date.now();

  await db.transaction(async (tx) => {
    const admin = await tx.query.user.findFirst({
      columns: {
        id: true
      },
      where: eq(user.email, 'admin@example.com')
    })

    if (!admin) {
      console.error('❌ Admin not found. Run seed:admin first');
      return;
    }
    
    const usersWithCreator = turkishUsers.map((u) => ({
      ...u,
      createdById: admin.id
    }));
    
    await tx.insert(user).values(usersWithCreator).execute();
  })

  const end = Date.now();

  console.log(`✅ Seed completed in ${end - start}ms`);
  console.log(`   Created ${turkishUsers.length} Turkish users`);

  process.exit(0);
}

runCreateUsers().catch((err) => {
  console.error('❌ Seed runCreateUsers failed');
  console.error(err);
  process.exit(1);
});