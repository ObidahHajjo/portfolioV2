import { CvDownloadButton } from '@/components/ui/CvDownloadButton';
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
      className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 px-6 py-24 text-white"
      id="hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.92))]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="max-w-3xl">
          <h1
            className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl"
            id="hero-heading"
          >
            {data.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-sky-100 sm:text-2xl">
            {data.subHeadline}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <CvDownloadButton className="min-h-11 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 hover:bg-sky-100 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" />
        </div>
      </div>
    </section>
  );
}
