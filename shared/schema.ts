import { pgTable, text, varchar, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cabins = pgTable("cabins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  weekdayPrice: integer("weekday_price").notNull(), // Lunes a viernes
  weekendPrice: integer("weekend_price").notNull(), // Sábados, domingos y festivos
  isActive: boolean("is_active").notNull().default(true),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  cabinId: integer("cabin_id").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  guests: integer("guests").notNull(),
  totalPrice: integer("total_price").notNull(),
  includesAsado: boolean("includes_asado").notNull().default(false),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "expired"] }).notNull().default("pending"),
  googleCalendarEventId: text("google_calendar_event_id"),
  frozenUntil: timestamp("frozen_until"),
  confirmationCode: text("confirmation_code").notNull(),
  paymentInstructions: text("payment_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCabinSchema = createInsertSchema(cabins).pick({
  name: true,
  weekdayPrice: true,
  weekendPrice: true,
  isActive: true,
});

export const insertReservationSchema = createInsertSchema(reservations).pick({
  cabinId: true,
  guestName: true,
  guestEmail: true,
  checkIn: true,
  checkOut: true,
  guests: true,
  totalPrice: true,
  includesAsado: true,
}).extend({
  cabinId: z.number().min(1, "Debe seleccionar una cabaña"),
  guestName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  guestEmail: z.string().email("Por favor ingrese un email válido"),
  checkIn: z.string().min(1, "La fecha de entrada es requerida"),
  checkOut: z.string().min(1, "La fecha de salida es requerida"),
  guests: z.number().min(1, "Mínimo 1 huésped requerido").max(2, "Máximo 2 huéspedes permitidos"),
  totalPrice: z.number().min(0, "El precio total debe ser positivo"),
  includesAsado: z.boolean().default(false),
});

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed
  createdAt: timestamp("created_at").defaultNow(),
});

// Gallery images table
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new tables
export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  password: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).pick({
  title: true,
  description: true,
  imageUrl: true,
  displayOrder: true,
}).extend({
  isActive: z.boolean().default(true),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  guestName: true,  
  rating: true,
  comment: true,
  displayOrder: true,
}).extend({
  isApproved: z.boolean().default(false),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCabin = z.infer<typeof insertCabinSchema>;
export type Cabin = typeof cabins.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
