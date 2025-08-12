import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  duration: text("duration").notNull(),
  units: text("units").notNull(),
  schedule: text("schedule").notNull(),
  moodleUrl: text("moodle_url").notNull(),
  isPremium: boolean("is_premium").default(true),
  category: text("category").notNull(),
  price: integer("price").default(0), // Price in cents, 0 = free course
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  hasAccess: boolean("has_access").default(false),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  accessExpiresAt: timestamp("access_expires_at"),
  paymentId: text("payment_id"), // Reference to Moneris payment
  paidAmount: integer("paid_amount"), // Amount paid in cents
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  userId: true,
  courseId: true,
});

// Payment schemas
export const paymentInitiationSchema = z.object({
  courseId: z.string(),
});

export const paymentWebhookSchema = z.object({
  transaction_id: z.string(),
  order_id: z.string(),
  result: z.string(),
  amount: z.string(),
  card_type: z.string().optional(),
  response_code: z.string(),
  iso_code: z.string(),
  message: z.string(),
});

// Course completion schema
export const courseCompletionSchema = z.object({
  enrollmentId: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type PaymentInitiation = z.infer<typeof paymentInitiationSchema>;
export type PaymentWebhook = z.infer<typeof paymentWebhookSchema>;
export type CourseCompletion = z.infer<typeof courseCompletionSchema>;
