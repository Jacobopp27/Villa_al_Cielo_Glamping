import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

const bookingSchema = z.object({
  cabinId: z.number().min(1, "Debe seleccionar una cabaña"),
  guestName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  guestEmail: z.string().email("Por favor ingrese un email válido"),
  checkIn: z.string().min(1, "La fecha de entrada es requerida"),
  checkOut: z.string().min(1, "La fecha de salida es requerida"),
  guests: z.number().min(1, "Mínimo 1 huésped requerido").max(2, "Máximo 2 huéspedes permitidos"),
  totalPrice: z.number().min(0, "El precio total debe ser positivo"),
  includesAsado: z.boolean().default(false),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingWidget() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedCabin, setSelectedCabin] = useState<any>(null);
  const [wantsAsado, setWantsAsado] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      cabinId: 0,
      guestName: "",
      guestEmail: "",
      checkIn: "",
      checkOut: "",
      guests: 1,
      totalPrice: 0,
      includesAsado: false,
    },
  });

  // Fetch Colombian holidays for current year
  const currentYear = new Date().getFullYear();
  const { data: holidaysData } = useQuery({
    queryKey: ['/api/holidays', currentYear],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/holidays/${currentYear}`);
      return response.json();
    },
  });

  // Fetch cabin availability data
  const { data: cabinAvailability, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['/api/cabins/availability', dateRange.from?.toISOString().split('T')[0], dateRange.to?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return null;
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];
      const response = await apiRequest("GET", `/api/cabins/availability?startDate=${startDate}&endDate=${endDate}`);
      return response.json();
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const availabilityData = cabinAvailability as Array<{
    cabin: { id: number; name: string; weekdayPrice: number; weekendPrice: number };
    isAvailable: boolean;
    totalPrice: number;
    includesAsado: boolean;
    days: number;
  }> | undefined;

  // Create reservation mutation
  const createReservation = useMutation({
    mutationFn: async (data: BookingFormData) => {
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
      queryClient.invalidateQueries({ queryKey: ['/api/cabins/availability'] });
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
      }
    }
  };

  const onSubmit = (data: BookingFormData) => {
    if (!data.cabinId || data.totalPrice === 0) {
      toast({
        title: "Información Incompleta",
        description: "Por favor selecciona una cabaña y fechas válidas.",
        variant: "destructive",
      });
      return;
    }

    createReservation.mutate(data);
  };

  const handleCabinSelect = (cabinData: any) => {
    setSelectedCabin(cabinData);
    form.setValue("cabinId", cabinData.cabin.id);
    calculateTotalPrice(cabinData, wantsAsado);
  };

  const calculateTotalPrice = (cabinData: any, includeAsado: boolean) => {
    let finalPrice = cabinData.totalPrice;
    let includesAsado = cabinData.includesAsado;
    
    // If it's weekday and user wants asado, add 50k per night
    if (!cabinData.includesAsado && includeAsado) {
      finalPrice += cabinData.days * 50000;
      includesAsado = true;
    }
    
    form.setValue("totalPrice", finalPrice);
    form.setValue("includesAsado", includesAsado);
  };

  // Recalculate price when asado option changes
  useEffect(() => {
    if (selectedCabin) {
      calculateTotalPrice(selectedCabin, wantsAsado);
    }
  }, [wantsAsado, selectedCabin]);

  // Check if selected dates are available (simplified for now)
  const isDateDisabled = (date: Date) => {
    return date < new Date(); // Only disable past dates
  };

  // Check if date is a Colombian holiday
  const isHoliday = (date: Date) => {
    if (!holidaysData?.holidays) return false;
    const dateString = date.toISOString().split('T')[0];
    return holidaysData.holidays.includes(dateString);
  };

  // Get day type for visual display (colors)
  const getDayType = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const holiday = isHoliday(date);
    
    if (holiday) return 'festivo';
    if (dayOfWeek === 6 || dayOfWeek === 0) return 'fin-de-semana'; // Saturday-Sunday only
    return 'entre-semana';
  };

  return (
    <>
      {/* Floating Reserve Button - Desktop */}
      <div className="fixed right-6 bottom-6 z-50 hidden lg:block">
        <button
          onClick={() => {
            const bookingSection = document.querySelector('[data-booking-widget]');
            if (bookingSection) {
              bookingSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-forest hover:bg-forest/90 text-white px-6 py-4 rounded-full shadow-2xl font-montserrat font-semibold text-lg transition-all hover:scale-105 hover:shadow-3xl"
        >
          Reservar Ahora
        </button>
      </div>



      {/* Static Booking Section */}
      <section className="py-20 bg-white" data-booking-widget>
        <div className="max-w-2xl mx-auto px-4">
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
                          modifiers={{
                            holiday: (date) => isHoliday(date),
                            weekend: (date) => getDayType(date) === 'fin-de-semana',
                            weekday: (date) => getDayType(date) === 'entre-semana'
                          }}
                          modifiersClassNames={{
                            holiday: 'calendar-holiday',
                            weekend: 'calendar-weekend',
                            weekday: 'calendar-weekday'
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Cabin Selection - Mobile */}
                  {availabilityData && availabilityData.length > 0 && (
                    <div className="space-y-3">
                      <Label className="block text-sm font-medium text-charcoal mb-2">Selecciona tu Cabaña</Label>
                      {availabilityData.map((cabin) => (
                        <div 
                          key={cabin.cabin.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            cabin.isAvailable 
                              ? 'border-gray-200 hover:bg-gold/5 hover:border-gold/50' 
                              : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                          } ${
                            form.watch('cabinId') === cabin.cabin.id ? 'bg-gold/20 border-gold border-2 ring-2 ring-gold/30' : ''
                          }`}
                          onClick={() => cabin.isAvailable && handleCabinSelect(cabin)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg text-navy">{cabin.cabin.name}</h4>
                              <p className="text-sm text-charcoal">
                                {cabin.days} {cabin.days === 1 ? 'noche' : 'noches'}
                              </p>
                              {cabin.includesAsado && (
                                <p className="text-xs text-gold font-medium mt-1">
                                  ✓ Incluye Kit de Asado y Desayuno
                                </p>
                              )}
                              {!cabin.includesAsado && (
                                <p className="text-xs text-charcoal mt-1">
                                  Incluye Desayuno
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-navy">
                                ${cabin.totalPrice.toLocaleString()} COP
                              </p>
                              <p className="text-xs text-charcoal">
                                {cabin.isAvailable ? 'Disponible' : 'No Disponible'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {dateRange.from && dateRange.to && isAvailabilityLoading && (
                    <div className="text-center py-4">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-navy" />
                      <p className="text-sm text-charcoal mt-2">Verificando disponibilidad...</p>
                    </div>
                  )}

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
                  
                  {/* Optional Asado Kit for weekdays - Mobile */}
                  {selectedCabin && !selectedCabin.includesAsado && (
                    <div className="border border-gold/20 rounded-lg p-4 bg-gold/5">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="asado-option-mobile"
                          checked={wantsAsado}
                          onCheckedChange={(checked) => setWantsAsado(checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor="asado-option-mobile" 
                            className="text-sm font-medium text-navy cursor-pointer"
                          >
                            Agregar Kit de Asado (+$50.000 COP)
                          </Label>
                          <p className="text-xs text-charcoal">
                            2 bisteces 250g c/u, 2 chorizos, 2 arepas
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {form.watch('totalPrice') > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total a Pagar</span>
                        <span className="text-navy">${form.watch('totalPrice').toLocaleString()} COP</span>
                      </div>
                      {form.watch('includesAsado') && (
                        <p className="text-xs text-gold mt-2">✓ Incluye Kit de Asado y Desayuno</p>
                      )}
                      {!form.watch('includesAsado') && (
                        <p className="text-xs text-charcoal mt-2">Incluye Desayuno</p>
                      )}
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