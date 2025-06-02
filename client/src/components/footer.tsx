export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-forest text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-montserrat font-bold text-xl mb-4">
              <svg className="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z"/>
                <path d="M9 17V9h2v8"/>
              </svg>
              Wilderness Retreat
            </div>
            <p className="text-white/80">
              Experience luxury glamping in the heart of nature. Book your escape today.
            </p>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white/80">
              <li>
                <button 
                  onClick={() => scrollToSection('overview')}
                  className="hover:text-white transition-colors text-left"
                >
                  Overview
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('amenities')}
                  className="hover:text-white transition-colors text-left"
                >
                  Amenities
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('gallery')}
                  className="hover:text-white transition-colors text-left"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('reviews')}
                  className="hover:text-white transition-colors text-left"
                >
                  Reviews
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Policies</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Cancellation Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pet Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-white/80">
              <li>(555) 123-4567</li>
              <li>reservations@wildernessretreat.com</li>
              <li>123 Mountain View Trail</li>
              <li>Forest Valley, CA 95001</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2023 Wilderness Retreat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
