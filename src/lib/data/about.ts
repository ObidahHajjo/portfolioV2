import { db } from '@/lib/db'
import type { AboutData } from '@/types/portfolio'

export async function getAboutData(): Promise<AboutData | null> {
  const result = await db.about.findFirst()

  if (result === null) {
    return null
  }

  return {
    bio: result.bio,
  }
}
