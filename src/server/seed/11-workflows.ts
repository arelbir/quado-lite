import { db } from '@/drizzle/db';
import { visualWorkflow } from '@/drizzle/schema';

export async function seedWorkflows() {
  console.log('🔄 SEEDING: Visual Workflows...');

  // Get admin user
  const adminUser = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, 'admin@example.com'),
  });

  if (!adminUser) {
    console.log('⚠️  Admin user not found, skipping workflows seed');
    return;
  }

  const workflows = [
    // 1. Simple Finding Workflow
    {
      name: 'Basit Bulgu İş Akışı',
      description: 'Bulgular için standart onay süreci',
      module: 'FINDING' as const,
      status: 'ACTIVE' as const,
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Bulgu Oluşturuldu' },
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 100, y: 200 },
          data: {
            label: 'Bulgu Değerlendirmesi',
            assignedRole: 'PROCESS_OWNER',
            deadlineHours: 24,
            notifications: {
              onAssign: true,
              beforeDeadline: 2,
              onOverdue: true,
            },
          },
        },
        {
          id: 'decision-1',
          type: 'decision',
          position: { x: 100, y: 320 },
          data: {
            label: 'Kritik mi?',
            condition: "severity === 'critical'",
          },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: 350, y: 320 },
          data: {
            label: 'Yönetim Onayı',
            approvalType: 'ALL',
            approvers: ['QUALITY_MANAGER', 'SUPER_ADMIN'],
          },
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 100, y: 460 },
          data: {
            label: 'Aksiyon Ataması',
            assignedRole: 'ACTION_OWNER',
            deadlineHours: 48,
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 100, y: 580 },
          data: { label: 'Bulgu Kapatıldı' },
        },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'process-1' },
        { id: 'e2', source: 'process-1', target: 'decision-1' },
        { id: 'e3', source: 'decision-1', sourceHandle: 'yes', target: 'approval-1' },
        { id: 'e4', source: 'decision-1', sourceHandle: 'no', target: 'process-2' },
        { id: 'e5', source: 'approval-1', sourceHandle: 'approved', target: 'process-2' },
        { id: 'e6', source: 'process-2', target: 'end-1' },
      ],
      version: '1.0',
      createdById: adminUser.id,
    },

    // 2. Action Approval Workflow
    {
      name: 'Aksiyon Onay İş Akışı',
      description: 'Düzeltici aksiyonlar için çoklu onay süreci',
      module: 'ACTION' as const,
      status: 'ACTIVE' as const,
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Aksiyon Atandı' },
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 100, y: 200 },
          data: {
            label: 'Aksiyonu Tamamla',
            assignedRole: 'ACTION_OWNER',
            deadlineHours: 168,
            notifications: {
              onAssign: true,
              beforeDeadline: 24,
              onOverdue: true,
            },
          },
        },
        {
          id: 'decision-1',
          type: 'decision',
          position: { x: 100, y: 320 },
          data: {
            label: 'Maliyet Kontrolü',
            condition: 'cost > 5000',
          },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: 350, y: 320 },
          data: {
            label: 'Finans Onayı',
            approvalType: 'ALL',
            approvers: ['SUPER_ADMIN'],
          },
        },
        {
          id: 'approval-2',
          type: 'approval',
          position: { x: 100, y: 460 },
          data: {
            label: 'Yönetici Onayı',
            approvalType: 'ANY',
            approvers: ['QUALITY_MANAGER'],
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 100, y: 580 },
          data: { label: 'Aksiyon Tamamlandı' },
        },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'process-1' },
        { id: 'e2', source: 'process-1', target: 'decision-1' },
        { id: 'e3', source: 'decision-1', sourceHandle: 'yes', target: 'approval-1' },
        { id: 'e4', source: 'decision-1', sourceHandle: 'no', target: 'approval-2' },
        { id: 'e5', source: 'approval-1', sourceHandle: 'approved', target: 'approval-2' },
        { id: 'e6', source: 'approval-2', sourceHandle: 'approved', target: 'end-1' },
      ],
      version: '1.0',
      createdById: adminUser.id,
    },

    // 3. DOF Workflow
    {
      name: 'DÖF İş Akışı',
      description: 'Düzeltici Önleyici Faaliyet süreci',
      module: 'DOF' as const,
      status: 'DRAFT' as const,
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'DÖF Açıldı' },
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 100, y: 200 },
          data: {
            label: 'Problem Tanımı (5N1K)',
            assignedRole: 'PROCESS_OWNER',
            deadlineHours: 48,
          },
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 100, y: 320 },
          data: {
            label: 'Kök Neden Analizi',
            assignedRole: 'QUALITY_MANAGER',
            deadlineHours: 72,
          },
        },
        {
          id: 'process-3',
          type: 'process',
          position: { x: 100, y: 440 },
          data: {
            label: 'Etkinlik Kontrolü',
            assignedRole: 'QUALITY_MANAGER',
            deadlineHours: 168,
          },
        },
        {
          id: 'decision-1',
          type: 'decision',
          position: { x: 100, y: 560 },
          data: {
            label: 'Etkin mi?',
            condition: "effectiveness === 'effective'",
          },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: 350, y: 560 },
          data: {
            label: 'Yönetici Onayı',
            approvalType: 'ANY',
            approvers: ['QUALITY_MANAGER'],
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 350, y: 680 },
          data: { label: 'DÖF Kapatıldı' },
        },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'process-1' },
        { id: 'e2', source: 'process-1', target: 'process-2' },
        { id: 'e3', source: 'process-2', target: 'process-3' },
        { id: 'e4', source: 'process-3', target: 'decision-1' },
        { id: 'e5', source: 'decision-1', sourceHandle: 'yes', target: 'approval-1' },
        { id: 'e6', source: 'decision-1', sourceHandle: 'no', target: 'process-2' },
        { id: 'e7', source: 'approval-1', sourceHandle: 'approved', target: 'end-1' },
      ],
      version: '1.0',
      createdById: adminUser.id,
    },

    // 4. Audit Workflow
    {
      name: 'Denetim İş Akışı',
      description: 'İç denetim süreci',
      module: 'AUDIT' as const,
      status: 'ACTIVE' as const,
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { label: 'Denetim Başladı' },
        },
        {
          id: 'process-1',
          type: 'process',
          position: { x: 100, y: 200 },
          data: {
            label: 'Denetim Gerçekleştirme',
            assignedRole: 'QUALITY_MANAGER',
            deadlineHours: 72,
          },
        },
        {
          id: 'process-2',
          type: 'process',
          position: { x: 100, y: 320 },
          data: {
            label: 'Rapor Hazırlama',
            assignedRole: 'QUALITY_MANAGER',
            deadlineHours: 24,
          },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: 100, y: 440 },
          data: {
            label: 'Yönetim Onayı',
            approvalType: 'ALL',
            approvers: ['SUPER_ADMIN', 'QUALITY_MANAGER'],
          },
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 100, y: 560 },
          data: { label: 'Denetim Tamamlandı' },
        },
      ],
      edges: [
        { id: 'e1', source: 'start-1', target: 'process-1' },
        { id: 'e2', source: 'process-1', target: 'process-2' },
        { id: 'e3', source: 'process-2', target: 'approval-1' },
        { id: 'e4', source: 'approval-1', sourceHandle: 'approved', target: 'end-1' },
      ],
      version: '1.0',
      createdById: adminUser.id,
    },
  ];

  try {
    for (const workflow of workflows) {
      await db.insert(visualWorkflow).values(workflow);
    }

    console.log(`  ✅ Seeded ${workflows.length} visual workflows`);
    console.log(`     - 2 ACTIVE (Finding, Action, Audit)`);
    console.log(`     - 1 DRAFT (DOF)`);
  } catch (error) {
    console.error('  ❌ Error seeding workflows:', error);
  }
}
