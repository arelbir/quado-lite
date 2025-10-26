// Actions (Basit Aksiyonlar + DÖF Alt Aksiyonları) - Kurumsal Denetim Sistemi
// Hibrit Yaklaşım: DRY prensibiyle tek action modülü hem basit hem DÖF aksiyonları için
import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { findings } from "./finding";
import { dofs } from "./dof";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { actionProgress } from "./action-progress";

// Action Status Enum (UPDATED: Workflow integration - removed approval statuses)
export const actionStatusEnum = pgEnum("action_status", [
  "Assigned",              // Sorumluya atandı (Initial state)
  "InProgress",            // Üzerinde çalışılıyor (NEW: Added for workflow)
  "Completed",             // Workflow onaylandı, kapandı (Final state)
  "Cancelled"              // İptal edildi, döngüden çıkış (Exit state)
]);

// Action Type Enum (YENİ: Hibrit yaklaşım için)
export const actionTypeEnum = pgEnum("action_type", [
  "Simple",      // Basit aksiyon (direkt bulguya bağlı)
  "Corrective",  // Düzeltici aksiyon (DÖF altında)
  "Preventive"   // Önleyici aksiyon (DÖF altında)
]);

export const actions = pgTable("actions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  // Parent Referansları (En az biri NULL olmamalı - CHECK constraint DB'de)
  findingId: uuid("finding_id").references(() => findings.id, { onDelete: "cascade", onUpdate: "cascade" }), // Basit aksiyon için
  dofId: uuid("dof_id").references(() => dofs.id, { onDelete: "cascade", onUpdate: "cascade" }), // DÖF aksiyonu için (Step 4)
  
  // Aksiyon Tipi (YENİ)
  type: actionTypeEnum("type").notNull().default("Simple"),
  
  // Aksiyon Detayları
  details: text("details").notNull(),
  status: actionStatusEnum("status").notNull().default("Assigned"),
  
  // Kullanıcı Referansları
  assignedToId: uuid("assigned_to_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  managerId: uuid("manager_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdById: uuid("created_by_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  
  // Notlar ve Kanıtlar
  completionNotes: text("completion_notes"),
  rejectionReason: text("rejection_reason"),
  evidenceUrls: text("evidence_urls").array(), // YENİ: Kanıt dosyaları
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const actionsRelations = relations(actions, ({ one, many }) => ({
  finding: one(findings, {
    fields: [actions.findingId],
    references: [findings.id],
  }),
  dof: one(dofs, { // YENİ: DÖF relation
    fields: [actions.dofId],
    references: [dofs.id],
  }),
  assignedTo: one(user, {
    fields: [actions.assignedToId],
    references: [user.id],
    relationName: 'action_assigned',
  }),
  manager: one(user, {
    fields: [actions.managerId],
    references: [user.id],
    relationName: 'action_manager',
  }),
  createdBy: one(user, {
    fields: [actions.createdById],
    references: [user.id],
    relationName: 'action_creator',
  }),
  progressNotes: many(actionProgress),
}));

export type ActionRecord = typeof actions.$inferSelect;
export type NewActionRecord = typeof actions.$inferInsert;
