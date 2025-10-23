import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { actions } from "./action";
import { user } from "./user";
import { relations } from "drizzle-orm";

/**
 * Action Progress Tracking
 * 
 * Kullanım: Aksiyon tamamlanmadan ara güncellemeler
 * - "Bugün şunu yaptım"
 * - "Yarın bunu yapacağım"
 * - Progress notları timeline'da görünür
 */

export const actionProgress = pgTable("action_progress", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  actionId: uuid("action_id")
    .notNull()
    .references(() => actions.id, { onDelete: "cascade", onUpdate: "cascade" }),
  
  note: text("note").notNull(), // Progress açıklaması
  createdById: uuid("created_by_id")
    .references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const actionProgressRelations = relations(actionProgress, ({ one }) => ({
  action: one(actions, {
    fields: [actionProgress.actionId],
    references: [actions.id],
  }),
  createdBy: one(user, {
    fields: [actionProgress.createdById],
    references: [user.id],
  }),
}));

// Type
export type ActionProgress = typeof actionProgress.$inferSelect;
