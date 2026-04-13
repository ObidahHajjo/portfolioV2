import TerminalFrame from '@/components/theme/TerminalFrame';
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
    <section className="terminal-section" id="testimonials">
      <div className="mx-auto max-w-6xl">
        <TerminalFrame title="~/public/testimonials.log" label="Testimonials">
          <h2 className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">What People Say</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}

export default TestimonialsSection;
