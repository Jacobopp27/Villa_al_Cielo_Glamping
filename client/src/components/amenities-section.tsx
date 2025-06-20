import { Wifi, Waves, UtensilsCrossed, ShowerHead, Activity, Car } from "lucide-react";

const amenities = [
  {
    icon: Wifi,
    title: "Wi-Fi Gratuito",
    description: "Mantente conectado con acceso a internet de alta velocidad durante tu estadía."
  },
  {
    icon: Waves,
    title: "Jacuzzi",
    description: "Relájate en el jacuzzi privado mientras disfrutas de las vistas panorámicas y la naturaleza."
  },
  {
    icon: UtensilsCrossed,
    title: "Cocina Exterior",
    description: "Cocina exterior completamente equipada con parrilla y área de comedor."
  },
  {
    icon: ShowerHead,
    title: "Baño Privado",
    description: "Baño privado limpio con ducha caliente y productos ecológicos."
  },
  {
    icon: Activity,
    title: "Malla Catamarán",
    description: "Disfruta de momentos de relajación en nuestra malla catamarán con vistas espectaculares."
  },
  {
    icon: Car,
    title: "Estacionamiento Gratuito",
    description: "Estacionamiento conveniente en el sitio para tu vehículo durante la estadía."
  }
];

export default function AmenitiesSection() {
  return (
    <section id="amenities" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-4xl text-navy mb-4">
            Conexión con la Naturaleza
          </h2>
          <p className="text-xl text-charcoal max-w-2xl mx-auto">
            Disfruta de todas las comodidades necesarias para una experiencia de tranquilidad total en Barbosa, Antioquia
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((amenity, index) => {
            const IconComponent = amenity.icon;
            return (
              <div key={index} className="bg-light-gold rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="text-white w-6 h-6" />
                </div>
                <h3 className="font-montserrat font-semibold text-lg text-navy mb-2">
                  {amenity.title}
                </h3>
                <p className="text-charcoal">
                  {amenity.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
