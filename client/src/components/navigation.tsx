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
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8"/>
                    <stop offset="70%" stopColor="#FFD700" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700"/>
                    <stop offset="100%" stopColor="#FFA500"/>
                  </linearGradient>
                </defs>
                
                {/* Resplandor de fondo */}
                <circle cx="50" cy="50" r="45" fill="url(#glow)"/>
                
                {/* Círculo exterior */}
                <circle cx="50" cy="50" r="35" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.8"/>
                
                {/* Triángulo principal */}
                <path d="M50 20 L70 60 L30 60 Z" fill="url(#triangleGradient)" stroke="#FFD700" strokeWidth="1"/>
                
                {/* División horizontal del triángulo */}
                <line x1="35" y1="50" x2="65" y2="50" stroke="#FFD700" strokeWidth="1"/>
                
                {/* División vertical del triángulo */}
                <line x1="50" y1="35" x2="50" y2="60" stroke="#FFD700" strokeWidth="1"/>
                
                {/* Líneas interiores del triángulo */}
                <line x1="42.5" y1="35" x2="42.5" y2="50" stroke="#FFD700" strokeWidth="0.8" opacity="0.7"/>
                <line x1="57.5" y1="35" x2="57.5" y2="50" stroke="#FFD700" strokeWidth="0.8" opacity="0.7"/>
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
