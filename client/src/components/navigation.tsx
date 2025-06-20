import { useState } from "react";
import logoImage from "@assets/2FBEB0F9-A0D5-48AA-BC3F-36E0DFEE51C3.png";

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
    <nav className="bg-nature-olive/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="font-montserrat font-bold text-xl flex items-center text-black">
              <img 
                src={logoImage} 
                alt="Villa al Cielo Logo" 
                className="w-8 h-8 mr-2 rounded-full"
              />
              VILLA AL CIELO
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-nature-background hover:text-nature-sand transition-colors cursor-pointer font-medium"
              >
                Descripción
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="text-nature-background hover:text-nature-sand transition-colors cursor-pointer font-medium"
              >
                Amenidades
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="text-nature-background hover:text-nature-sand transition-colors cursor-pointer font-medium"
              >
                Galería
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="text-nature-background hover:text-nature-sand transition-colors cursor-pointer font-medium"
              >
                Reseñas
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-nature-background hover:text-nature-sand transition-colors cursor-pointer font-medium"
              >
                Contacto
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-nature-background hover:text-nature-sand transition-colors"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-nature-olive border-t border-nature-sand">
              <button 
                onClick={() => scrollToSection('overview')}
                className="block text-nature-background hover:text-nature-sand transition-colors w-full text-left px-3 py-2 font-medium"
              >
                Descripción
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="block text-nature-background hover:text-nature-sand transition-colors w-full text-left px-3 py-2 font-medium"
              >
                Amenidades
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="block text-nature-background hover:text-nature-sand transition-colors w-full text-left px-3 py-2 font-medium"
              >
                Galería
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="block text-nature-background hover:text-nature-sand transition-colors w-full text-left px-3 py-2 font-medium"
              >
                Reseñas
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block text-nature-background hover:text-nature-sand transition-colors w-full text-left px-3 py-2 font-medium"
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
