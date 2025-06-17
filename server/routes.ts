import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema } from "@shared/schema";
import { z } from "zod";

// Google Calendar API setup
import { google } from 'googleapis';

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
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          if (isWeekend) {
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
