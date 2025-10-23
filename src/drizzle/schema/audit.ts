// Audits (Denetimler) - Kurumsal Denetim Sistemi
import { pgTable, timestamp, text, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

// Denetim Statü Enum
export const auditStatusEnum = pgEnum("audit_status", [
  "Active",           // Aktif - Denetim devam ediyor
  "InReview",         // İncelemede - Denetçi tamamladı, bulgular işleniyor
  "PendingClosure",   // Kapanış Bekliyor - Bulgular tamamlandı, denetçi onayı bekliyor
  "Closed",           // Kapalı - Tamamen tamamlandı
  "Archived",         // Arşivlendi - Pasif/Arşiv
]);

export const audits = pgTable("audits", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  auditDate: timestamp("audit_date"),
  status: auditStatusEnum("status").default("Active").notNull(),
  auditorId: uuid("auditor_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }), // Denetçi
  createdById: uuid("created_by_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }), // Oluşturan
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete
});

export const auditsRelations = relations(audits, ({ one }) => ({
  auditor: one(user, {
    fields: [audits.auditorId],
    references: [user.id],
    relationName: 'audit_auditor',
  }),
  createdBy: one(user, {
    fields: [audits.createdById],
    references: [user.id],
    relationName: 'audit_creator',
  }),
}));

export type Audit = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;
