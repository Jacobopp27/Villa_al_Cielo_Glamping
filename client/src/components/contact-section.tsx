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
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="font-montserrat font-bold text-xl text-forest mb-6">Ponte en Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="text-forest mr-4 w-5 h-5" />
                <span>Barbosa, Antioquia, Colombia</span>
              </div>
              <div className="flex items-center">
                <Phone className="text-forest mr-4 w-5 h-5" />
                <span>+57 310 824 9004</span>
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
                <a 
                  href="https://www.facebook.com/share/19T2YWh5Xh/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-white hover:bg-forest/90 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/villaalcielo?igsh=MXFyNnJzaWN1MTh3aQ==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-white hover:bg-forest/90 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
