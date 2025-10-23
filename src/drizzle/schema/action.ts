// Actions (Basit Aksiyonlar) - Kurumsal Denetim Sistemi
import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { findings } from "./finding";
import { user } from "./user";
import { relations } from "drizzle-orm";
import { actionProgress } from "./action-progress";

// Action Status Enum
export const actionStatusEnum = pgEnum("action_status", [
  "Assigned",              // Sorumluya atandı
  "PendingManagerApproval", // Sorumlu tamamladı, Yönetici onayı bekliyor
  "Completed",             // Yönetici onayladı, kapandı
  "Rejected",              // Yönetici reddetti, Sorumluya geri döndü (artık kullanılmıyor, döngü için Assigned'a dönüyor)
  "Cancelled"              // İptal edildi, döngüden çıkış (Final state)
]);

export const actions = pgTable("actions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  findingId: uuid("finding_id").references(() => findings.id, { onDelete: "cascade", onUpdate: "cascade" }),
  details: text("details").notNull(),
  status: actionStatusEnum("status").notNull().default("Assigned"),
  // Esnek atama: Herhangi bir kullanıcı olabilir
  assignedToId: uuid("assigned_to_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  // Esnek atama: Herhangi bir kullanıcı olabilir
  managerId: uuid("manager_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdById: uuid("created_by_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  // Tamamlama ve ret notları
  completionNotes: text("completion_notes"), // Sorumlu ne yaptığını açıklar
  rejectionReason: text("rejection_reason"), // Yönetici ret nedeni
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const actionsRelations = relations(actions, ({ one, many }) => ({
  finding: one(findings, {
    fields: [actions.findingId],
    references: [findings.id],
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
