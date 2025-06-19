import { 
  users, 
  reservations, 
  cabins, 
  adminUsers,
  galleryImages,
  reviews,
  type User, 
  type InsertUser, 
  type Reservation, 
  type InsertReservation, 
  type Cabin, 
  type InsertCabin,
  type AdminUser,
  type InsertAdminUser,
  type GalleryImage,
  type InsertGalleryImage,
  type Review,
  type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, lt, gt } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cabin methods
  getAllCabins(): Promise<Cabin[]>;
  getCabin(id: number): Promise<Cabin | undefined>;
  createCabin(cabin: InsertCabin): Promise<Cabin>;
  
  // Reservation methods
  getReservation(id: number): Promise<Reservation | undefined>;
  getAllReservations(): Promise<Reservation[]>;
  getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]>;
  getReservationsByCabinAndDateRange(cabinId: number, startDate: string, endDate?: string): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation & { 
    confirmationCode: string; 
    frozenUntil: Date;
    paymentInstructions?: string;
  }): Promise<Reservation>;
  updateReservationCalendarId(id: number, calendarEventId: string): Promise<Reservation | undefined>;
  updateReservationStatus(id: number, status: "pending" | "confirmed" | "cancelled" | "expired", calendarEventId?: string): Promise<Reservation | undefined>;
  getExpiredReservations(): Promise<Reservation[]>;
  getReservationByConfirmationCode(confirmationCode: string): Promise<Reservation | undefined>;

  // Admin methods
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAllAdmins(): Promise<AdminUser[]>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;

  // Gallery methods
  getAllGalleryImages(): Promise<GalleryImage[]>;
  getActiveGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, updates: Partial<GalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<boolean>;

  // Review methods
  getAllReviews(): Promise<Review[]>;
  getApprovedReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reservations: Map<number, Reservation>;
  private cabins: Map<number, Cabin>;
  private currentUserId: number;
  private currentReservationId: number;
  private currentCabinId: number;

  constructor() {
    this.users = new Map();
    this.reservations = new Map();
    this.cabins = new Map();
    this.currentUserId = 1;
    this.currentReservationId = 1;
    this.currentCabinId = 1;
    
    // Initialize cabins with the three mentioned
    this.initializeCabins();
  }

  private async initializeCabins() {
    const cabinNames = ["Cielo", "Eclipse", "Aurora"];
    const weekdayPrice = 200000; // $200,000 COP para semana
    const weekendPrice = 390000; // $390,000 COP para fin de semana
    
    cabinNames.forEach(name => {
      const cabin: Cabin = {
        id: this.currentCabinId++,
        name,
        weekdayPrice,
        weekendPrice,
        isActive: true,
      };
      this.cabins.set(cabin.id, cabin);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCabins(): Promise<Cabin[]> {
    return Array.from(this.cabins.values());
  }

  async getCabin(id: number): Promise<Cabin | undefined> {
    return this.cabins.get(id);
  }

  async createCabin(insertCabin: InsertCabin): Promise<Cabin> {
    const id = this.currentCabinId++;
    const cabin: Cabin = { 
      ...insertCabin, 
      id,
      isActive: insertCabin.isActive ?? true
    };
    this.cabins.set(id, cabin);
    return cabin;
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async getAllReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values());
  }

  async getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(reservation => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if reservation overlaps with the requested date range
      return (checkIn <= end && checkOut >= start);
    });
  }

  async getReservationsByCabinAndDateRange(cabinId: number, startDate: string, endDate?: string): Promise<Reservation[]> {
    const end = endDate || startDate;
    return Array.from(this.reservations.values()).filter(reservation => {
      if (reservation.cabinId !== cabinId) return false;
      
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      const start = new Date(startDate);
      const endFilter = new Date(end);
      
      // Check if reservation overlaps with the requested date range
      return (checkIn <= endFilter && checkOut >= start);
    });
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.currentReservationId++;
    const reservation: Reservation = {
      ...insertReservation,
      id,
      status: "confirmed",
      googleCalendarEventId: null,
      createdAt: new Date(),
      includesAsado: insertReservation.includesAsado ?? false,
    };
    this.reservations.set(id, reservation);
    return reservation;
  }

  async updateReservationCalendarId(id: number, calendarEventId: string): Promise<Reservation | undefined> {
    const reservation = this.reservations.get(id);
    if (reservation) {
      const updated = { ...reservation, googleCalendarEventId: calendarEventId };
      this.reservations.set(id, updated);
      return updated;
    }
    return undefined;
  }
}



export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllCabins(): Promise<Cabin[]> {
    return await db.select().from(cabins).where(eq(cabins.isActive, true));
  }

  async getCabin(id: number): Promise<Cabin | undefined> {
    const [cabin] = await db.select().from(cabins).where(eq(cabins.id, id));
    return cabin || undefined;
  }

  async createCabin(insertCabin: InsertCabin): Promise<Cabin> {
    const [cabin] = await db
      .insert(cabins)
      .values(insertCabin)
      .returning();
    return cabin;
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async getAllReservations(): Promise<Reservation[]> {
    return await db.select().from(reservations);
  }

  async getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]> {
    return await db.select().from(reservations).where(
      and(
        or(
          and(
            gte(reservations.checkIn, startDate),
            lte(reservations.checkIn, endDate)
          ),
          and(
            gte(reservations.checkOut, startDate),
            lte(reservations.checkOut, endDate)
          ),
          and(
            lte(reservations.checkIn, startDate),
            gte(reservations.checkOut, endDate)
          )
        ),
        or(
          eq(reservations.status, "confirmed"),
          eq(reservations.status, "pending")
        )
      )
    );
  }

  async getReservationsByCabinAndDateRange(cabinId: number, startDate: string, endDate?: string): Promise<Reservation[]> {
    const endDateValue = endDate || startDate;
    
    // Get all reservations for this cabin
    const allReservations = await db.select().from(reservations).where(
      and(
        eq(reservations.cabinId, cabinId),
        or(
          eq(reservations.status, "confirmed"),
          eq(reservations.status, "pending")
        )
      )
    );
    
    // Filter for true overlaps in JavaScript to handle date logic properly
    return allReservations.filter(reservation => {
      const existingCheckIn = new Date(reservation.checkIn);
      const existingCheckOut = new Date(reservation.checkOut);
      const newCheckIn = new Date(startDate);
      const newCheckOut = new Date(endDateValue);
      
      // True overlap: existing check-in is before new check-out AND existing check-out is after new check-in
      // Allow same-day checkout/checkin (checkout at 11am, checkin at 3pm same day)
      return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
    });
  }

  async createReservation(insertReservation: InsertReservation & { 
    confirmationCode: string; 
    frozenUntil: Date;
    paymentInstructions?: string;
  }): Promise<Reservation> {
    const [reservation] = await db
      .insert(reservations)
      .values({
        ...insertReservation,
        status: "pending",
        frozenUntil: insertReservation.frozenUntil,
        confirmationCode: insertReservation.confirmationCode,
        paymentInstructions: insertReservation.paymentInstructions,
      })
      .returning();
    return reservation;
  }

  async updateReservationStatus(id: number, status: "pending" | "confirmed" | "cancelled" | "expired", calendarEventId?: string): Promise<Reservation | undefined> {
    const updateData: any = { 
      status, 
      updatedAt: new Date()
    };
    
    if (calendarEventId) {
      updateData.googleCalendarEventId = calendarEventId;
    }

    const [reservation] = await db
      .update(reservations)
      .set(updateData)
      .where(eq(reservations.id, id))
      .returning();
    return reservation || undefined;
  }

  async updateReservationCalendarId(id: number, calendarEventId: string): Promise<Reservation | undefined> {
    const [reservation] = await db
      .update(reservations)
      .set({ 
        googleCalendarEventId: calendarEventId,
        updatedAt: new Date()
      })
      .where(eq(reservations.id, id))
      .returning();
    return reservation || undefined;
  }

  async getExpiredReservations(): Promise<Reservation[]> {
    return await db.select().from(reservations).where(
      and(
        eq(reservations.status, "pending"),
        lte(reservations.frozenUntil, new Date())
      )
    );
  }

  async getReservationByConfirmationCode(confirmationCode: string): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.confirmationCode, confirmationCode));
    return reservation || undefined;
  }

  // Admin methods
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }

  async createAdmin(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  // Gallery methods
  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(galleryImages.displayOrder);
  }

  async getActiveGalleryImages(): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.isActive, true))
      .orderBy(galleryImages.displayOrder);
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const [image] = await db
      .insert(galleryImages)
      .values(insertImage)
      .returning();
    return image;
  }

  async updateGalleryImage(id: number, updates: Partial<GalleryImage>): Promise<GalleryImage | undefined> {
    const [updated] = await db
      .update(galleryImages)
      .set(updates)
      .where(eq(galleryImages.id, id))
      .returning();
    return updated;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await db
      .delete(galleryImages)
      .where(eq(galleryImages.id, id));
    return result.rowCount > 0;
  }

  // Review methods
  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(reviews.displayOrder);
  }

  async getApprovedReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.isApproved, true))
      .orderBy(reviews.displayOrder);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(eq(reviews.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
