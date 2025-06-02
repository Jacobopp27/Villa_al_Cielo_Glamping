export default function HeroSection() {
  const scrollToBooking = () => {
    const bookingElement = document.querySelector('[data-booking-widget]');
    if (bookingElement) {
      bookingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToGallery = () => {
    const galleryElement = document.getElementById('gallery');
    if (galleryElement) {
      galleryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`
        }}
      />
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="font-montserrat font-bold text-5xl md:text-7xl mb-6 leading-tight">
          Escapa al Lujo<br />
          <span className="text-gold">de la Naturaleza</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto">
          Experimenta la perfecta combinación de aventura al aire libre y lujo cómodo en nuestras tiendas glamping premium
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={scrollToBooking}
            className="bg-navy hover:bg-navy/90 text-white px-8 py-4 rounded-lg font-montserrat font-semibold text-lg transition-all transform hover:scale-105"
          >
            Reservar Ahora
          </button>
          <button 
            onClick={scrollToGallery}
            className="border-2 border-white text-white hover:bg-white hover:text-charcoal px-8 py-4 rounded-lg font-montserrat font-semibold text-lg transition-all"
          >
            Ver Galería
          </button>
        </div>
      </div>
    </section>
  );
}
