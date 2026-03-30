import Header from '@/components/layout/Header';
import AboutSection from '@/components/sections/AboutSection';
import HeroSection from '@/components/sections/HeroSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ArticlesSection from '@/components/sections/ArticlesSection';
import OpenSourceSection from '@/components/sections/OpenSourceSection';
import TalksSection from '@/components/sections/TalksSection';
import { getProfileData } from '@/lib/data/about';
import { getHeroData } from '@/lib/data/hero';
import type { NavLink } from '@/types/portfolio';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [hero, profile] = await Promise.all([getHeroData(), getProfileData()]);
  const navLinks: NavLink[] = [];

  if (profile !== null) {
    navLinks.push({ label: 'About', anchor: 'about' });
  }

  return (
    <>
      <Header developerName={profile?.fullName ?? ''} navLinks={navLinks} />
      <main id="main-content">
        <HeroSection data={hero} />
        <AboutSection data={profile} />
        <TestimonialsSection />
        <ArticlesSection />
        <OpenSourceSection />
        <TalksSection />
      </main>
    </>
  );
}
