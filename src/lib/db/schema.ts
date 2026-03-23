import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  pin: text("pin").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const timeEntries = sqliteTable("time_entries", {
  id: integer("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  clockIn: integer("clock_in", { mode: "timestamp" }).notNull(),
  clockOut: integer("clock_out", { mode: "timestamp" }),
  breakType: text("break_type"),
  breakMinutes: integer("break_minutes").default(0),
  totalHours: real("total_hours"),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false),
  location: text("location"),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  timeEntryId: integer("time_entry_id")
    .notNull()
    .references(() => timeEntries.id),
  message: text("message").notNull(),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const employeeRelations = relations(employees, ({ many }) => ({
  timeEntries: many(timeEntries),
  notifications: many(notifications),
}));

export const timeEntryRelations = relations(timeEntries, ({ one }) => ({
  employee: one(employees, {
    fields: [timeEntries.employeeId],
    references: [employees.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  employee: one(employees, {
    fields: [notifications.employeeId],
    references: [employees.id],
  }),
  timeEntry: one(timeEntries, {
    fields: [notifications.timeEntryId],
    references: [timeEntries.id],
  }),
}));

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
