import { sql } from "drizzle-orm";
import { pgTable, text, varchar, bigint, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const sharedRecommendations = pgTable("shared_recommendations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(),
  platforms: jsonb("platforms").$type<string[]>().default([]),
  notes: text("notes"),
  platformUrl: text("platform_url"),
  imageBase64: text("image_base64"),
  sharedAt: bigint("shared_at", { mode: "number" }).notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }),
});

export const insertSharedRecommendationSchema = createInsertSchema(sharedRecommendations).omit({
  id: true,
});

export type InsertSharedRecommendation = z.infer<typeof insertSharedRecommendationSchema>;
export type SharedRecommendation = typeof sharedRecommendations.$inferSelect;
