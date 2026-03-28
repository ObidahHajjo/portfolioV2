import Header from '@/components/layout/Header'
import AboutSection from '@/components/sections/AboutSection'
import HeroSection from '@/components/sections/HeroSection'
import { getAboutData } from '@/lib/data/about'
import { getHeroData } from '@/lib/data/hero'
import type { NavLink } from '@/types/portfolio'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [hero, about] = await Promise.all([getHeroData(), getAboutData()])
  const navLinks: NavLink[] = []

  if (about !== null) {
    navLinks.push({ label: 'About', anchor: 'about' })
  }

  return (
    <>
      <Header developerName={hero?.name ?? ''} navLinks={navLinks} />
      <main id="main-content">
        <HeroSection data={hero} />
        <AboutSection data={about} />
      </main>
    </>
  )
}
