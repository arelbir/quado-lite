import { pgTable, uuid, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

/**
 * Bildirim Kategorileri
 */
export const notificationCategoryEnum = pgEnum("notification_category", [
  "finding_assigned",
  "finding_updated",
  "action_assigned",
  "action_pending_approval",
  "action_approved",
  "action_rejected",
  "dof_assigned",
  "dof_pending_approval",
  "dof_approved",
  "dof_rejected",
  "plan_created",
  "audit_completed",
  "audit_reminder",
]);

/**
 * İlişkili Entity Tipleri
 */
export const relatedEntityTypeEnum = pgEnum("related_entity_type", [
  "finding",
  "action",
  "dof",
  "audit",
  "plan",
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
  
  // İlişkili entity
  relatedEntityType: relatedEntityTypeEnum("related_entity_type"),
  relatedEntityId: uuid("related_entity_id"),
  
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
 */
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => user.id).notNull().unique(),
  
  // Genel tercihler
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
  
  // Kategori bazlı tercihler
  findingNotifications: boolean("finding_notifications").default(true).notNull(),
  actionNotifications: boolean("action_notifications").default(true).notNull(),
  dofNotifications: boolean("dof_notifications").default(true).notNull(),
  planNotifications: boolean("plan_notifications").default(true).notNull(),
  auditNotifications: boolean("audit_notifications").default(true).notNull(),
  
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
