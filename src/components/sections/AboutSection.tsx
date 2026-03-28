import type { AboutData } from '@/types/portfolio'

interface AboutSectionProps {
  data: AboutData | null
}

export default function AboutSection({ data }: AboutSectionProps) {
  if (data === null) {
    return null
  }

  return (
    <section aria-labelledby="about-heading" className="px-6 py-16 md:py-24" id="about">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-3xl font-bold text-gray-900" id="about-heading">
          About
        </h2>
        {data.bio.split('\n\n').map((paragraph) => (
          <p className="mb-4 text-lg leading-relaxed text-gray-700" key={paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
