import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  status: text("status").notNull().default("confirmed"),
  googleCalendarEventId: text("google_calendar_event_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCabin = z.infer<typeof insertCabinSchema>;
export type Cabin = typeof cabins.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;
