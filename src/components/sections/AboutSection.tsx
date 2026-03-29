import type { ProfileData } from '@/types/portfolio';

interface AboutSectionProps {
  data: ProfileData | null;
}

export default function AboutSection({ data }: AboutSectionProps) {
  if (data === null) {
    return null;
  }

  return (
    <section aria-labelledby="about-heading" className="px-6 py-16 md:py-24" id="about">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-3xl font-bold text-gray-900" id="about-heading">
          About
        </h2>
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          {data.tagline}
        </p>
        {data.bio.split('\n\n').map((paragraph, index) => (
          <p className="mb-4 text-lg leading-relaxed text-gray-700" key={index}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
