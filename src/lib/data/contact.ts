import { db } from '@/lib/db';
import type { SocialLinkData } from '@/types/portfolio';

export async function getSocialLinks(): Promise<SocialLinkData[]> {
  try {
    const links = await db.socialLink.findMany({
      where: {
        published: true,
        isVisible: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return links.map((link) => ({
      platform: link.platform,
      url: link.url,
      displayOrder: link.displayOrder,
    }));
  } catch (error) {
    console.error('Failed to fetch social links:', error);
    return [];
  }
}
