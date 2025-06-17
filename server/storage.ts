import { users, reservations, cabins, type User, type InsertUser, type Reservation, type InsertReservation, type Cabin, type InsertCabin } from "@shared/schema";

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
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservationCalendarId(id: number, calendarEventId: string): Promise<Reservation | undefined>;
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

export const storage = new MemStorage();
