import { getPublishedTestimonials, getSectionVisibility } from '@/lib/content/queries';
import { TestimonialCard } from './TestimonialCard';

export async function TestimonialsSection() {
  const [testimonials, visibility] = await Promise.all([
    getPublishedTestimonials(),
    getSectionVisibility('testimonials'),
  ]);

  if (!visibility?.enabled || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16" id="testimonials">
      <div className="container">
        <h2 className="text-2xl font-bold">What People Say</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
