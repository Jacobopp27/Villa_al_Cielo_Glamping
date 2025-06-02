import { useState } from "react";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="font-montserrat font-bold text-xl text-forest flex items-center">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 100 100" fill="none">
                {/* Montañas en el fondo */}
                <path d="M0 70 L20 50 L40 65 L60 45 L80 60 L100 40 L100 100 L0 100 Z" fill="#2D5A27"/>
                {/* Montañas medias */}
                <path d="M0 80 L15 60 L35 75 L55 55 L75 70 L100 50 L100 100 L0 100 Z" fill="#8B4513" opacity="0.8"/>
                {/* Sol/Luna */}
                <circle cx="80" cy="25" r="12" fill="#D4B896"/>
                {/* Carpa glamping */}
                <path d="M35 85 L50 70 L65 85 Z" fill="#D4B896"/>
                <path d="M40 85 L50 75 L60 85 Z" fill="#8B4513"/>
                {/* Árboles */}
                <circle cx="25" cy="85" r="8" fill="#2D5A27"/>
                <circle cx="75" cy="82" r="6" fill="#2D5A27"/>
                <rect x="23" y="85" width="4" height="10" fill="#8B4513"/>
                <rect x="73" y="82" width="3" height="8" fill="#8B4513"/>
              </svg>
              Villa al Cielo
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Descripción
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Amenidades
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Galería
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Reseñas
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Contacto
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-forest"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button 
                onClick={() => scrollToSection('overview')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Descripción
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Amenidades
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Galería
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Reseñas
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Contacto
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
