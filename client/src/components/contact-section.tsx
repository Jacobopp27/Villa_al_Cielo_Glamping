import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-4xl text-forest mb-4">
            Ubicación y Contacto
          </h2>
          <p className="text-xl text-charcoal">
            Encuéntranos en el corazón de la naturaleza
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="font-montserrat font-bold text-xl text-forest mb-6">Ponte en Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="text-forest mr-4 w-5 h-5" />
                  <span>123 Sendero Vista Montaña, Valle del Bosque, CA 95001</span>
                </div>
                <div className="flex items-center">
                  <Phone className="text-forest mr-4 w-5 h-5" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="text-forest mr-4 w-5 h-5" />
                  <span>reservas@villaalcielo.com</span>
                </div>
                <div className="flex items-center">
                  <Clock className="text-forest mr-4 w-5 h-5" />
                  <span>Entrada: 3:00 PM | Salida: 11:00 AM</span>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-montserrat font-semibold text-lg text-forest mb-4">Síguenos</h4>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-white hover:bg-forest/90 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-white hover:bg-forest/90 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-white hover:bg-forest/90 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div 
              className="bg-gray-300 rounded-xl h-96 flex items-center justify-center text-charcoal relative" 
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="bg-white/90 rounded-lg p-4 backdrop-blur-sm">
                <MapPin className="text-forest text-2xl mb-2 mx-auto" />
                <div className="text-center">
                  <div className="font-semibold text-forest">Villa al Cielo</div>
                  <div className="text-sm text-charcoal">Sendero Vista Montaña</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
