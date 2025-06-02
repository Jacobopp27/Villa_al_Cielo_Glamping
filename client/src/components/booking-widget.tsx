import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, differenceInDays, addDays } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

const bookingSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email address"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.number().min(1, "At least 1 guest is required").max(6, "Maximum 6 guests allowed"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingWidget() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      checkIn: "",
      checkOut: "",
      guests: 2,
    },
  });

  // Fetch availability data
  const { data: availability } = useQuery({
    queryKey: ['/api/availability', dateRange.from?.toISOString().split('T')[0], dateRange.to?.toISOString().split('T')[0]],
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Create reservation mutation
  const createReservation = useMutation({
    mutationFn: async (data: BookingFormData & { totalPrice: number }) => {
      const response = await apiRequest("POST", "/api/reservations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your reservation has been confirmed. You'll receive a confirmation email shortly.",
      });
      form.reset();
      setDateRange({});
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create reservation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange(range);
      if (range.from) {
        form.setValue("checkIn", range.from.toISOString().split('T')[0]);
      }
      if (range.to) {
        form.setValue("checkOut", range.to.toISOString().split('T')[0]);
      }
      if (range.from && range.to) {
        setIsCalendarOpen(false);
      }
    }
  };

  const calculatePrice = () => {
    if (!dateRange.from || !dateRange.to) return { nights: 0, subtotal: 0, serviceFee: 0, total: 0 };
    
    const nights = differenceInDays(dateRange.to, dateRange.from);
    const subtotal = nights * 299;
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;
    
    return { nights, subtotal, serviceFee, total };
  };

  const onSubmit = (data: BookingFormData) => {
    const pricing = calculatePrice();
    if (pricing.total === 0) {
      toast({
        title: "Invalid Dates",
        description: "Please select valid check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    createReservation.mutate({
      ...data,
      totalPrice: pricing.total,
    });
  };

  const pricing = calculatePrice();

  // Check if selected dates are available
  const isDateDisabled = (date: Date) => {
    if (!availability?.bookedDates) return false;
    const dateString = date.toISOString().split('T')[0];
    return availability.bookedDates.includes(dateString);
  };

  return (
    <>
      {/* Desktop Sticky Widget */}
      <div 
        className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 bg-white rounded-2xl shadow-2xl p-6 z-40 hidden lg:block"
        data-booking-widget
      >
        <h3 className="font-montserrat font-bold text-xl text-forest mb-4">Reserve Your Escape</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-charcoal mb-2">Check-in / Check-out</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    disabled={isDateDisabled}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guests</FormLabel>
                  <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Guest{num !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {pricing.total > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-charcoal">${299} x {pricing.nights} nights</span>
                  <span>${pricing.subtotal}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-charcoal">Service fee</span>
                  <span>${pricing.serviceFee}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${pricing.total}</span>
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-forest hover:bg-forest/90 text-white py-4 font-montserrat font-semibold text-lg"
              disabled={createReservation.isPending}
            >
              {createReservation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Reserve Now"
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Mobile Booking Section */}
      <section className="lg:hidden py-20 bg-white" data-booking-widget>
        <div className="max-w-lg mx-auto px-4">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <h3 className="font-montserrat font-bold text-xl text-forest mb-4">Reserve Your Escape</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-charcoal mb-2">Check-in / Check-out</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select dates</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={handleDateSelect}
                          numberOfMonths={1}
                          disabled={isDateDisabled}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guests</FormLabel>
                        <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Guest{num !== 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {pricing.total > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-charcoal">${299} x {pricing.nights} nights</span>
                        <span>${pricing.subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-charcoal">Service fee</span>
                        <span>${pricing.serviceFee}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${pricing.total}</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-forest hover:bg-forest/90 text-white py-4 font-montserrat font-semibold text-lg"
                    disabled={createReservation.isPending}
                  >
                    {createReservation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Reserve Now"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
