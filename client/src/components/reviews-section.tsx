const reviews = [
  {
    rating: 5,
    text: "Absolutely incredible experience! The tent was luxurious and the views were breathtaking. Perfect balance of nature and comfort.",
    author: "Sarah Johnson",
    date: "September 2023",
    initials: "SJ"
  },
  {
    rating: 5,
    text: "The perfect getaway! Amazing amenities, gorgeous location, and exceptional service. We'll definitely be back!",
    author: "Mike Thompson",
    date: "August 2023",
    initials: "MT"
  },
  {
    rating: 5,
    text: "Outstanding glamping experience! Clean, comfortable, and surrounded by incredible natural beauty. Highly recommend!",
    author: "Emily Rodriguez",
    date: "October 2023",
    initials: "ER"
  }
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-4xl text-forest mb-4">
            Guest Reviews
          </h2>
          <p className="text-xl text-charcoal">
            What our guests say about their experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-cream rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-400 mr-2">
                  {Array(review.rating).fill(0).map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-charcoal font-semibold">{review.rating}.0</span>
              </div>
              <p className="text-charcoal mb-4 italic">
                "{review.text}"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">{review.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-charcoal">{review.author}</div>
                  <div className="text-sm text-gray-500">{review.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
