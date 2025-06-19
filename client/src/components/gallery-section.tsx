import { useQuery } from "@tanstack/react-query";

export default function GallerySection() {
  const { data: galleryImages = [] } = useQuery({
    queryKey: ["/api/gallery"],
    retry: false,
  });

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
          {(galleryImages as any[]).map((image: any, index: number) => (
            <img
              key={image.id || index}
              src={image.imageUrl}
              alt={image.title || image.description}
              loading="lazy"
              className="rounded-lg shadow-md w-full h-48 object-cover hover:transform hover:scale-105 transition-transform cursor-pointer"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
