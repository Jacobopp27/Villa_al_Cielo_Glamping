import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Calendar,
  BarChart3,
  Users,
  Image,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Home,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  Mail,
  Ban
} from "lucide-react";

// Form schemas
const galleryImageSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL de imagen válida requerida"),
  displayOrder: z.number().min(0).default(0),
});

const reviewSchema = z.object({
  guestName: z.string().min(1, "Nombre requerido"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comentario requerido"),
  displayOrder: z.number().min(0).default(0),
});

const emailTestSchema = z.object({
  email: z.string().email("Email válido requerido"),
  subject: z.string().min(1, "Asunto requerido"),
  message: z.string().min(1, "Mensaje requerido"),
});

type GalleryImageFormData = z.infer<typeof galleryImageSchema>;
type ReviewFormData = z.infer<typeof reviewSchema>;
type EmailTestFormData = z.infer<typeof emailTestSchema>;

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reservationFilter, setReservationFilter] = useState<"all" | "pending" | "confirmed" | "cancelled" | "expired">("all");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check authentication
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['/api/admin/auth'],
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && !authData?.authenticated) {
      window.location.href = "/admin/login";
    }
  }, [authData, authLoading]);

  // Dashboard statistics with auto-refresh
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    enabled: authData?.authenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Reservations data with auto-refresh
  const { data: reservations, refetch: refetchReservations } = useQuery({
    queryKey: ['/api/admin/reservations'],
    enabled: authData?.authenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Gallery data
  const { data: galleryImages, refetch: refetchGallery } = useQuery({
    queryKey: ['/api/admin/gallery'],
    enabled: authData?.authenticated,
  });

  // Reviews data
  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['/api/admin/reviews'],
    enabled: authData?.authenticated,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      window.location.href = "/admin/login";
    },
  });

  // Reservation status update
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/reservations/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva actualizada",
        description: "El estado de la reserva ha sido actualizado exitosamente",
      });
      // Invalidar caché de reservas y estadísticas para actualizar gráficos en tiempo real
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel reservation
  const cancelReservationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/admin/reservations/${id}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete reservation
  const deleteReservationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/reservations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada completamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reservations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Gallery mutations
  const galleryForm = useForm<GalleryImageFormData>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      displayOrder: 0,
    },
  });

  const addGalleryImageMutation = useMutation({
    mutationFn: async (data: GalleryImageFormData) => {
      const response = await apiRequest("POST", "/api/admin/gallery", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Imagen agregada",
        description: "La imagen ha sido agregada a la galería",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery'] });
      galleryForm.reset();
    },
  });

  const uploadGalleryImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Imagen subida",
        description: "La imagen ha sido subida y agregada a la galería",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery'] });
    },
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/gallery/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada de la galería",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery'] });
    },
  });

  // Review mutations
  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      guestName: "",
      rating: 5,
      comment: "",
      displayOrder: 0,
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await apiRequest("POST", "/api/admin/reviews", { ...data, isApproved: true });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reseña agregada",
        description: "La reseña ha sido agregada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      reviewForm.reset();
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/reviews/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reseña actualizada",
        description: "La reseña ha sido actualizada exitosamente",
      });
      refetchReviews();
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/reviews/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Reseña eliminada",
        description: "La reseña ha sido eliminada",
      });
      refetchReviews();
    },
  });

  // Email test mutation
  const emailTestForm = useForm<EmailTestFormData>({
    resolver: zodResolver(emailTestSchema),
    defaultValues: {
      email: "",
      subject: "Prueba de Sistema de Correos - Villa al Cielo",
      message: "Este es un correo de prueba del sistema de doble ruta (SendGrid/Gmail API) para verificar la entregabilidad.",
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async (data: EmailTestFormData) => {
      const response = await apiRequest("POST", "/api/admin/test-email", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Correo enviado",
        description: "El correo de prueba ha sido enviado exitosamente",
      });
      emailTestForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar correo",
        description: error.message || "No se pudo enviar el correo de prueba",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-charcoal">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!authData?.authenticated) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
      confirmed: { label: "Confirmada", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
      expired: { label: "Expirada", variant: "outline" as const, icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-gold" />
              <h1 className="text-xl font-montserrat font-bold">Panel de Administrador - Villa al Cielo</h1>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => logoutMutation.mutate()}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Galería
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reseñas
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correos
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalReservations || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats?.pendingReservations || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.confirmedReservations || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()} COP</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Mes (Total, Aprobadas, Canceladas)</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats as any)?.monthlyData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={(stats as any).monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#6b7280" name="Total" />
                        <Bar dataKey="aprobadas" fill="#10b981" name="Aprobadas" />
                        <Bar dataKey="canceladas" fill="#ef4444" name="Canceladas" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-charcoal/60">
                      Cargando datos del gráfico...
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Mes (COP)</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats as any)?.revenueData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={(stats as any).revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString()} COP`, 'Ingresos']} />
                        <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-charcoal/60">
                      Cargando datos del gráfico...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Cabin Occupancy Chart */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ocupación por Cabaña</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats as any)?.cabinOccupancy ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={(stats as any).cabinOccupancy}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ cabin, occupancy }: any) => `${cabin}: ${occupancy}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="occupancy"
                        >
                          {(stats as any).cabinOccupancy.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={
                              entry.cabin === 'Cielo' ? '#3b82f6' :
                              entry.cabin === 'Eclipse' ? '#8b5cf6' :
                              entry.cabin === 'Aurora' ? '#10b981' : '#6b7280'
                            } />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-charcoal/60">
                      Cargando datos del gráfico...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestión de Reservas</CardTitle>
                  <Select value={reservationFilter} onValueChange={(value: any) => setReservationFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar reservas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las Reservas</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="confirmed">Aprobadas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                      <SelectItem value="expired">Expiradas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    let filteredReservations = (reservations as any[]) || [];
                    
                    // Filter reservations based on selected filter
                    if (reservationFilter !== "all") {
                      filteredReservations = filteredReservations.filter((r: any) => r.status === reservationFilter);
                    }
                    
                    // Sort reservations: pending first, then confirmed, then cancelled/expired
                    filteredReservations.sort((a: any, b: any) => {
                      const statusOrder = { pending: 1, confirmed: 2, cancelled: 3, expired: 3 };
                      const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 4;
                      const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 4;
                      if (aOrder !== bOrder) return aOrder - bOrder;
                      // Within same status, sort by creation date (newest first)
                      return new Date(b.createdAt || b.id).getTime() - new Date(a.createdAt || a.id).getTime();
                    });
                    
                    return filteredReservations.map((reservation: any) => (
                    <div key={reservation.id} className="border rounded-lg p-4 space-y-3">
                      {/* Header con información básica */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{reservation.guestName}</h3>
                          <p className="text-charcoal/70 break-all">{reservation.guestEmail}</p>
                          <p className="text-sm text-charcoal/60">
                            {reservation.checkIn} - {reservation.checkOut}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            ${reservation.totalPrice.toLocaleString()} COP
                          </p>
                          {reservation.confirmationCode && (
                            <p className="text-sm text-navy font-mono">
                              Código: {reservation.confirmationCode}
                            </p>
                          )}
                        </div>
                        
                        {/* Status badge - visible en ambas versiones */}
                        <div className="flex sm:flex-col sm:items-end">
                          {getStatusBadge(reservation.status)}
                        </div>
                      </div>

                      {/* Botones de acción - responsive */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                        {reservation.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateReservationMutation.mutate({ 
                                id: reservation.id, 
                                status: 'confirmed' 
                              })}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                            >
                              <CheckCircle className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Aprobar</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateReservationMutation.mutate({ 
                                id: reservation.id, 
                                status: 'cancelled' 
                              })}
                              className="flex-1 sm:flex-none"
                            >
                              <XCircle className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Rechazar</span>
                            </Button>
                          </div>
                        )}
                        
                        {/* Botones adicionales para cancelar/eliminar */}
                        {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                                cancelReservationMutation.mutate(reservation.id);
                              }
                            }}
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            <Ban className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Cancelar</span>
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.')) {
                              deleteReservationMutation.mutate(reservation.id);
                            }
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReservation(reservation)}
                          className="sm:ml-auto"
                        >
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Ver Detalles</span>
                        </Button>
                      </div>
                    </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-6">
            <div className="space-y-6">
              {/* Upload from Device */}
              <Card>
                <CardHeader>
                  <CardTitle>Subir Imagen desde Dispositivo</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Sube una imagen directamente desde tu dispositivo
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="upload-title" className="block text-sm font-medium mb-2">
                          Título *
                        </label>
                        <Input
                          id="upload-title"
                          placeholder="Título de la imagen"
                        />
                      </div>
                      <div>
                        <label htmlFor="upload-order" className="block text-sm font-medium mb-2">
                          Orden de visualización
                        </label>
                        <Input
                          id="upload-order"
                          type="number"
                          defaultValue={0}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="upload-description" className="block text-sm font-medium mb-2">
                        Descripción (opcional)
                      </label>
                      <Textarea
                        id="upload-description"
                        placeholder="Descripción de la imagen"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="image-file" className="block text-sm font-medium mb-2">
                        Seleccionar imagen *
                      </label>
                      <input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo 5MB. Formatos: JPG, PNG, JPEG
                      </p>
                    </div>
                    
                    <Button
                      onClick={async () => {
                        const titleInput = document.getElementById('upload-title') as HTMLInputElement;
                        const descriptionInput = document.getElementById('upload-description') as HTMLTextAreaElement;
                        const orderInput = document.getElementById('upload-order') as HTMLInputElement;
                        const fileInput = document.getElementById('image-file') as HTMLInputElement;
                        
                        if (!titleInput.value.trim()) {
                          toast({
                            title: "Error",
                            description: "El título es requerido",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        if (!fileInput.files || fileInput.files.length === 0) {
                          toast({
                            title: "Error",
                            description: "Selecciona una imagen",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        const formData = new FormData();
                        formData.append('image', fileInput.files[0]);
                        formData.append('title', titleInput.value.trim());
                        formData.append('description', descriptionInput.value.trim());
                        formData.append('displayOrder', orderInput.value || '0');
                        
                        uploadGalleryImageMutation.mutate(formData);
                        
                        // Clear form
                        titleInput.value = '';
                        descriptionInput.value = '';
                        orderInput.value = '0';
                        fileInput.value = '';
                      }}
                      disabled={uploadGalleryImageMutation.isPending}
                      className="w-full"
                    >
                      {uploadGalleryImageMutation.isPending ? "Subiendo..." : "Subir Imagen"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Add via URL */}
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Imagen via URL</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Agrega una imagen usando una URL externa
                  </p>
                </CardHeader>
                <CardContent>
                  <Form {...galleryForm}>
                    <form onSubmit={galleryForm.handleSubmit((data) => addGalleryImageMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={galleryForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Título de la imagen" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={galleryForm.control}
                          name="displayOrder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Orden de visualización</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={galleryForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de la imagen</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://ejemplo.com/imagen.jpg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={galleryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción (opcional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Descripción de la imagen" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={addGalleryImageMutation.isPending}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Imagen
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Imágenes de la Galería</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryImages?.map((image: any) => (
                      <div key={image.id} className="border rounded-lg overflow-hidden">
                        <img 
                          src={image.imageUrl} 
                          alt={image.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold">{image.title}</h3>
                          {image.description && (
                            <p className="text-sm text-charcoal/70 mt-1">{image.description}</p>
                          )}
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-charcoal/50">Orden: {image.displayOrder}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteGalleryImageMutation.mutate(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Nueva Reseña</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...reviewForm}>
                    <form onSubmit={reviewForm.handleSubmit((data) => addReviewMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={reviewForm.control}
                          name="guestName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del huésped</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Nombre completo" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={reviewForm.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calificación</FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar calificación" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <SelectItem key={rating} value={rating.toString()}>
                                        {"★".repeat(rating)} ({rating})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={reviewForm.control}
                          name="displayOrder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Orden</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={reviewForm.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comentario</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Escribe el comentario de la reseña..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={addReviewMutation.isPending}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Reseña
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reseñas Existentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews?.map((review: any) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{review.guestName}</h3>
                              <div className="text-yellow-500">
                                {"★".repeat(review.rating)}
                              </div>
                              <Badge variant={review.isApproved ? "default" : "secondary"}>
                                {review.isApproved ? "Aprobada" : "Pendiente"}
                              </Badge>
                            </div>
                            <p className="text-charcoal/80">{review.comment}</p>
                            <p className="text-xs text-charcoal/50 mt-2">Orden: {review.displayOrder}</p>
                          </div>
                          <div className="flex gap-2">
                            {!review.isApproved && (
                              <Button
                                size="sm"
                                onClick={() => updateReviewMutation.mutate({ 
                                  id: review.id, 
                                  updates: { isApproved: true } 
                                })}
                              >
                                Aprobar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteReviewMutation.mutate(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Test Tab */}
          <TabsContent value="emails" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Prueba de Sistema de Correos
                  </CardTitle>
                  <p className="text-sm text-charcoal/70">
                    Prueba el sistema de doble ruta de correos (SendGrid/Gmail API) para verificar la entregabilidad.
                  </p>
                </CardHeader>
                <CardContent>
                  <Form {...emailTestForm}>
                    <form onSubmit={emailTestForm.handleSubmit((data) => testEmailMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={emailTestForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email de Destino</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="ejemplo@hotmail.com, test@gmail.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailTestForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asunto</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Asunto del correo de prueba" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailTestForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensaje</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Contenido del mensaje de prueba"
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={testEmailMutation.isPending}>
                        <Mail className="h-4 w-4 mr-2" />
                        {testEmailMutation.isPending ? "Enviando..." : "Enviar Correo de Prueba"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Test Confirmation Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Prueba de Correo de Confirmación
                  </CardTitle>
                  <p className="text-sm text-charcoal/70">
                    Prueba específicamente el correo que se envía cuando se confirma una reserva.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email de Destino</label>
                      <Input 
                        type="email" 
                        id="confirmationTestEmail"
                        placeholder="jacobopp.27@outlook.com"
                        className="mb-4"
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        const emailInput = document.getElementById('confirmationTestEmail') as HTMLInputElement;
                        const email = emailInput?.value;
                        
                        if (!email) {
                          toast({
                            title: "Error",
                            description: "Por favor ingresa un email",
                            variant: "destructive",
                          });
                          return;
                        }

                        try {
                          const response = await apiRequest("POST", "/api/admin/test-confirmation", { email });
                          const result = await response.json();
                          
                          if (result.success) {
                            toast({
                              title: "Correo de confirmación enviado",
                              description: `Enviado exitosamente a ${email}`,
                            });
                          } else {
                            toast({
                              title: "Error al enviar",
                              description: result.message || "No se pudo enviar el correo",
                              variant: "destructive",
                            });
                          }
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Error al probar correo de confirmación",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enviar Correo de Confirmación de Prueba
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">SendGrid</h3>
                        <p className="text-sm text-blue-700">
                          Usado como servicio principal para máxima entregabilidad
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 mb-2">Gmail API</h3>
                        <p className="text-sm text-yellow-700">
                          Usado para hotmail.com, outlook.com, live.com, msn.com para mejor entregabilidad
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-charcoal/70">
                      <p><strong>Fallback automático:</strong> Si el servicio principal falla, se intenta con el alternativo.</p>
                      <p><strong>Logs:</strong> Revisa la consola del servidor para ver qué servicio se utilizó para cada envío.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const allReservations = (reservations as any[]) || [];
                    // Filter only approved and pending reservations for calendar
                    const filteredReservations = allReservations.filter((reservation: any) => 
                      reservation.status === 'confirmed' || reservation.status === 'pending'
                    );
                    
                    // Group reservations by date
                    const reservationsByDate = filteredReservations.reduce((acc: any, reservation: any) => {
                      const checkInDate = reservation.checkIn;
                      if (!acc[checkInDate]) {
                        acc[checkInDate] = [];
                      }
                      acc[checkInDate].push(reservation);
                      return acc;
                    }, {});

                    // Define cabin colors
                    const cabinColors = {
                      'Cielo': 'bg-blue-500 text-white',
                      'Eclipse': 'bg-purple-500 text-white', 
                      'Aurora': 'bg-green-500 text-white'
                    };

                    const today = new Date();
                    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                    const dates = [];
                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                      dates.push(new Date(d));
                    }

                    // Add empty cells for the first week
                    const firstDayOfWeek = startDate.getDay();
                    const emptyCells = Array(firstDayOfWeek).fill(null);

                    return (
                      <div>
                        <div className="text-lg font-semibold mb-4 text-center">
                          {today.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {/* Header */}
                          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="text-center font-semibold text-charcoal/70 p-2">
                              {day}
                            </div>
                          ))}
                          
                          {/* Empty cells for first week */}
                          {emptyCells.map((_, index) => (
                            <div key={`empty-${index}`} className="min-h-[80px]"></div>
                          ))}
                          
                          {/* Calendar days */}
                          {dates.map((date) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayReservations = reservationsByDate[dateStr] || [];
                            const isToday = date.toDateString() === today.toDateString();
                            
                            return (
                              <div
                                key={dateStr}
                                className={`min-h-[80px] p-2 border rounded-lg ${
                                  isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="text-sm font-medium text-charcoal/80 mb-1">
                                  {date.getDate()}
                                </div>
                                <div className="space-y-1">
                                  {dayReservations.slice(0, 2).map((reservation: any) => (
                                    <div
                                      key={reservation.id}
                                      className={`text-xs p-1 rounded text-white ${
                                        reservation.status === 'pending' 
                                          ? 'bg-yellow-500' 
                                          : cabinColors[reservation.cabin?.name as keyof typeof cabinColors] || 'bg-gray-500'
                                      }`}
                                      title={`${reservation.guestName} - ${reservation.status}`}
                                    >
                                      {reservation.guestName.split(' ')[0]}
                                    </div>
                                  ))}
                                  {dayReservations.length > 2 && (
                                    <div className="text-xs text-charcoal/60">
                                      +{dayReservations.length - 2} más
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Leyenda de colores */}
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-center mb-3">Leyenda del Calendario</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                                <span className="text-sm">Pendientes de Aprobación</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Reservas Aprobadas:</h5>
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                                <span className="text-sm">Cabaña Cielo</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                                <span className="text-sm">Cabaña Eclipse</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                                <span className="text-sm">Cabaña Aurora</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de Reserva - {selectedReservation.confirmationCode}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Información del Huésped</h4>
                  <p><strong>Nombre:</strong> {selectedReservation.guestName}</p>
                  <p><strong>Email:</strong> {selectedReservation.guestEmail}</p>
                  <p><strong>Huéspedes:</strong> {selectedReservation.guests}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Información de la Reserva</h4>
                  <p><strong>Fechas:</strong> {selectedReservation.checkIn} - {selectedReservation.checkOut}</p>
                  <p><strong>Cabaña:</strong> {selectedReservation.cabin?.name || 'N/A'}</p>
                  <p><strong>Total:</strong> ${selectedReservation.totalPrice.toLocaleString()} COP</p>
                  <p><strong>Estado:</strong> {getStatusBadge(selectedReservation.status)}</p>
                </div>
              </div>
              
              {selectedReservation.paymentInstructions && (
                <div>
                  <h4 className="font-semibold">Instrucciones de Pago</h4>
                  <pre className="text-sm bg-gray-100 p-3 rounded whitespace-pre-wrap">
                    {selectedReservation.paymentInstructions}
                  </pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}