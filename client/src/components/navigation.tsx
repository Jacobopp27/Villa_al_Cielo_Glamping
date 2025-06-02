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
            <div className="font-montserrat font-bold text-xl text-forest">
              <svg className="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                <path d="M9 17V9h2v8"/>
              </svg>
              Wilderness Retreat
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Overview
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Amenities
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Gallery
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Reviews
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-charcoal hover:text-forest transition-colors cursor-pointer"
              >
                Contact
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
                Overview
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Amenities
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Gallery
              </button>
              <button 
                onClick={() => scrollToSection('reviews')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Reviews
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block text-charcoal hover:text-forest transition-colors w-full text-left px-3 py-2"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
