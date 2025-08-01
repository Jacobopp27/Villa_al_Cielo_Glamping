export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-montserrat font-bold text-xl mb-4">
              <svg className="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                <path d="M9 17V9h2v8"/>
              </svg>
              Villa al Cielo
            </div>
            <p className="text-white/80">
              Experimenta glamping de lujo en el corazón de la naturaleza. Reserva tu escape hoy.
            </p>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-white/80">
              <li>
                <button 
                  onClick={() => scrollToSection('overview')}
                  className="hover:text-white transition-colors text-left"
                >
                  Descripción
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('amenities')}
                  className="hover:text-white transition-colors text-left"
                >
                  Amenidades
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('gallery')}
                  className="hover:text-white transition-colors text-left"
                >
                  Galería
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('reviews')}
                  className="hover:text-white transition-colors text-left"
                >
                  Reseñas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('policies')}
                  className="hover:text-white transition-colors text-left"
                >
                  Políticas
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-2 text-white/80">
              <li>+57 310 502 3711</li>
              <li>admin@villaalcielo.com</li>
              <li>Barbosa, Antioquia</li>
              <li>Colombia</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2023 Villa al Cielo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
