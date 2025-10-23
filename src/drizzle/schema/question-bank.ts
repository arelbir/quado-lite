import { pgTable, uuid, text, timestamp, pgEnum, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import { audits } from "./audit";

/**
 * Soru Kategorileri
 */
export const questionCategoryEnum = pgEnum("question_category", [
  "Kalite",
  "Çevre",
  "İSG",
  "Bilgi Güvenliği",
  "Gıda Güvenliği",
  "Diğer"
]);

/**
 * Soru Tipleri
 */
export const questionTypeEnum = pgEnum("question_type", [
  "YesNo",        // Evet/Hayır
  "Scale",        // 1-5 Ölçek
  "Text",         // Serbest metin
  "SingleChoice", // Tek seçim (Radio)
  "Checklist",    // Çoklu seçim (Checkbox)
]);

/**
 * Soru Havuzu Tablosu
 */
export const questionBanks = pgTable("question_banks", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: questionCategoryEnum("category").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  
  createdById: uuid("created_by_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Sorular Tablosu
 */
export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  bankId: uuid("bank_id").references(() => questionBanks.id).notNull(),
  
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").notNull(),
  helpText: text("help_text"),
  
  // Checklist seçenekleri (JSON array)
  checklistOptions: text("checklist_options"), // ["Seçenek 1", "Seçenek 2"]
  
  isMandatory: boolean("is_mandatory").default(true).notNull(),
  orderIndex: text("order_index").default("0").notNull(), // Sıralama için
  
  createdById: uuid("created_by_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Denetim Şablonları
 */
export const auditTemplates = pgTable("audit_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: questionCategoryEnum("category").notNull(),
  
  // Hangi soru bankalarını kullanıyor (JSON array of IDs)
  questionBankIds: text("question_bank_ids").notNull(), // ["uuid1", "uuid2"]
  
  estimatedDurationMinutes: text("estimated_duration_minutes"), // Tahmini süre
  
  createdById: uuid("created_by_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Denetim Planları (Planlı/Plansız)
 */
export const auditScheduleTypeEnum = pgEnum("audit_schedule_type", [
  "Scheduled",   // Planlı (otomatik oluşur)
  "Adhoc"        // Plansız (manuel başlatılır)
]);

export const auditScheduleStatusEnum = pgEnum("audit_schedule_status", [
  "Pending",     // Bekliyor
  "Created",     // Denetim oluşturuldu
  "Cancelled"    // İptal edildi
]);

export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "None",        // Tekrarlanmaz
  "Daily",       // Günlük
  "Weekly",      // Haftalık
  "Monthly",     // Aylık
  "Quarterly",   // 3 Aylık
  "Yearly"       // Yıllık
]);

export const auditPlans = pgTable("audit_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  title: text("title").notNull(),
  description: text("description"),
  
  scheduleType: auditScheduleTypeEnum("schedule_type").notNull(),
  status: auditScheduleStatusEnum("status").default("Pending").notNull(),
  
  // Şablon referansı
  templateId: uuid("template_id").references(() => auditTemplates.id),
  
  // Denetçi (oluşturulan audit'e atanacak)
  auditorId: uuid("auditor_id").references(() => user.id),
  
  // Planlı denetim için tarih
  scheduledDate: timestamp("scheduled_date"),
  
  // Periyodik tekrarlama
  recurrenceType: recurrenceTypeEnum("recurrence_type").default("None"),
  recurrenceInterval: integer("recurrence_interval").default(1), // Her kaç günde/ayda/yılda
  nextScheduledDate: timestamp("next_scheduled_date"), // Bir sonraki oluşturulma tarihi
  maxOccurrences: integer("max_occurrences"), // Maksimum kaç kez oluşturulacak
  occurrenceCount: integer("occurrence_count").default(0), // Kaç kez oluşturuldu
  
  // Oluşturulan denetim referansı
  createdAuditId: uuid("created_audit_id").references(() => audits.id),
  
  createdById: uuid("created_by_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Denetim-Soru İlişkisi (Seçilen sorular)
 */
export const auditQuestions = pgTable("audit_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  auditId: uuid("audit_id").references(() => audits.id).notNull(),
  questionId: uuid("question_id").references(() => questions.id).notNull(),
  
  // Cevap alanları
  answer: text("answer"), // "Yes", "No", "1-5", veya serbest metin
  notes: text("notes"),   // Ek notlar
  isNonCompliant: boolean("is_non_compliant").default(false).notNull(), // Uygunsuzluk var mı?
  
  answeredById: uuid("answered_by_id").references(() => user.id),
  answeredAt: timestamp("answered_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Relations
export const questionBanksRelations = relations(questionBanks, ({ many, one }) => ({
  questions: many(questions),
  createdBy: one(user, {
    fields: [questionBanks.createdById],
    references: [user.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  bank: one(questionBanks, {
    fields: [questions.bankId],
    references: [questionBanks.id],
  }),
  createdBy: one(user, {
    fields: [questions.createdById],
    references: [user.id],
  }),
  auditQuestions: many(auditQuestions),
}));

export const auditTemplatesRelations = relations(auditTemplates, ({ one }) => ({
  createdBy: one(user, {
    fields: [auditTemplates.createdById],
    references: [user.id],
  }),
}));

export const auditPlansRelations = relations(auditPlans, ({ one }) => ({
  template: one(auditTemplates, {
    fields: [auditPlans.templateId],
    references: [auditTemplates.id],
  }),
  auditor: one(user, {
    fields: [auditPlans.auditorId],
    references: [user.id],
  }),
  createdAudit: one(audits, {
    fields: [auditPlans.createdAuditId],
    references: [audits.id],
  }),
  createdBy: one(user, {
    fields: [auditPlans.createdById],
    references: [user.id],
  }),
}));

export const auditQuestionsRelations = relations(auditQuestions, ({ one }) => ({
  audit: one(audits, {
    fields: [auditQuestions.auditId],
    references: [audits.id],
  }),
  question: one(questions, {
    fields: [auditQuestions.questionId],
    references: [questions.id],
  }),
  answeredBy: one(user, {
    fields: [auditQuestions.answeredById],
    references: [user.id],
  }),
}));
