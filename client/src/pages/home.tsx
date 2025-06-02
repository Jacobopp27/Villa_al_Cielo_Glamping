import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import BookingWidget from "@/components/booking-widget";
import AmenitiesSection from "@/components/amenities-section";
import GallerySection from "@/components/gallery-section";
import ReviewsSection from "@/components/reviews-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <HeroSection />
      <BookingWidget />
      
      {/* Property Overview Section */}
      <section id="overview" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="flex items-center text-yellow-400 mr-4">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-charcoal font-semibold">4.9 (127 reviews)</span>
              </div>
              
              <h2 className="font-montserrat font-bold text-4xl text-forest mb-6">
                Tienda Safari de Lujo con Vistas a la Montaña
              </h2>
              
              <div className="flex items-center text-charcoal mb-8 space-x-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-forest" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Hasta 2 huéspedes</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-forest" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  <span>2 habitaciones</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-forest" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                  </svg>
                  <span>Baño privado</span>
                </div>
              </div>
              
              <p className="text-lg text-charcoal leading-relaxed mb-8">
                Sumérgete en la naturaleza sin sacrificar comodidad en nuestra tienda safari de lujo. Con vistas panorámicas a la montaña, ropa de cama premium y todas las amenidades que necesitas para una experiencia de glamping inolvidable. Despierta con amaneceres impresionantes y duerme bajo un manto de estrellas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Mountain landscape view from glamping site" 
                  className="rounded-xl shadow-lg w-full h-64 object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Luxury glamping tent interior" 
                  className="rounded-xl shadow-lg w-full h-64 object-cover"
                />
              </div>
            </div>
            
            {/* Mobile Booking Form */}
            <div className="lg:hidden bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-montserrat font-bold text-xl text-forest mb-4">Reserva tu Escape</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-forest mb-2">$299</div>
                <div className="text-charcoal">por noche</div>
              </div>
              <button className="w-full bg-forest hover:bg-forest/90 text-white py-4 rounded-lg font-montserrat font-semibold text-lg mt-4 transition-all">
                Verificar Disponibilidad
              </button>
            </div>
          </div>
        </div>
      </section>

      <AmenitiesSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
