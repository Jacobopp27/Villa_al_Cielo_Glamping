import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema } from "@shared/schema";
import { z } from "zod";

// Google Calendar API setup
import { google } from 'googleapis';

// Colombian holidays function
function isColombianHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  
  // Fixed holidays
  const fixedHolidays = [
    { month: 1, day: 1 },   // New Year's Day
    { month: 5, day: 1 },   // Labor Day
    { month: 7, day: 20 },  // Independence Day
    { month: 8, day: 7 },   // Battle of Boyacá
    { month: 12, day: 8 },  // Immaculate Conception
    { month: 12, day: 25 }, // Christmas Day
  ];
  
  // Check fixed holidays
  for (const holiday of fixedHolidays) {
    if (month === holiday.month && day === holiday.day) {
      return true;
    }
  }
  
  // Moveable holidays that are moved to Monday (Ley Emiliani)
  const moveableHolidays = getColombianMoveableHolidays(year);
  const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  return moveableHolidays.includes(dateString);
}

function getColombianMoveableHolidays(year: number): string[] {
  const holidays: string[] = [];
  
  // Calculate Easter Sunday
  const easter = getEasterDate(year);
  
  // Add Easter-based holidays
  holidays.push(formatDate(addDays(easter, -3))); // Maundy Thursday
  holidays.push(formatDate(addDays(easter, -2))); // Good Friday
  holidays.push(formatDate(addDays(easter, 39))); // Ascension Day (moved to Monday)
  holidays.push(formatDate(addDays(easter, 60))); // Corpus Christi (moved to Monday)
  holidays.push(formatDate(addDays(easter, 68))); // Sacred Heart (moved to Monday)
  
  // Other moveable holidays (moved to next Monday if not on Monday)
  const epiphany = moveToMonday(new Date(year, 0, 6)); // January 6
  const saintJoseph = moveToMonday(new Date(year, 2, 19)); // March 19
  const saintsPeterPaul = moveToMonday(new Date(year, 5, 29)); // June 29
  const assumption = moveToMonday(new Date(year, 7, 15)); // August 15
  const columbusDay = moveToMonday(new Date(year, 9, 12)); // October 12
  const allSaints = moveToMonday(new Date(year, 10, 1)); // November 1
  const cartagenaIndependence = moveToMonday(new Date(year, 10, 11)); // November 11
  
  holidays.push(formatDate(epiphany));
  holidays.push(formatDate(saintJoseph));
  holidays.push(formatDate(saintsPeterPaul));
  holidays.push(formatDate(assumption));
  holidays.push(formatDate(columbusDay));
  holidays.push(formatDate(allSaints));
  holidays.push(formatDate(cartagenaIndependence));
  
  return holidays;
}

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

function moveToMonday(date: Date): Date {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 1) return date; // Already Monday
  
  const daysToAdd = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // If Sunday, add 1; otherwise, move to next Monday
  return addDays(date, daysToAdd);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

let calendar: any = null;

// Initialize Google Calendar API
function initializeGoogleCalendar() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn("Google Calendar API credentials not provided. Calendar integration will be disabled.");
    return null;
  }

  try {
    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/calendar']
    );

    return google.calendar({ version: 'v3', auth });
  } catch (error) {
    console.error("Failed to initialize Google Calendar API:", error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Google Calendar
  calendar = initializeGoogleCalendar();

  // Get all cabins
  app.get("/api/cabins", async (req, res) => {
    try {
      const cabins = await storage.getAllCabins();
      res.json(cabins);
    } catch (error) {
      console.error("Error fetching cabins:", error);
      res.status(500).json({ error: "Failed to fetch cabins" });
    }
  });

  // Get Colombian holidays for a given year
  app.get("/api/holidays/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year) || year < 2020 || year > 2030) {
        return res.status(400).json({ error: "Invalid year" });
      }

      const holidays = getColombianMoveableHolidays(year);
      
      // Add fixed holidays
      const fixedHolidays = [
        `${year}-01-01`, // New Year's Day
        `${year}-05-01`, // Labor Day
        `${year}-07-20`, // Independence Day
        `${year}-08-07`, // Battle of Boyacá
        `${year}-12-08`, // Immaculate Conception
        `${year}-12-25`, // Christmas Day
      ];

      const allHolidays = [...holidays, ...fixedHolidays].sort();
      
      res.json({ year, holidays: allHolidays });
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ error: "Failed to fetch holidays" });
    }
  });

  // Get cabin availability for specific dates
  app.get("/api/cabins/availability", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "Start date and end date are required"
        });
      }

      const cabins = await storage.getAllCabins();
      const availability = [];

      for (const cabin of cabins) {
        const reservations = await storage.getReservationsByCabinAndDateRange(
          cabin.id,
          startDate as string,
          endDate as string
        );

        // Calculate price based on dates
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        let totalPrice = 0;
        let includesAsado = false;
        
        // Check each day to determine if it's weekday or weekend
        // Friday-Saturday = weekend, Sunday-Monday = weekday (unless Monday is holiday)
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
          const isHoliday = isColombianHoliday(d);
          
          // Weekend pricing: Saturday, Friday night (if staying Saturday), or any holiday
          const isWeekendPricing = dayOfWeek === 6 || dayOfWeek === 5 || isHoliday;
          
          if (isWeekendPricing) {
            totalPrice += cabin.weekendPrice;
            includesAsado = true; // Weekend includes asado
          } else {
            totalPrice += cabin.weekdayPrice;
          }
        }

        availability.push({
          cabin,
          isAvailable: reservations.length === 0,
          totalPrice,
          includesAsado,
          days,
          reservations: reservations.map(r => ({
            checkIn: r.checkIn,
            checkOut: r.checkOut
          }))
        });
      }

      res.json(availability);
    } catch (error) {
      console.error("Error checking cabin availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Get availability for date range
  app.get("/api/availability", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "Start date and end date are required",
          available: true,
          bookedDates: []
        });
      }

      // Get existing reservations
      const reservations = await storage.getReservationsByDateRange(
        startDate as string, 
        endDate as string
      );

      // Get booked dates from reservations
      const bookedDates: string[] = [];
      reservations.forEach(reservation => {
        const start = new Date(reservation.checkIn);
        const end = new Date(reservation.checkOut);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          bookedDates.push(d.toISOString().split('T')[0]);
        }
      });

      // Check Google Calendar if available
      let calendarEvents: string[] = [];
      if (calendar) {
        try {
          const response = await calendar.events.list({
            calendarId: GOOGLE_CALENDAR_ID,
            timeMin: new Date(startDate as string).toISOString(),
            timeMax: new Date(endDate as string).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
          });

          calendarEvents = response.data.items?.map((event: any) => {
            if (event.start.date) {
              return event.start.date;
            } else if (event.start.dateTime) {
              return new Date(event.start.dateTime).toISOString().split('T')[0];
            }
            return null;
          }).filter(Boolean) || [];
        } catch (error) {
          console.error("Error fetching calendar events:", error);
        }
      }

      const allBookedDates = Array.from(new Set([...bookedDates, ...calendarEvents]));
      
      res.json({
        available: allBookedDates.length === 0,
        bookedDates: allBookedDates
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ 
        error: "Failed to check availability",
        available: true,
        bookedDates: []
      });
    }
  });

  // Create reservation
  app.post("/api/reservations", async (req, res) => {
    try {
      const validatedData = insertReservationSchema.parse(req.body);
      
      // Check if cabin exists
      const cabin = await storage.getCabin(validatedData.cabinId);
      if (!cabin) {
        return res.status(400).json({ 
          error: "Cabin not found" 
        });
      }

      // Check if dates are available for this specific cabin
      const conflictingReservations = await storage.getReservationsByCabinAndDateRange(
        validatedData.cabinId,
        validatedData.checkIn,
        validatedData.checkOut
      );

      if (conflictingReservations.length > 0) {
        return res.status(400).json({ 
          error: "Selected dates are not available for this cabin" 
        });
      }

      // Create reservation in storage
      const reservation = await storage.createReservation(validatedData);

      // Create Google Calendar event if calendar is available
      let calendarEventId = null;
      if (calendar) {
        try {
          const event = {
            summary: `Glamping Reservation - ${validatedData.guestName}`,
            description: `Guest: ${validatedData.guestName}\nEmail: ${validatedData.guestEmail}\nGuests: ${validatedData.guests}\nTotal: $${validatedData.totalPrice}`,
            start: {
              date: validatedData.checkIn,
              timeZone: 'America/Los_Angeles',
            },
            end: {
              date: validatedData.checkOut,
              timeZone: 'America/Los_Angeles',
            },
            attendees: [
              { email: validatedData.guestEmail }
            ],
          };

          const response = await calendar.events.insert({
            calendarId: GOOGLE_CALENDAR_ID,
            resource: event,
          });

          calendarEventId = response.data.id;
          
          // Update reservation with calendar event ID
          await storage.updateReservationCalendarId(reservation.id, calendarEventId);
        } catch (error) {
          console.error("Error creating calendar event:", error);
        }
      }

      res.status(201).json({
        ...reservation,
        googleCalendarEventId: calendarEventId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors 
        });
      }
      
      console.error("Error creating reservation:", error);
      res.status(500).json({ 
        error: "Failed to create reservation" 
      });
    }
  });

  // Get all reservations
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getAllReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ 
        error: "Failed to fetch reservations" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
