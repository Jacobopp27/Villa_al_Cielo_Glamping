import { users, reservations, type User, type InsertUser, type Reservation, type InsertReservation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reservation methods
  getReservation(id: number): Promise<Reservation | undefined>;
  getAllReservations(): Promise<Reservation[]>;
  getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservationCalendarId(id: number, calendarEventId: string): Promise<Reservation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reservations: Map<number, Reservation>;
  private currentUserId: number;
  private currentReservationId: number;

  constructor() {
    this.users = new Map();
    this.reservations = new Map();
    this.currentUserId = 1;
    this.currentReservationId = 1;
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

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.currentReservationId++;
    const reservation: Reservation = {
      ...insertReservation,
      id,
      status: "confirmed",
      googleCalendarEventId: null,
      createdAt: new Date(),
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

export const storage = new MemStorage();
