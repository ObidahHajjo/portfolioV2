import { db } from '@/lib/db';
import type { HeroData } from '@/types/portfolio';

export async function getHeroData(): Promise<HeroData | null> {
  try {
    const result = await db.hero.findUniqueOrThrow({
      where: { singletonKey: 'singleton' },
    });

    return {
      headline: result.headline,
      subHeadline: result.subHeadline,
      ctaText: result.ctaText,
      ctaHref: result.ctaHref,
    };
  } catch {
    return null;
  }
}
