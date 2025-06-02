import img3300 from "@assets/IMG_3300.jpeg";
import img3301 from "@assets/IMG_3301.jpeg";
import img3302 from "@assets/IMG_3302.jpeg";
import img3303 from "@assets/IMG_3303.jpeg";
import img3304 from "@assets/IMG_3304.jpeg";
import img3306 from "@assets/IMG_3306.jpeg";
import img3307 from "@assets/IMG_3307.jpeg";
import img3308 from "@assets/IMG_3308.jpeg";

const galleryImages = [
  {
    src: img3300,
    alt: "Villa al Cielo - Vista exterior de la experiencia glamping de lujo"
  },
  {
    src: img3301,
    alt: "Interior lujoso y acogedor de Villa al Cielo"
  },
  {
    src: img3302,
    alt: "Área de descanso premium con vistas naturales"
  },
  {
    src: img3303,
    alt: "Espacio exterior elegante y cómodo"
  },
  {
    src: img3304,
    alt: "Detalles de lujo accesible en Villa al Cielo"
  },
  {
    src: img3306,
    alt: "Amenidades exclusivas del glamping"
  },
  {
    src: img3307,
    alt: "Entorno natural privilegiado"
  },
  {
    src: img3308,
    alt: "Experiencia completa de glamping de lujo"
  }
];

export default function GallerySection() {
  return (
    <section id="gallery" className="py-12 bg-light-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-4xl text-navy mb-4">
            Galería
          </h2>
          <p className="text-xl text-charcoal">
            Mira lo que te espera en Villa al Cielo
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="rounded-lg shadow-md w-full h-48 object-cover hover:transform hover:scale-105 transition-transform cursor-pointer"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
