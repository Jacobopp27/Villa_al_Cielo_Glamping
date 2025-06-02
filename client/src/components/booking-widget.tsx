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
  guestName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  guestEmail: z.string().email("Por favor ingrese un email válido"),
  checkIn: z.string().min(1, "La fecha de entrada es requerida"),
  checkOut: z.string().min(1, "La fecha de salida es requerida"),
  guests: z.number().min(1, "Mínimo 1 huésped requerido").max(2, "Máximo 2 huéspedes permitidos"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingWidget() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDesktopCalendarOpen, setIsDesktopCalendarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      checkIn: "",
      checkOut: "",
      guests: 1,
    },
  });

  // Fetch availability data
  const { data: availability } = useQuery({
    queryKey: ['/api/availability', dateRange.from?.toISOString().split('T')[0], dateRange.to?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return null;
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];
      const response = await apiRequest("GET", `/api/availability?startDate=${startDate}&endDate=${endDate}`);
      return response.json();
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const availabilityData = availability as { available: boolean; bookedDates: string[] } | undefined;

  // Create reservation mutation
  const createReservation = useMutation({
    mutationFn: async (data: BookingFormData & { totalPrice: number }) => {
      const response = await apiRequest("POST", "/api/reservations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Reserva Confirmada!",
        description: "Tu reserva ha sido confirmada. Recibirás un email de confirmación pronto.",
      });
      form.reset();
      setDateRange({});
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error en la Reserva",
        description: error.message || "No se pudo crear la reserva. Por favor intenta de nuevo.",
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
        // Cerrar el popover programáticamente cuando ambas fechas están seleccionadas
        setTimeout(() => {
          const popoverTrigger = document.querySelector('[data-state="open"]');
          if (popoverTrigger) {
            (popoverTrigger as HTMLElement).click();
          }
        }, 100);
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
        title: "Fechas Inválidas",
        description: "Por favor selecciona fechas de entrada y salida válidas.",
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
    if (!availabilityData?.bookedDates) return false;
    const dateString = date.toISOString().split('T')[0];
    return availabilityData.bookedDates.includes(dateString);
  };

  return (
    <>
      {/* Desktop Sticky Widget */}
      <div 
        className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 bg-white rounded-2xl shadow-2xl p-6 z-40 hidden lg:block"
        data-booking-widget
      >
        <h3 className="font-montserrat font-bold text-xl text-forest mb-4">Reserva tu Escape</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-charcoal mb-2">Entrada / Salida</Label>
              <Popover>
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
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    disabled={isDateDisabled}
                  />
                </PopoverContent>
              </Popover>
            </div>
            

            
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa tu nombre completo" {...field} />
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
                    <Input type="email" placeholder="Ingresa tu email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {pricing.total > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-charcoal">${299} x {pricing.nights} noches</span>
                  <span>${pricing.subtotal}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-charcoal">Tarifa de servicio</span>
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
                  Procesando...
                </>
              ) : (
                "Reservar Ahora"
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
              <h3 className="font-montserrat font-bold text-xl text-forest mb-4">Reserva tu Escape</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-charcoal mb-2">Entrada / Salida</Label>
                    <Popover>
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
                            <span>Seleccionar fechas</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                          onSelect={handleDateSelect}
                          numberOfMonths={1}
                          disabled={isDateDisabled}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  

                  
                  <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa tu nombre completo" {...field} />
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
                          <Input type="email" placeholder="Ingresa tu email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {pricing.total > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-charcoal">${299} x {pricing.nights} noches</span>
                        <span>${pricing.subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-charcoal">Tarifa de servicio</span>
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
                    className="w-full bg-navy hover:bg-navy/90 text-white py-4 font-montserrat font-semibold text-lg"
                    disabled={createReservation.isPending}
                  >
                    {createReservation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Reservar Ahora"
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
