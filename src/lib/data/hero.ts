import { db } from '@/lib/db'
import type { HeroData } from '@/types/portfolio'

export async function getHeroData(): Promise<HeroData | null> {
  const result = await db.hero.findFirst()

  if (result === null) {
    return null
  }

  return {
    name: result.name,
    title: result.title,
    tagline: result.tagline,
    ctaLabel: result.ctaLabel,
    ctaHref: result.ctaHref,
  }
}
