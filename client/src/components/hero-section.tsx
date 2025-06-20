

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
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-nature-beige via-nature-background to-nature-sand">
      {/* Patrón de textura sutil para darle profundidad */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="nature-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="#6b705c" opacity="0.3"/>
              <circle cx="15" cy="15" r="1" fill="#cb997e" opacity="0.2"/>
              <circle cx="45" cy="45" r="1" fill="#cb997e" opacity="0.2"/>
              <circle cx="45" cy="15" r="0.8" fill="#a5a58d" opacity="0.15"/>
              <circle cx="15" cy="45" r="0.8" fill="#a5a58d" opacity="0.15"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nature-pattern)"/>
        </svg>
      </div>
      
      <div className="relative z-10 text-center text-nature-text max-w-4xl mx-auto px-4">
        <h1 className="font-montserrat font-bold text-5xl md:text-7xl mb-6 leading-tight">
          Conexión, Tranquilidad<br />
          <span className="text-gold">y Naturaleza</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto">
          Vive una experiencia única en Villa al Cielo, ubicados en Barbosa, Antioquia. Reconecta contigo mismo en un entorno de pura tranquilidad natural.
        </p>
        <div className="flex justify-center">
          <button 
            onClick={scrollToBooking}
            className="bg-navy hover:bg-navy/90 text-white px-8 py-4 rounded-lg font-montserrat font-semibold text-lg transition-all transform hover:scale-105"
          >
            Reservar desde $200.000 COP
          </button>
        </div>
      </div>
    </section>
  );
}
