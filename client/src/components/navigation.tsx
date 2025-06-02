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
            <div className="font-montserrat font-bold text-xl text-navy flex items-center">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 100 100" fill="none">
                <defs>
                  <radialGradient id="logoGlow" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4"/>
                    <stop offset="80%" stopColor="#FFD700" stopOpacity="0.1"/>
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                
                {/* Resplandor de fondo */}
                <circle cx="50" cy="50" r="48" fill="url(#logoGlow)"/>
                
                {/* Círculo exterior principal */}
                <circle cx="50" cy="50" r="32" stroke="#FFD700" strokeWidth="1.5" fill="none"/>
                
                {/* Triángulo principal con líneas estructurales como en la imagen */}
                <g stroke="#FFD700" strokeWidth="1" fill="none">
                  {/* Triángulo exterior */}
                  <path d="M50 25 L68 62 L32 62 Z"/>
                  
                  {/* Línea horizontal que divide el triángulo */}
                  <line x1="38" y1="50" x2="62" y2="50"/>
                  
                  {/* Línea vertical desde el vértice superior */}
                  <line x1="50" y1="25" x2="50" y2="62"/>
                  
                  {/* Líneas internas que forman la estructura como en la imagen */}
                  <line x1="44" y1="37.5" x2="44" y2="50"/>
                  <line x1="56" y1="37.5" x2="56" y2="50"/>
                  
                  {/* Líneas horizontales internas */}
                  <line x1="44" y1="37.5" x2="56" y2="37.5"/>
                  
                  {/* Base del triángulo dividida */}
                  <line x1="41" y1="56" x2="50" y2="56"/>
                  <line x1="50" y1="56" x2="59" y2="56"/>
                </g>
              </svg>
              Villa al Cielo
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-charcoal hover:text-navy transition-colors cursor-pointer"
              >
                Descripción
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="text-charcoal hover:text-navy transition-colors cursor-pointer"
              >
                Amenidades
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="text-charcoal hover:text-navy transition-colors cursor-pointer"
              >
                Galería
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="text-charcoal hover:text-navy transition-colors cursor-pointer"
              >
                Reseñas
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-charcoal hover:text-navy transition-colors cursor-pointer"
              >
                Contacto
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-navy"
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
                className="block text-charcoal hover:text-navy transition-colors w-full text-left px-3 py-2"
              >
                Descripción
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="block text-charcoal hover:text-navy transition-colors w-full text-left px-3 py-2"
              >
                Amenidades
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="block text-charcoal hover:text-navy transition-colors w-full text-left px-3 py-2"
              >
                Galería
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="block text-charcoal hover:text-navy transition-colors w-full text-left px-3 py-2"
              >
                Reseñas
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block text-charcoal hover:text-navy transition-colors w-full text-left px-3 py-2"
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
