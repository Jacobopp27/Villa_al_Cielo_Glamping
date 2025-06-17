# Villa al Cielo - Glamping Reservation Platform

## Project Overview
A modern glamping reservation platform specializing in immersive nature experiences located in Barbosa, Antioquia, Colombia. The platform features three individual cabins with dynamic pricing and real-time availability checking.

**Current State:** Fully functional multi-cabin booking system with weekday/weekend pricing
**Location:** Barbosa, Antioquia, Colombia  
**Branding:** "VILLA AL CIELO" with luxury blue and gold color scheme
**Slogan:** "Conexión, Tranquilidad y Naturaleza"

## Cabin Information
**Three Cabins Available:**
- **Cielo** - Premium cabin with mountain views
- **Eclipse** - Romantic cabin with stargazing amenities  
- **Aurora** - Family-friendly cabin with nature access

**Pricing Structure (COP):**
- Weekdays (Sunday-Thursday): $200,000 per night (includes breakfast)
- Weekends (Friday-Saturday) & Colombian Holidays: $390,000 per night (includes breakfast + BBQ kit)
- BBQ Kit Add-on: $50,000 (2 steaks 250g each, 2 chorizo, 2 arepas)
- Maximum: 2 guests per cabin
- Special Rule: Friday-Saturday counts as weekend, Sunday-Monday as weekday (except holiday Mondays)

## Technical Stack
- **Frontend:** React.js with TypeScript, Tailwind CSS, Shadcn/ui components
- **Backend:** Node.js/Express with TypeScript
- **Database:** In-memory storage (MemStorage) for development
- **Calendar Integration:** Google Calendar API (optional)
- **Routing:** Wouter for client-side routing
- **State Management:** TanStack Query for server state

## Recent Changes (June 2025)
- **Multi-Cabin System Implementation:** Replaced single-unit booking with three individual cabins
- **Colombian Holiday Integration:** Added complete Colombian holiday calendar with Ley Emiliani compliance
- **Enhanced Pricing Logic:** Friday-Saturday = weekend, Sunday-Monday = weekday (except holiday Mondays)
- **Holiday Pricing Fix:** Night before holiday charges weekend rate (e.g., Sunday-Monday if Monday is holiday)
- **Visual Calendar Updates:** Blue for Saturday-Sunday only, green for holidays, removed emoji icons
- **Optional Asado Kit:** Weekday bookings can add BBQ kit for +$50,000 COP via checkbox
- **Fixed Cabin Selection:** Resolved click functionality for cabin selection in booking widget
- **Real-time Availability:** Individual cabin availability checking by date range
- **UI/UX Updates:** Removed "Ver Experiencia Real" button, updated pricing display to COP format
- **Branding Update:** Implemented user's actual logo and "VILLA AL CIELO" text
- **Navigation Enhancement:** Blue navbar with white/gold text and user's geometric triangle logo

## User Preferences
- **Language:** Spanish for all user-facing content
- **Currency:** Colombian Pesos (COP) with proper formatting
- **Design:** Luxury accessible experience with blue (#1e40af) and gold (#fbbf24) color scheme
- **Logo:** User's actual geometric triangle logo (2FBEB0F9-A0D5-48AA-BC3F-36E0DFEE51C3.png)
- **Photos:** Real glamping property photos instead of stock images

## Architecture Notes
- **Storage Interface:** IStorage pattern for easy database migration
- **API Endpoints:** 
  - `/api/cabins` - Get all cabins
  - `/api/cabins/availability` - Check availability by date range
  - `/api/reservations` - Create and manage reservations
- **Schema:** Drizzle ORM with Zod validation for type safety
- **Booking Flow:** Date selection → Cabin selection → Guest details → Confirmation

## Development Guidelines
- Use TypeScript with strict mode enabled
- Follow React best practices with functional components and hooks
- Implement proper error handling and loading states
- Maintain responsive design for mobile and desktop
- Use semantic HTML and accessibility features
- Apply consistent Spanish translations throughout

## Future Enhancements
- Database migration from in-memory to persistent storage
- Payment gateway integration
- Email confirmation system
- Admin dashboard for reservation management
- Multi-language support expansion