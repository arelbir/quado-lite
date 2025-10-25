// DOFs (Düzeltici/Önleyici Faaliyet) - Kurumsal Denetim Sistemi
import { pgTable, timestamp, text, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import { findings } from "./finding";
import { actions } from "./action";

// DOF Status Enum (UPDATED: Workflow integration - removed approval statuses)
export const dofStatusEnum = pgEnum("dof_status", [
  "Step1_Problem",           // Adım 1: Problem Tanımı
  "Step2_TempMeasures",      // Adım 2: Geçici Önlemler
  "Step3_RootCause",         // Adım 3: Kök Neden Analizi
  "Step4_Activities",        // Adım 4: Faaliyet Belirleme
  "Step5_Implementation",    // Adım 5: Uygulama
  "Step6_EffectivenessCheck",// Adım 6: Etkinlik Kontrolü (Submit to workflow here)
  "Completed",               // Workflow onaylandı, kapandı (Final state)
  "Cancelled"                // İptal edildi (Exit state - NEW)
]);

// Activity Type Enum
export const activityTypeEnum = pgEnum("activity_type", [
  "Düzeltici",  // Corrective Action
  "Önleyici"    // Preventive Action
]);

export const dofs = pgTable("dofs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  findingId: uuid("finding_id").references(() => findings.id, { onDelete: "cascade", onUpdate: "cascade" }),
  
  // Adım 1: Problem Tanımı (5N1K)
  problemTitle: text("problem_title").notNull(),
  problemDetails: text("problem_details"), // Ne, Nerede, Ne zaman, Kim, Nasıl, Niçin
  
  // Adım 2: Geçici Önlemler
  tempMeasures: text("temp_measures"),
  
  // Adım 3: Kök Neden Analizi
  rootCauseAnalysis: text("root_cause_analysis"),
  rootCauseFileUrl: text("root_cause_file_url"), // Balık kılçığı diyagramı vb.
  
  // Adım 4: Faaliyetler (Ayrı tablo: dofActivities)
  
  // Adım 5: Uygulama (Faaliyetlerin tamamlanma durumu)
  
  // Adım 6: Etkinlik Kontrolü
  effectivenessCheck: text("effectiveness_check"),
  effectivenessCheckDate: timestamp("effectiveness_check_date"),
  
  // Genel
  status: dofStatusEnum("status").notNull().default("Step1_Problem"),
  // Esnek atama: Herhangi bir kullanıcı olabilir
  assignedToId: uuid("assigned_to_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  // Esnek atama: Herhangi bir kullanıcı olabilir
  managerId: uuid("manager_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdById: uuid("created_by_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dofsRelations = relations(dofs, ({ one, many }) => ({
  finding: one(findings, {
    fields: [dofs.findingId],
    references: [findings.id],
  }),
  assignedTo: one(user, {
    fields: [dofs.assignedToId],
    references: [user.id],
    relationName: 'dof_assigned',
  }),
  manager: one(user, {
    fields: [dofs.managerId],
    references: [user.id],
    relationName: 'dof_manager',
  }),
  createdBy: one(user, {
    fields: [dofs.createdById],
    references: [user.id],
    relationName: 'dof_creator',
  }),
  // YENİ: DÖF actions (hibrit yaklaşım)
  // actions tablosundan dofId ile bağlı action'lar
  // NOT: dofActivities yerine actions kullanılıyor
  actions: many(actions),
}));

// DOF Activities (Adım 4: Faaliyetler)
export const dofActivities = pgTable("dof_activities", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  dofId: uuid("dof_id").references(() => dofs.id, { onDelete: "cascade", onUpdate: "cascade" }),
  description: text("description").notNull(),
  type: activityTypeEnum("type").notNull(),
  dueDate: timestamp("due_date"),
  responsibleId: uuid("responsible_id").references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dofActivitiesRelations = relations(dofActivities, ({ one }) => ({
  dof: one(dofs, {
    fields: [dofActivities.dofId],
    references: [dofs.id],
  }),
  responsible: one(user, {
    fields: [dofActivities.responsibleId],
    references: [user.id],
    relationName: 'dof_activity_responsible',
  }),
}));

export type Dof = typeof dofs.$inferSelect;
export type NewDof = typeof dofs.$inferInsert;
export type DofActivity = typeof dofActivities.$inferSelect;
export type NewDofActivity = typeof dofActivities.$inferInsert;
