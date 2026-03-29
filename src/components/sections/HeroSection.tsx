import type { HeroData } from '@/types/portfolio';

interface HeroSectionProps {
  data: HeroData | null;
}

export default function HeroSection({ data }: HeroSectionProps) {
  if (data === null) {
    return null;
  }

  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 px-6 py-24 text-white"
      id="hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.92))]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-200">
            Public Portfolio
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
            {data.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-sky-100 sm:text-2xl">
            {data.subHeadline}
          </p>
        </div>
        <div>
          <a
            className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            href={data.ctaHref}
          >
            {data.ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}
