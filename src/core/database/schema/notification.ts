import { pgTable, uuid, text, timestamp, pgEnum, boolean, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

/**
 * NOTIFICATION PRIORITY
 */
export const notificationPriorityEnum = pgEnum("notification_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

/**
 * GENERIC NOTIFICATION CATEGORIES - Framework Core
 * Pure framework-level notifications only
 * Domain modules define their own categories
 */
export const notificationCategoryEnum = pgEnum("notification_category", [
  // Core workflow notifications
  "workflow_assignment",
  "workflow_deadline_approaching",
  "workflow_escalated",
  "workflow_approved",
  "workflow_rejected",
  "workflow_completed",
  // Generic system notifications
  "system_alert",
  "user_mentioned",
  "task_assigned",
  "task_updated",
  "task_completed",
  "approval_required",
  "approval_completed",
]);

/**
 * GENERIC ENTITY TYPES - Framework Core
 * Pure framework entities only
 */
export const relatedEntityTypeEnum = pgEnum("related_entity_type", [
  "user",
  "role",
  "workflow",
  "document",
  "team",
  "group",
]);

/**
 * Bildirimler Tablosu
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Alıcı
  userId: uuid("user_id").references(() => user.id).notNull(),
  
  // Bildirim detayları
  category: notificationCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: notificationPriorityEnum("priority").default("medium").notNull(),
  
  // İlişkili entity
  relatedEntityType: relatedEntityTypeEnum("related_entity_type"),
  relatedEntityId: uuid("related_entity_id"),
  
  // İlave bilgiler
  metadata: json("metadata").default({}).notNull(),
  actionUrl: text("action_url"),
  
  // Durum
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  
  // Email gönderim durumu
  emailSent: boolean("email_sent").default(false).notNull(),
  emailSentAt: timestamp("email_sent_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Kullanıcı Bildirim Tercihleri
 * Pure framework preferences - no domain-specific fields
 */
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => user.id).notNull().unique(),
  
  // Global preferences only - framework level
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(user, {
    fields: [notificationPreferences.userId],
    references: [user.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
