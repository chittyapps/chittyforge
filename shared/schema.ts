import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  chittyId: text("chitty_id").unique(),
  email: text("email"),
  phone: text("phone"),
  fullName: text("full_name"),
  avatar: text("avatar"),
  trustLevel: integer("trust_level").default(1),
  trustScore: integer("trust_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationMethods = pgTable("verification_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // email, phone, government_id, biometric
  status: text("status").notNull().default("pending"), // pending, in_review, completed, failed
  data: jsonb("data"), // verification specific data
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  requirement: text("requirement").notNull(),
  category: text("category").notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id).notNull(),
  badgeId: text("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const identityShares = pgTable("identity_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id).notNull(),
  shareToken: text("share_token").notNull().unique(),
  isPublic: boolean("is_public").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  fullName: true,
});

export const insertVerificationSchema = createInsertSchema(verificationMethods).pick({
  userId: true,
  type: true,
  data: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  userId: true,
  action: true,
  description: true,
  metadata: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VerificationMethod = typeof verificationMethods.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type IdentityShare = typeof identityShares.$inferSelect;

// Additional schemas for API endpoints
export const verifyChittyIdSchema = z.object({
  chittyId: z.string().min(1, "ChittyID is required"),
});

export const updateVerificationSchema = z.object({
  verificationId: z.string(),
  status: z.enum(["pending", "in_review", "completed", "failed"]),
  data: z.record(z.any()).optional(),
});

export const createShareSchema = z.object({
  isPublic: z.boolean().default(false),
  expiresInDays: z.number().optional(),
});
