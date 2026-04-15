import { CvDownloadButton } from '@/components/ui/CvDownloadButton';
import TerminalFrame from '@/components/theme/TerminalFrame';
import type { HeroData } from '@/types/portfolio';

interface HeroSectionProps {
  data: HeroData | null;
}

export default async function HeroSection({ data }: HeroSectionProps) {
  if (data === null) {
    return null;
  }

  return (
    <section
      aria-labelledby="hero-heading"
      className="terminal-section flex min-h-[calc(100vh-4.5rem)] items-center"
      id="hero"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
        <div className="max-w-3xl">
          <p className="terminal-kicker">&gt; init public-portfolio</p>
          <h1 className="terminal-heading terminal-text-glow" id="hero-heading">
            {data.headline}
          </h1>
          <p className="terminal-subheading">
            terminal-style public experience // recruiter-first hierarchy
          </p>
        </div>
        <p className="mt-6 max-w-2xl terminal-copy">{data.subHeadline}</p>
        <div className="flex flex-wrap gap-4">
           <a className="terminal-button-primary focus-ring" href={data.ctaHref}>
              {data.ctaText}
            </a>
          <CvDownloadButton className="terminal-button-secondary focus-ring" />
        </div>

        <TerminalFrame
          title="~/public/hero.session"
          label="live"
          className="max-w-xl lg:ml-auto"
          contentClassName="space-y-4 font-mono text-sm text-terminal-copy"
        >
          <div className="space-y-2">
            <div className="flex gap-3 text-accent">
              <span className="text-primary">$</span>
              <span>whoami</span>
            </div>
            <p className="pl-6 text-foreground">{data.headline}</p>
          </div>

          <div className="space-y-2">
            <div className="flex gap-3 text-accent">
              <span className="text-primary">$</span>
              <span>cat summary.txt</span>
            </div>
            <p className="pl-6 terminal-copy">{data.subHeadline}</p>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Primary action
            </p>
            <p className="mt-2 text-base text-foreground">{data.ctaText}</p>
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}
