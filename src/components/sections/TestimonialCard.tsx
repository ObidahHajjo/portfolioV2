import type { Testimonial } from '@prisma/client';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <blockquote className="rounded-lg border bg-card p-6">
      <p className="text-lg leading-relaxed text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
      <footer className="mt-4 flex items-center gap-3">
        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.authorName}
            className="size-10 rounded-full object-cover"
          />
        ) : null}
        <div>
          <cite className="not-italic font-semibold text-foreground">{testimonial.authorName}</cite>
          <p className="text-sm text-muted-foreground">
            {testimonial.authorRole}
            {testimonial.authorCompany ? ` · ${testimonial.authorCompany}` : ''}
          </p>
        </div>
      </footer>
    </blockquote>
  );
}
