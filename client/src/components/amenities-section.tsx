import { Wifi, Flame, UtensilsCrossed, ShowerHead, Footprints, Car } from "lucide-react";

const amenities = [
  {
    icon: Wifi,
    title: "Free Wi-Fi",
    description: "Stay connected with high-speed internet access throughout your stay."
  },
  {
    icon: Flame,
    title: "Fire Pit",
    description: "Gather around the fire pit for evening stories and s'mores under the stars."
  },
  {
    icon: UtensilsCrossed,
    title: "Outdoor Kitchen",
    description: "Fully equipped outdoor kitchen with grill and dining area."
  },
  {
    icon: ShowerHead,
    title: "Private Bathroom",
    description: "Clean, private bathroom with hot shower and eco-friendly toiletries."
  },
  {
    icon: Footprints,
    title: "Hiking Trails",
    description: "Direct access to scenic hiking trails and nature walks."
  },
  {
    icon: Car,
    title: "Free Parking",
    description: "Convenient on-site parking for your vehicle during your stay."
  }
];

export default function AmenitiesSection() {
  return (
    <section id="amenities" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-4xl text-forest mb-4">
            What We Offer
          </h2>
          <p className="text-xl text-charcoal max-w-2xl mx-auto">
            Everything you need for a comfortable and memorable outdoor experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((amenity, index) => {
            const IconComponent = amenity.icon;
            return (
              <div key={index} className="bg-cream rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-forest rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="text-white w-6 h-6" />
                </div>
                <h3 className="font-montserrat font-semibold text-lg text-forest mb-2">
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
