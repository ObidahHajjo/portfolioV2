import TerminalFrame from '@/components/theme/TerminalFrame';
import type { ProfileData } from '@/types/portfolio';

interface AboutSectionProps {
  data: ProfileData | null;
}

export default function AboutSection({ data }: AboutSectionProps) {
  if (data === null) {
    return null;
  }

  return (
    <section aria-labelledby="about-heading" className="terminal-section" id="about">
      <div className="mx-auto max-w-4xl">
        <TerminalFrame title="~/public/about.md" label="About">
          {data.tagline ? <p className="terminal-kicker">{data.tagline}</p> : null}
          <h2 className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]" id="about-heading">
            About
          </h2>
          <div className="terminal-prose mt-6">
            {data.bio.split('\n\n').map((paragraph, index) => (
              <p className="terminal-copy" key={index}>
                {paragraph}
              </p>
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}
