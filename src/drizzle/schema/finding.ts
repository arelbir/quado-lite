// Findings (Bulgular) - Kurumsal Denetim Sistemi
import { pgTable, timestamp, text, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import { audits } from "./audit";

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
  // Bu, ana Süreç Sahibidir (Bulguyu ilk alan kişi)
  assignedToId: uuid("assigned_to_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdById: uuid("created_by_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const findingsRelations = relations(findings, ({ one }) => ({
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
}));

export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;
