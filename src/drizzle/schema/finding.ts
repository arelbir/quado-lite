// Findings (Bulgular) - Kurumsal Denetim Sistemi
import { pgEnum, pgTable, timestamp, text, uuid } from "drizzle-orm/pg-core";
import { audits } from "./audit";
import { user } from "./user";
import { actions } from "./action";
import { dofs } from "./dof";
import { relations } from "drizzle-orm";

// Finding Status Enum
export const findingStatusEnum = pgEnum("finding_status", [
  "New",                    // Yeni oluşturuldu
  "Assigned",               // Süreç Sahibine atandı
  "InProgress",             // İşlem yapılıyor (Alt görevler oluşturuluyor/tamamlanıyor)
  "PendingAuditorClosure",  // Tüm alt görevler tamamlandı, Denetçi onayı bekliyor
  "Completed",              // Denetçi tarafından kapatıldı
  "Rejected"                // Denetçi tarafından reddedildi (yetersiz bulundu)
]);

export const findings = pgTable("findings", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  auditId: uuid("audit_id").references(() => audits.id, { onDelete: "cascade", onUpdate: "cascade" }),
  details: text("details").notNull(),
  status: findingStatusEnum("status").notNull().default("New"),
  riskType: text("risk_type"), // Örn: "Kritik", "Yüksek", "Orta", "Düşük"
  rejectionReason: text("rejection_reason"), // Denetçi tarafından reddedilme nedeni
  // Bu, ana Süreç Sahibidir (Bulguyu ilk alan kişi)
  assignedToId: uuid("assigned_to_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdById: uuid("created_by_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const findingsRelations = relations(findings, ({ one, many }) => ({
  audit: one(audits, {
    fields: [findings.auditId],
    references: [audits.id],
  }),
  assignedTo: one(user, {
    fields: [findings.assignedToId],
    references: [user.id],
    relationName: 'finding_assigned',
  }),
  createdBy: one(user, {
    fields: [findings.createdById],
    references: [user.id],
    relationName: 'finding_creator',
  }),
  // Many relations (bulguya bağlı aksiyonlar ve DÖF'ler)
  actions: many(actions), // Basit aksiyonlar (type: "Simple")
  dofs: many(dofs), // DÖF'ler (kompleks aksiyonlar)
}));

export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;
