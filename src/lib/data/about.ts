import { db } from '@/lib/db';
import type { ProfileData } from '@/types/portfolio';

export async function getProfileData(): Promise<ProfileData | null> {
  try {
    const result = await db.profile.findUniqueOrThrow({
      where: { singletonKey: 'singleton' },
    });

    return {
      fullName: result.fullName,
      tagline: result.tagline,
      bio: result.bio,
    };
  } catch {
    return null;
  }
}
